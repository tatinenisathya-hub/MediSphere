import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { user, token, loading } = useAuth();

  // Wait until the authentication state is restored.
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check the token and user separately.
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check the user's role.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;