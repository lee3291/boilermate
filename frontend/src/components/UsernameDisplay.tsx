import { Link } from 'react-router-dom';
import { VerifiedBadge } from './VerifiedBadge';

// This type should be kept in sync with the user data returned from your API.
// It's defined here for clarity but could be imported from a central types file.
interface DisplayUser {
  name?: string | null;
  username?: string;
  email: string;
  isVerified?: boolean;
}

interface UsernameDisplayProps {
  user: DisplayUser;
  withLink?: boolean;
  className?: string;
}

export const UsernameDisplay = ({
  user,
  withLink,
  className,
}: UsernameDisplayProps) => {
  // Determine the best name to display, falling back from name to username to email.
  const displayName = user.name || user.username || user.email;

  const content = (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <span>{displayName}</span>
      {user.isVerified && <VerifiedBadge />}
    </div>
  );

  // If withLink is true and a username is available, wrap the content in a Link.
  if (withLink && user.username) {
    return (
      <Link to={`/profile/${user.username}`} className="hover:underline">
        {content}
      </Link>
    );
  }

  return content;
};
