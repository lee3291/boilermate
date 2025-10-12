"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Search } from "lucide-react"

interface Marker {
    address: string
    lat: number
    lng: number
}

export default function ListingMap() {
    const mapRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [markers, setMarkers] = useState<Marker[]>([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [map, setMap] = useState<any>(null)

    useEffect(() => {
        if (window.google?.maps) {
            setIsLoaded(true)
            initMap()
            return
        }

        const script = document.createElement("script")
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
            console.error("Google Maps API key is missing in .env")
            return
        }

        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => {
            setIsLoaded(true)
            initMap()
        }
        document.head.appendChild(script)
    }, [])

    const initMap = () => {
        if (!mapRef.current || !window.google) return

        const gMap = new window.google.maps.Map(mapRef.current, {
            center: { lat: 37.7749, lng: -122.4194 }, // default San Francisco
            zoom: 5,
        })
        setMap(gMap)

        if (inputRef.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ["geocode"],
                fields: ["formatted_address", "geometry", "name"],
            })

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace()
                if (!place.geometry?.location) return

                const lat = place.geometry.location.lat()
                const lng = place.geometry.location.lng()
                const address = place.formatted_address || place.name || ""

                // Add marker
                new window.google.maps.Marker({
                    position: { lat, lng },
                    map: gMap,
                    title: address,
                })

                setMarkers((prev) => [...prev, { address, lat, lng }])

                gMap.panTo({ lat, lng })
                gMap.setZoom(12)
            })
        }
    }

    return (
        <div className="w-full h-screen flex flex-col relative">
            {/* Search Box */}
            <div className="p-4 bg-white z-10 shadow-md flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search any location..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    disabled={!isLoaded}
                />
            </div>

            {/* Map */}
            <div ref={mapRef} className="flex-1" />

            {/* Marker List */}
            {markers.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-4 max-w-xs w-full">
                    <p className="font-semibold text-gray-700 mb-2">Searched Locations:</p>
                    <ul className="space-y-1 max-h-40 overflow-y-auto">
                        {markers.map((m, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-gray-600">{m.address}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

// Extend window for TypeScript
declare global {
    interface Window {
        google: any
    }
}
