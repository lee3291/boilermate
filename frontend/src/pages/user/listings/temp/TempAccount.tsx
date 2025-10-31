import { useUser } from "./UserContext";
import { useState } from "react";

export default function TempAccount() {
    const { user, login, logout } = useUser();
    const [tempUser, setTempUser] = useState(user?.username || '');

    const handleLogin = () => {
        // This is a mock login. In a real app, you'd get a token from a server.
        const mockToken = btoa(JSON.stringify({ sub: 'user-123', email: 'test@example.com', username: tempUser }));
        login(mockToken);
    };

    return (
        <div className="p-4">
            <label className="block text-sm mb-1">Username</label>
            <div className="flex gap-2">
                <input
                    value={tempUser}
                    onChange={(e) => setTempUser(e.target.value)}
                    placeholder="Enter a username"
                    className="border rounded px-3 py-2 flex-1"
                    />
                <button onClick={handleLogin} className="px-3 py-2 border rounded bg-blue-500 text-white">
                    Set User
                </button>
                <button onClick={logout} className="px-3 py-2 border rounded">
                    Clear
                </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">Current: {user?.username || "<none>"}</p>
            <a href="/listings" className="bg-white h-10 w-30 border-1 border-black">Back to listings</a>
        </div>
    );
}

