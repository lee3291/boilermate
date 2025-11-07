/**
 * BioSection Component
 * Section 2: User's biography/introduction
 * Clean card design with editable text area
 */

interface BioSectionProps {
  bio: string;
}

export default function BioSection({ bio }: BioSectionProps) {
  return (
    <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
      {/* Section Header */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">✨</span>
        <h2 className="text-2xl font-bold text-gray-800">About Me</h2>
      </div>

      {/* Bio Text */}
      <div className="rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 p-6 border border-pink-100">
        <p className="text-gray-700 leading-relaxed text-lg">
          {bio}
        </p>
      </div>

      {/* Edit Button (for future implementation) */}
      <div className="mt-4 flex justify-end">
        <button className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2 text-white font-medium shadow-md hover:shadow-lg transition-shadow">
          ✏️ Edit Bio
        </button>
      </div>
    </div>
  );
}
