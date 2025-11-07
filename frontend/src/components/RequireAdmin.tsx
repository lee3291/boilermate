import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { JSX } from "react";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  // Not logged in → redirect to sign in
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Logged in but not admin → redirect to homepage or 403 page
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // Admin → allow access
  return children;
}
