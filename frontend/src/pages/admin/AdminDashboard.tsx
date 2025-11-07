import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const links = [
    {
      title: "User Reports",
      description: "View and manage all user misconduct reports.",
      path: "/user-reports",
      color: "from-pink-500 to-rose-400",
    },
    {
      title: "Bug Reports",
      description: "Track and resolve user-submitted issues.",
      path: "/admin/bug-dashboard",
      color: "from-purple-500 to-indigo-400",
    },
    {
      title: "Announcements",
      description: "Post important updates and send notifications.",
      path: "/announcements",
      color: "from-blue-500 to-cyan-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Admin Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Manage reports, announcements, and system activities.
        </p>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {links.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`bg-gradient-to-r ${item.color} text-white rounded-2xl shadow-lg p-6 hover:scale-[1.03] transition transform`}
            >
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <p className="text-sm text-white/90">{item.description}</p>
              <div className="mt-4 text-sm underline">Go to {item.title} →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
