import { useEffect, useRef, useState} from "react"
import { fetchListings } from "../../services/listingMapService";

// Extend window for TypeScript
declare global {
    interface Window {
        google: typeof google | undefined
    }
}

interface RawMarker {
    title: string
    location: string
    price?: number
}


// Load Google Maps
function loadGoogleMaps(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.google?.maps) {
            return resolve()
        }
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
    const [rawMarkers, setRawMarkers] = useState<RawMarker[]>([])

    const initMap = async (markers: RawMarker[]) => {
        if (!mapRef.current || !window.google) return

        const gMap = new window.google.maps.Map(mapRef.current, {
            center: { lat: 40.4229, lng: -86.909 },
            zoom: 14,
        })

        const coordsResults = await Promise.all(
            markers.map(async (m) => {
                const loc = await getLocation(m.location)
                return { raw: m, coords: loc }
            })
        )

        coordsResults.forEach(({ raw, coords }) => {
            if (!coords) return

            const marker = new window.google.maps.Marker({
                position: coords,
                map: gMap,
                title: raw.title,
            })

            const infoWindow = new window.google.maps.InfoWindow({
                content: `<div style="padding:4px;">
                    <strong style="font-size:16px;">${raw.title}</strong>
                    <p style="font-size:12px;">${raw.location}</p>
                    <p style="font-weight:bold; color:green; margin-top:4px;">Price: $${raw.price}</p>
                  </div>`,
            })
            marker.addListener("click", () => infoWindow.open(gMap, marker))
        })
    }

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        if (!apiKey) return

        loadGoogleMaps(apiKey)
            .then(async () => {
                const listings = await fetchListings()
                setRawMarkers(listings)
                initMap(listings)
            })
            .catch((err) => console.error(err))
    }, [])

    return (
        <div className="w-full h-screen flex flex-col relative">
            <div ref={mapRef} className="flex-1" />
        </div>
    )
}

