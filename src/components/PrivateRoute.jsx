import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

function PrivateRoute({ children }) {
  const { user, loading, inPasswordResetMode } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        <p className="ml-2 text-amber-600">Loading...</p>
      </div>
    );
  }

  // If the user is in password reset mode, redirect them to the update password page
  if (user && inPasswordResetMode && location.pathname !== '/update-password') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-dark-surface' : 'bg-gray-50'} flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className={`rounded-md ${darkMode ? 'bg-amber-900 bg-opacity-30 border-amber-700' : 'bg-amber-50 border-amber-400'} border-l-4 p-4 mb-6`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${darkMode ? 'text-amber-300' : 'text-amber-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                  Password Reset Required
                </h3>
                <div className={`mt-2 text-sm ${darkMode ? 'text-amber-200' : 'text-amber-700'}`}>
                  <p>
                    You need to complete your password reset before accessing other parts of the application.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      onClick={() => window.location.href = '/update-password'}
                      className={`px-2 py-1.5 rounded-md text-sm font-medium ${darkMode ? 'bg-amber-800 text-amber-100 hover:bg-amber-700' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                    >
                      Go to password reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default PrivateRoute;
