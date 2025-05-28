import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isAdmin } from "../config/constants";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  // If still loading auth state, show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        <p className="ml-2 text-amber-600">Loading...</p>
      </div>
    );
  }

  // If user is not authenticated or not admin, redirect to home
  if (!user || !isAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated and is admin, render the children
  return children;
}

export default AdminRoute;
