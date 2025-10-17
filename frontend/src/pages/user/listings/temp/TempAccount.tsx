import { useUser } from "./UserContext";

export default function TempAccount() {
    const { username, setUsername, clearUsername } = useUser();

    return (
        <div className="p-4">
            <label className="block text-sm mb-1">Username</label>
            <div className="flex gap-2">
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter a username"
                    className="border rounded px-3 py-2 flex-1"
                    />
                <button onClick={() => clearUsername()} className="px-3 py-2 border rounded">
                    Clear
                </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">Current: {username || "<none>"}</p>
            <a href="/listings" className="bg-white h-10 w-30 border-1 border-black">Back to listings</a>
        </div>
    );
}

