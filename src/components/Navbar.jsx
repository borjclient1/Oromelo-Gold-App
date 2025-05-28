import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isAdmin } from "../config/constants";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";
import "../styles/navbar.css";

function Navbar() {
  const { user, signOut } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  function handleSignOut() {
    signOut().then(() => {
      navigate("/");
    });
  }

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  // Check if user is admin
  const userIsAdmin = isAdmin(user);

  // Add scroll event listener to detect when user scrolls
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }

    window.addEventListener("scroll", handleScroll);

    // Clean up event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 ${darkMode ? 'bg-dark-surface-1 text-white' : 'bg-gray-900 text-white'} shadow-md transition-all duration-200 ${
        scrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo />
            <div className="navbar-desktop ml-6 space-x-8">
              <Link
                to="/"
                className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/listings"
                className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium"
              >
                Listings
              </Link>
              {!user && (
                <>
                  <Link
                    to="/about"
                    className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium"
                  >
                    About Us
                  </Link>
                  <Link
                    to="/contact"
                    className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Contact
                  </Link>
                  <Link
                    to="/faq"
                    className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium"
                  >
                    FAQ
                  </Link>
                </>
              )}
              {user && (
                <>
                  {!userIsAdmin && (
                    <>
                      <Link
                        to="/sell-item"
                        className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Sell Item
                      </Link>
                      <Link
                        to="/pawn-item"
                        className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Pawn Item
                      </Link>
                    </>
                  )}
                  {userIsAdmin ? (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Admin Dashboard
                      </Link>
                      <Link
                        to="/admin/manage"
                        className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium"
                      >
                        My Listings
                      </Link>
                      <Link
                        to="/admin/inquiries"
                        className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Inquiries
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/my-items"
                      className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium"
                    >
                      My Items
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="navbar-desktop items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.user_metadata?.avatar_url && (
                  <Link to="/profile" className="block">
                    <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-gold">
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>
                )}
                <span className="text-gray-300 text-sm">
                  Hello, {user.user_metadata?.name || user.email}
                </span>
                <button onClick={handleSignOut} className="btn-primary">
                  Sign Out
                </button>
                <div className="flex items-center">
                  <ThemeToggle />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/signin" className="btn-primary">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-secondary">
                  Sign Up
                </Link>
                <div className="flex items-center">
                  <ThemeToggle />
                </div>
              </div>
            )}
          </div>
          <div className="navbar-mobile-toggle items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-400 hover:text-gold focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className={`navbar-mobile-menu shadow-lg`}>
          <div className="px-4 py-2">
            <Link
              to="/"
              className="mobile-nav-link text-gray-300 text-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/listings"
              className="mobile-nav-link text-gray-300 text-lg font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Listings
            </Link>
            {!user && (
              <>
                <Link
                  to="/about"
                  className="mobile-nav-link text-gray-300 text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  className="mobile-nav-link text-gray-300 text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/faq"
                  className="mobile-nav-link text-gray-300 text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </Link>
              </>
            )}
            {user && (
              <>
                {!userIsAdmin && (
                  <>
                    <Link
                      to="/sell-item"
                      className="mobile-nav-link text-gray-300 text-lg font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sell Item
                    </Link>
                    <Link
                      to="/pawn-item"
                      className="mobile-nav-link text-gray-300 text-lg font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Pawn Item
                    </Link>
                  </>
                )}
                {userIsAdmin ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="mobile-nav-link text-gray-300 text-lg font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/manage"
                      className="mobile-nav-link text-gray-300 text-lg font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/admin/inquiries"
                      className="mobile-nav-link text-gray-300 text-lg font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Inquiries
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/my-items"
                    className="mobile-nav-link text-gray-300 text-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Items
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="mobile-nav-link text-gray-300 text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              </>
            )}
          </div>
          <div className="mobile-nav-section flex justify-center">
            <ThemeToggle />
          </div>
          <div className="mobile-nav-section">
            {user ? (
              <div className="px-5 py-3 flex flex-col space-y-4 items-center">
                <div className="flex items-center justify-center space-x-3">
                  {user.user_metadata?.avatar_url && (
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gold">
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <span className="text-gray-300 text-base">
                    Hello, {user.user_metadata?.name || user.email}
                  </span>
                </div>
                <button onClick={handleSignOut} className="mobile-btn-gold w-full max-w-xs py-2 rounded-md">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="px-5 py-3 flex flex-col space-y-3 items-center">
                <Link
                  to="/signin"
                  className="mobile-btn-gold w-full max-w-xs py-2 rounded-md text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-secondary w-full max-w-xs py-2 rounded-md text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
