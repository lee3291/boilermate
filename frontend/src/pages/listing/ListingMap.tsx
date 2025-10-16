import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

// Extend window for TypeScript
declare global {
    interface Window {
        google: typeof google | undefined
    }
}

interface RawMarker {
    title: string
    address: string
    pricing?: number
}

interface GeocodedMarker extends RawMarker {
    lat: number
    lng: number
}

// Load Google Maps script asynchronously
function loadGoogleMaps(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.google?.maps) return resolve()
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Failed to load Google Maps script"))
        document.head.appendChild(script)
    })
}

// Geocode an address
function getLocation(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!window.google?.maps?.Geocoder) {
        console.error("Google Maps Geocoder is not available")
        return Promise.resolve(null)
    }

    const geocoder = new window.google.maps.Geocoder()
    return new Promise((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
            console.log("Geocoding", address, status, results)
            if (status === window.google.maps.GeocoderStatus.OK && results?.[0]) {
                const loc = results[0].geometry.location
                resolve({ lat: loc.lat(), lng: loc.lng() })
            } else {
                console.warn(`Geocoding failed for "${address}": ${status}`)
                resolve(null)
            }
        })
    })
}

export default function ListingMap() {
    const mapRef = useRef<HTMLDivElement>(null)
    const [geocodedMarkers, setGeocodedMarkers] = useState<GeocodedMarker[]>([])
    const [failedMarkers, setFailedMarkers] = useState<RawMarker[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const rawMarkers: RawMarker[] = [
        { title: "Need roommate", address: "112 E Wood St, West Lafayette, IN", pricing: 600 },
        { title: "Hoho Apartment", address: "400 McCutcheon Drive, West Lafayette, IN", pricing: 200 },
        { title: "Burger House", address: "348 W State St, West Lafayette, IN 47906", pricing: 2343 },
    ]

    const initMap = async () => {
        if (!mapRef.current || !window.google) return

        try {
            const gMap = new window.google.maps.Map(mapRef.current, {
                center: { lat: 40.4229, lng: -86.909 },
                zoom: 14,
            })

            const coordsResults = await Promise.all(
                rawMarkers.map(async (m) => {
                    const loc = await getLocation(m.address)
                    return { raw: m, coords: loc }
                })
            )

            const successMarkers: GeocodedMarker[] = []
            const failed: RawMarker[] = []

            coordsResults.forEach(({ raw, coords }) => {
                if (coords) {
                    successMarkers.push({ ...raw, lat: coords.lat, lng: coords.lng })

                    const marker = new window.google.maps.Marker({
                        position: coords,
                        map: gMap,
                        title: raw.title,
                    })

                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `<div style="padding:4px;">
                        <strong style="font-size:16px;">${raw.title}</strong>
                        <p style="font-size:12px;">${raw.address}</p>
                        <p style="font-weight:bold; color:green; margin-top:4px;">Price: $${raw.pricing}</p>
                      </div>`,
                    })

                    marker.addListener("click", () => infoWindow.open(gMap, marker))
                } else {
                    failed.push(raw)
                }
            })

            setGeocodedMarkers(successMarkers)
            setFailedMarkers(failed)

            if (failed.length > 0) {
                console.warn("Some markers failed to geocode:", failed)
            }
        } catch (err) {
            console.error(err)
            setError("Failed to initialize map.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
            setError("Missing Google Maps API key")
            setLoading(false)
            return
        }

        loadGoogleMaps(apiKey)
            .then(initMap)
            .catch((err) => {
                console.error(err)
                setError("Failed to load Google Maps script")
                setLoading(false)
            })
    }, [])

    return (
        <div className="w-full h-screen flex flex-col relative">
            <div ref={mapRef} className="flex-1" />

            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-2xl p-4 max-w-xs w-full border border-gray-100">
                <p className="font-bold text-lg text-gray-800 mb-2 border-b pb-1">
                    Listings ({geocodedMarkers.length} Plotted)
                </p>

                {loading && <p className="text-sm text-gray-500">Loading map and markers...</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}

                {!loading && !error && (
                    <>
                        <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {geocodedMarkers.map((m, idx) => (
                                <li key={idx} className="flex items-start gap-2 border-l-2 border-green-500 pl-2">
                                    <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{m.title}</p>
                                        <span className="text-xs text-gray-500">{m.address}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {failedMarkers.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm font-semibold text-red-500">Failed to geocode:</p>
                                <ul className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                    {failedMarkers.map((m, idx) => (
                                        <li key={idx} className="text-xs text-red-500">
                                            {m.title} ({m.address})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
