import React, { useEffect, useState } from "react";


// Type matching your Prisma schema
type Announcement = {
 id: string;
 title: string;
 message: string;
 createdAt: string;
 updatedAt?: string;
 isActive: boolean;
};


// Backend API base
const API_URL = "http://localhost:3000/announcements";


export default function AnnouncementsDashboard() {
 const [announcements, setAnnouncements] = useState<Announcement[]>([]);
 const [title, setTitle] = useState("");
 const [message, setMessage] = useState("");
 const [editing, setEditing] = useState<Announcement | null>(null);
 const [statusMsg, setStatusMsg] = useState("");


 // ==============================
 // FETCH EXISTING ANNOUNCEMENTS
 // ==============================
 useEffect(() => {
   async function fetchAnnouncements() {
     try {
       const res = await fetch(API_URL);
       if (!res.ok) {
         throw new Error("Failed to fetch announcements");
       }


       const data = await res.json();
       setAnnouncements(data);
     } catch (err) {
       console.error(err);
       setStatusMsg("⚠️ Could not connect to server. Showing sample data.");


       // fallback sample data
       setAnnouncements([
         {
           id: "demo1",
           title: "Server Maintenance",
           message:
             "We will perform scheduled maintenance tonight at 11 PM.",
           createdAt: new Date().toISOString(),
           isActive: true,
         },
         {
           id: "demo2",
           title: "New Feature Release",
           message:
             "You can now view and track your reports directly from the dashboard.",
           createdAt: new Date().toISOString(),
           isActive: true,
         },
       ]);
     }
   }


   fetchAnnouncements();
 }, []);


 // ==============================
 // CREATE OR UPDATE ANNOUNCEMENT
 // ==============================
 async function handleSubmit(e: React.FormEvent) {
   e.preventDefault();


   if (!title.trim() || !message.trim()) {
     setStatusMsg("Please fill in both title and message.");
     return;
   }


   const payload = { title, message };
   let res;


   try {
     if (editing) {
       // If editing an existing announcement
       res = await fetch(`${API_URL}/${editing.id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload),
       });
     } else {
       // Otherwise, create a new announcement
       res = await fetch(API_URL, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload),
       });
     }


     if (!res.ok) {
       throw new Error("Request failed");
     }


     const data = await res.json();


     if (editing) {
       // Update local state with edited data
       setAnnouncements((prev) =>
         prev.map((a) => {
           if (a.id === editing.id) {
             return data;
           }
           return a;
         })
       );
       setStatusMsg("Announcement updated successfully!");
     } else {
       // Add new announcement to top
       setAnnouncements((prev) => [data, ...prev]);
       setStatusMsg("Announcement posted successfully!");
     }


     // Reset form
     setTitle("");
     setMessage("");
     setEditing(null);
   } catch (err) {
     console.error(err);
     setStatusMsg("Failed to post announcement.");
   }
 }


 // ==============================
 // DELETE ANNOUNCEMENT
 // ==============================
 async function handleDelete(id: string) {
   const confirmDelete = confirm("Are you sure you want to delete this announcement?");
   if (!confirmDelete) {
     return;
   }


   try {
     const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
     if (!res.ok) {
       throw new Error("Delete failed");
     }


     setAnnouncements((prev) => prev.filter((a) => a.id !== id));
     setStatusMsg(" Announcement deleted.");
   } catch (err) {
     console.error(err);
     setStatusMsg("Failed to delete announcement.");
   }
 }


 // ==============================
 // RENDER UI
 // ==============================
 let formTitle = "Create New Announcement";
 let submitButtonLabel = "Post Announcement";
 if (editing) {
   formTitle = "Edit Announcement";
   submitButtonLabel = "Update Announcement";
 }


 return (
<div className="p-8 min-h-screen bg-gray-50">
  <h2 className="text-2xl font-bold mb-6 text-center">
     Admin Announcement Dashboard
  </h2>

  {statusMsg && (
     <p className="text-center mb-4 text-blue-600">{statusMsg}</p>
  )}

  {/* FORM */}
  <form
     onSubmit={handleSubmit}
     className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6 mb-8"
  >
     <h3 className="text-lg font-semibold mb-4">{formTitle}</h3>

     <label className="block mb-2 font-medium">Title</label>
     <input
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        className="border p-2 w-full rounded mb-4"
        placeholder="Enter announcement title"
     />

     <label className="block mb-2 font-medium">Message</label>
     <textarea
        value={message}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
        className="border p-2 w-full rounded mb-4"
        rows={4}
        placeholder="Enter announcement details..."
     ></textarea>

     <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
     >
        {submitButtonLabel}
     </button>
  </form>

  {/* LIST */}
  <div className="max-w-3xl mx-auto">
     <h3 className="text-xl font-semibold mb-3">All Announcements</h3>

     <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
             <tr>
                <th className="border p-2 text-left">Title</th>
                <th className="border p-2 text-left">Message</th>
                <th className="border p-2 text-center">Created</th>
                <th className="border p-2 text-center">Actions</th>
             </tr>
          </thead>
          <tbody>
             {announcements.map((a: Announcement) => {
                return (
                  <tr key={a.id} className="hover:bg-blue-50 transition">
                     <td className="border p-2">{a.title}</td>
                     <td className="border p-2">{a.message}</td>
                     <td className="border p-2 text-center">
                        {new Date(a.createdAt).toLocaleString()}
                     </td>
                     <td className="border p-2 text-center">
                        <button
                          onClick={() => {
                             setEditing(a);
                             setTitle(a.title);
                             setMessage(a.message);
                          }}
                          className="text-blue-600 mr-2 hover:underline"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(a.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                     </td>
                  </tr>
                );
             })}

             {announcements.length === 0 && (
                <tr>
                  <td
                     colSpan={4}
                     className="p-4 text-center text-gray-500 italic"
                  >
                     No announcements found.
                  </td>
                </tr>
             )}
          </tbody>
        </table>
     </div>
  </div>
</div>
 );
}


