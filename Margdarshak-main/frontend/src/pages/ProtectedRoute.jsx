import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // if no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // otherwise render protected content
  return children;
}
