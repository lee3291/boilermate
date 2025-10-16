export interface ListingBasicInfo {
    title: string
    location: string
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