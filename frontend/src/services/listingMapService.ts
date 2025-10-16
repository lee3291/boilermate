export interface ListingBasicInfo {
    title: string
    location: string
    pricing: number
}

export interface Marker {
    title: string
    address: string
    lat: number
    lng: number
    pricing: number
}

export const fetchListings = async (): Promise<ListingBasicInfo[]> => {
    try {
        const response = await fetch("http://localhost:3000/listing", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) {
            throw new Error("Failed to fetch listings")
        }

        return await response.json()
    } catch (err) {
        console.error("Error fetching listings:", err)
        return []
    }
}

// Show markers
export const geocodeListings = async (listings: ListingBasicInfo[]): Promise<Marker[]> => {
    if (!window.google?.maps?.Geocoder) {
        console.error("Google Maps not loaded")
        return []
    }

    const geocoder = new window.google.maps.Geocoder()
    const results: Marker[] = []

    for (const listing of listings) {
        try {
            const geo = await new Promise<any>((resolve, reject) => {
                geocoder.geocode({ address: listing.location }, (res: any, status: string) => {
                    if (status === "OK" && res[0]) {
                        resolve(res[0])
                    }
                    else reject(status)
                })
            })
            results.push({
                title: listing.title,
                address: listing.location,
                lat: geo.geometry.location.lat(),
                lng: geo.geometry.location.lng(),
                pricing: listing.pricing,
            })
        } catch (err) {
            console.warn(`Failed to geocode ${listing.location}:`, err)
        }
    }
    return results
}
