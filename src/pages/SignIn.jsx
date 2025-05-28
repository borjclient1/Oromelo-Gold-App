import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

export default function SignIn() {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        setError(error.message || "Failed to sign in");
        setLoading(false);
      } else {
        // Navigate to the home page after successful sign in (regardless of where they came from)
        navigate("/", { replace: true });
      }
    } catch (error) {
      setError(error.message || "Failed to sign in");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        setError(error.message || "An error occurred during Google sign-in");
        setLoading(false);
      } else {
        // The page will be redirected by Supabase OAuth flow to the callback URL
        // We do not need to call navigate() here as the browser will be redirected
      }
    } catch (error) {
      setError(error.message || "An error occurred during Google sign-in");
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark-surface' : 'bg-gray-50'} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${darkMode ? 'text-gold' : 'text-gray-900'}`}>
          Sign in to your account
        </h2>
        <p className={`mt-2 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Or{" "}
          <Link
            to="/signup"
            className={`font-medium ${darkMode ? 'text-gold hover:text-gold-300' : 'text-gold hover:text-yellow-500'}`}
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`${darkMode ? 'bg-dark-surface-2 border border-dark-surface-4' : 'bg-white'} py-8 px-4 shadow sm:rounded-lg sm:px-10`}>
          {error && (
            <div className={`${darkMode ? 'bg-red-900 bg-opacity-30 border-red-700' : 'bg-red-50 border-red-400'} border-l-4 p-4 mb-6`}>
              <div className="flex">
                <div className="ml-3">
                  <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`${darkMode 
                    ? 'bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400' 
                    : 'border-gray-300 focus:ring-gold focus:border-gold'} 
                    w-full px-3 py-2 border shadow-sm rounded-md`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`${darkMode 
                    ? 'bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400' 
                    : 'border-gray-300 focus:ring-gold focus:border-gold'}
                    w-full px-3 py-2 border shadow-sm rounded-md`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className={`h-4 w-4 ${darkMode 
                    ? 'text-gold focus:ring-gold border-gray-600 bg-dark-surface-3' 
                    : 'text-gold focus:ring-gold border-gray-300'} rounded`}
                />
                <label
                  htmlFor="remember-me"
                  className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className={`font-medium ${darkMode ? 'text-gold hover:text-gold-300' : 'text-gold hover:text-yellow-500'}`}
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gold hover:bg-yellow-500 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out ${
                  loading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${darkMode ? 'bg-dark-surface-2 text-gray-400' : 'bg-white text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className={`w-full inline-flex justify-center py-2 px-4 border ${darkMode 
                  ? 'border-gray-600 bg-dark-surface-3 text-gray-200 hover:bg-dark-surface-4' 
                  : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100'} 
                  rounded-md shadow-sm text-sm font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold`}
              >
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
