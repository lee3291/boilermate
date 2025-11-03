/**
 * ProfileHeader Component
 * Section 1: Displays user's profile picture, name, and personal information
 * Tinder-inspired card design with gradient background
 */

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    age: number;
    major: string;
    year: string;
    profileImage: string;
  };
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-2xl">
      <div className="p-8">
        <div className="flex items-start gap-6">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={user.profileImage}
                alt={user.name}
                className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full border-4 border-white bg-green-500" />
            </div>
          </div>

          {/* Name and Info */}
          <div className="flex-1 text-white">
            <h1 className="text-4xl font-bold mb-2">
              {user.name}, {user.age}
            </h1>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <span className="text-lg font-medium">{user.major}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span className="text-lg">{user.year} Year</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <span className="text-lg">Purdue University</span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="hidden md:block flex-shrink-0">
            <div className="rounded-xl bg-white/20 backdrop-blur-sm p-4 border border-white/30">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">92%</div>
                <div className="text-sm text-white/80">Profile Complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
