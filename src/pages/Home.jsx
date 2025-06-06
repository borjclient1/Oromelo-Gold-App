import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { isAdmin } from "../config/constants";
import React, { useState, useEffect, useRef } from "react";
import GoldPriceTracker from "../components/GoldPriceTracker";
import GoldParticles from "../components/GoldParticles";
import WavyDivider from "../components/WavyDivider";
import { getPopularListings } from "../services/listings-service";
import "../styles/kenburns.css";

function Home() {
  // Add viewport meta tag
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content =
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const { user } = useAuth();
  const { darkMode } = useTheme();
  const homeRef = useRef(null);
  const logoRef = useRef(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [popularListings, setPopularListings] = useState([]);
  const [popularListingsLoading, setPopularListingsLoading] = useState(true);
  const images = [
    { src: "/images/hero-bg.jpg", position: "center 20%" },
    { src: "/images/hero-bg2.jpg", position: "center 40%" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 8000); // Change image every 8 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (homeRef.current) {
      homeRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Oromelo logo scroll effect
  useEffect(() => {
    try {
      const handleScroll = () => {
        // Only apply scroll effect on desktop devices (screen width > 768px)
        if (logoRef.current) {
          const logoPosition = logoRef.current.getBoundingClientRect().top;
          const windowHeight = window.innerHeight;
          const logoHeight = logoRef.current.offsetHeight;

          // Calculate how much of the section is visible (0 to 1)
          const sectionInView = Math.max(
            0,
            Math.min(1, (windowHeight - logoPosition) / logoHeight)
          );

          // Calculate the horizontal position
          // When section is visible (0 < sectionInView < 1): move from right to left
          // When section is not visible (sectionInView <= 0): move to right edge
          const horizontalPosition =
            sectionInView > 0
              ? window.innerWidth * (1 - sectionInView)
              : window.innerWidth;

          // Apply the transform
          logoRef.current.style.transform = `translateX(${horizontalPosition}px)`;

          // Add/remove spin animation based on visibility
          const logoImg = logoRef.current.querySelector("img");
          if (logoImg) {
            if (sectionInView >= 1) {
              // Section is fully visible - add spin animation
              logoImg.style.animation = "spin 2s linear infinite";
            } else {
              // Section is not fully visible - remove spin animation
              logoImg.style.animation = "none";
              logoImg.style.transform = "rotate(0deg)";
            }
          }
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } catch (error) {
      console.error("Error in Home component:", error);
      setRenderError(error.message);
    }
  }, []);

  // Add mobile spin effect
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        // Add the mobile spin class
        const logoImg = logoRef.current.querySelector("img");
        if (logoImg) {
          logoImg.classList.add("mobile-spin");
        }
      } else {
        // Remove the mobile spin class
        const logoImg = logoRef.current.querySelector("img");
        if (logoImg) {
          logoImg.classList.remove("mobile-spin");
        }
      }
    };

    // Initial check
    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add mobile spin styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .mobile-spin {
        animation: spin 2s linear infinite;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Fetch popular listings
  useEffect(() => {
    const fetchPopularListings = async () => {
      setPopularListingsLoading(true);
      try {
        const { data, error } = await getPopularListings(3);
        if (error) throw error;
        setPopularListings(data || []);
      } catch (err) {
        console.error("Error fetching popular listings:", err);
      } finally {
        setPopularListingsLoading(false);
      }
    };

    fetchPopularListings();
  }, []);

  // Show a simple UI if there's an error
  const [renderError, setRenderError] = useState(null);
  if (renderError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-700 mb-4">{renderError}</p>
        <p className="text-gray-700 mb-4">
          Please try refreshing the page or contact support.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        ${darkMode ? "bg-dark-surface text-gray-100" : "bg-white text-gray-900"}
        overflow-x-hidden
      `}
    >
      {/* Hero Section with Parallax Effect */}
      <div
        className="relative bg-gray-900 overflow-hidden"
        style={{
          height: "100vh",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        {/* Gold Particles Effect */}
        <GoldParticles />
        <div className="absolute inset-0">
          <div className="w-full h-[120%] overflow-hidden">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentImage ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  className="w-full h-full object-cover opacity-60 ken-burns-element"
                  style={{ objectPosition: image.position }}
                  src={image.src}
                  alt="Luxurious gold jewelry collection"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/50"></div>
        <div className="relative flex flex-col justify-center items-center h-full min-w-full mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">
          <div className="transform transition duration-1000 ease-in-out">
            <h1
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl text-center w-full max-w-full"
              style={{
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                maxWidth: "100vw",
              }}
            >
              Oromelo <span className="gold-shimmer">Gold</span> Pawn
            </h1>
            <p
              className="mt-6 text-xl text-white text-center mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8"
              style={{
                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              Unlock the true value of your gold. Get instant cash through our
              secure selling service or flexible pawning options with
              industry-leading rates.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                isAdmin(user) ? (
                  <Link
                    to="/admin"
                    className="btn-primary text-center inline-block hover:scale-105 transition-transform"
                  >
                    Go to Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/pawn-item"
                    className="btn-primary text-center inline-block hover:scale-105 transition-transform"
                  >
                    Pawn Item
                  </Link>
                )
              ) : (
                <Link
                  to="/pawn-item"
                  className="btn-primary text-center inline-block hover:scale-105 transition-transform"
                >
                  Pawn Item
                </Link>
              )}
              {user && !isAdmin(user) ? (
                <Link
                  to="/sell-item"
                  className="btn-secondary text-center inline-block hover:scale-105 transition-transform"
                >
                  Sell Item
                </Link>
              ) : (
                !user && (
                  <Link
                    to="/sell-item"
                    className="btn-secondary text-center inline-block hover:scale-105 transition-transform"
                  >
                    Sell Item
                  </Link>
                )
              )}
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <a
              href="#features"
              className="animate-bounce w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Popular Listings Section */}
      <div className={darkMode ? "bg-dark-surface py-16" : "bg-white py-16"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2
              className={`text-3xl font-extrabold ${
                darkMode ? "text-gold" : "text-gray-900"
              } sm:text-4xl`}
            >
              Featured Items
            </h2>
            <p
              className={`mt-4 max-w-2xl text-xl ${
                darkMode ? "text-gray-200" : "text-gray-500"
              } mx-auto`}
            >
              Check out our featured gold collection
            </p>
          </div>

          {popularListingsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-amber-400' : 'border-amber-600'}`}></div>
            </div>
          ) : popularListings.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {popularListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listing/${listing.id}`}
                  className={`group ${darkMode ? "bg-dark-surface-2 hover:bg-dark-surface-3" : "bg-white hover:bg-gray-50"} overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 relative h-64">
                    {/* Crown icon for most liked */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${darkMode ? "bg-amber-400 text-black" : "bg-amber-600 text-white"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium">{listing.likeCount} likes</span>
                      </div>
                    </div>
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {listing.title}
                    </h3>
                    <div className="mt-1 flex justify-between items-center">
                      <p className={`text-lg font-bold ${darkMode ? "text-amber-400" : "text-amber-600"}`}>
                        ₱{listing.price?.toLocaleString()}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
                        {listing.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={`text-center py-16 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <p>No popular listings available at the moment.</p>
              <Link to="/listings" className="mt-4 inline-block btn-primary text-sm hover:scale-105 transition-transform">
                Browse all listings
              </Link>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/listings"
              className="btn-primary inline-flex items-center hover:scale-105 transition-transform"
            >
              View All Listings
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Gold Price Tracker Section */}
      <div
        className={darkMode ? "bg-dark-surface-1 py-12" : "bg-gray-50 py-12"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2
              className={`text-3xl font-extrabold ${
                darkMode ? "text-gold" : "text-gray-900"
              } sm:text-4xl`}
            >
              Today's Gold Price
            </h2>
            <p
              className={`mt-4 max-w-2xl text-xl ${
                darkMode ? "text-gray-200" : "text-gray-500"
              } mx-auto`}
            >
              Stay updated with real-time gold prices to make informed decisions
            </p>
          </div>
          <div className="max-w-lg mx-auto">
            {user ? (
              <GoldPriceTracker />
            ) : (
              <div
                className={`${
                  darkMode
                    ? "bg-dark-surface-2 border-gray-700"
                    : "bg-white border-gray-200"
                } shadow-md rounded-lg overflow-hidden border`}
              >
                <div
                  className={`${
                    darkMode ? "bg-gold bg-opacity-80" : "bg-gold bg-opacity-90"
                  } px-6 py-4 text-center`}
                >
                  <h3
                    className={`text-xl font-bold ${
                      darkMode ? "text-gray-900" : "text-gray-900"
                    }`}
                  >
                    Current Gold Price
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-800" : "text-gray-700"
                    }`}
                  >
                    Sign in to see real-time gold prices
                  </p>
                </div>
                <div className="p-6 text-center">
                  <Link
                    to="/signin"
                    className="inline-block btn-primary text-sm px-4 py-2"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Oromelo Summary Section */}
      <div
        className={`py-16 px-4 sm:px-6 lg:px-8 ${
          darkMode ? "bg-dark-surface" : "bg-gray-900"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="md:text-left text-center">
              <h2 className="text-3xl font-bold text-gold mb-4">
                About Oromelo
              </h2>
              <p className="text-gray-300 mb-6">
                OroMelo is a modern, community-based online pawnshop built on
                trust, transparency, and security. We aim to make pawning and
                buying gold more accessible, fair, and convenient — whether
                you're looking to unlock cash from your jewelry or invest in
                real value.
              </p>
              <p className="text-gray-300 mb-8">
                Every item entrusted to us is securely stored in a bank vault,
                and all transactions are handled with honesty and care. We're
                proudly rooted in the Philippines and committed to helping
                Filipinos grow their savings and protect their valuables.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-gold hover:bg-amber-700"
              >
                Learn More
              </Link>
            </div>
            <div className="relative" ref={logoRef}>
              <img
                src="/images/oromelo.png"
                alt="Oromelo Logo"
                className={`w-full h-auto rounded-lg transform transition-transform duration-300 ease-in-out ${
                  window.innerWidth <= 768 ? "mobile-spin" : ""
                }`}
              />
            </div>
          </div>
        </div>
      </div>
      <WavyDivider darkMode={darkMode} />

      {/* Features Section */}
      <div
        id="features"
        className={darkMode ? "py-16 bg-dark-surface-2" : "py-16 bg-white"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              className={`text-3xl font-extrabold ${
                darkMode ? "text-white" : "text-gray-900"
              } sm:text-4xl`}
            >
              Why Choose Oromelo?
            </h2>
            <p
              className={`mt-4 max-w-2xl text-xl ${
                darkMode ? "text-gray-300" : "text-gray-500"
              } mx-auto`}
            >
              OroMelo is a trusted online pawnshop where you can safely and
              discreetly pawn your gold and jewelry.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div
                className={
                  darkMode
                    ? "bg-dark-surface-3 p-6 rounded-lg"
                    : "bg-gray-50 p-6 rounded-lg"
                }
              >
                <div className="w-12 h-12 rounded-md bg-gold flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3
                  className={`mt-4 text-lg font-medium ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  Secured Storage
                </h3>
                <p
                  className={`mt-2 text-base ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  All items are securely stored in our bank's Safe Deposit Box
                  (SDB) vault, safeguarded by strict safety protocols.
                </p>
              </div>

              <div
                className={
                  darkMode
                    ? "bg-dark-surface-3 p-6 rounded-lg"
                    : "bg-gray-50 p-6 rounded-lg"
                }
              >
                <div className="w-12 h-12 rounded-md bg-gold flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                    />
                  </svg>
                </div>
                <h3
                  className={`mt-4 text-lg font-medium ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  Fair Rates
                </h3>
                <p
                  className={`mt-2 text-base ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  We offer competitive rates based on real-time gold pricing. No
                  surprises.
                </p>
              </div>

              <div
                className={
                  darkMode
                    ? "bg-dark-surface-3 p-6 rounded-lg"
                    : "bg-gray-50 p-6 rounded-lg"
                }
              >
                <div className="w-12 h-12 rounded-md bg-gold flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3
                  className={`mt-4 text-lg font-medium ${
                    darkMode ? "text-gold" : "text-gray-900"
                  }`}
                >
                  Customer-First Experience
                </h3>
                <p
                  className={`mt-2 text-base ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Zero upfront charges and a hassle-free process from start to
                  finish.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DTI Certificate Section */}
      <div
        className={`py-12 px-4 sm:px-6 lg:px-8 ${
          darkMode ? "bg-dark-surface" : "bg-gray-900"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-amber-400">
              Officially Registered Business
            </h2>
            <p className="mt-2 text-sm md:text-lg text-gray-300">
              Department of Trade and Industry (DTI) Certificate No. 7119864
            </p>
          </div>
          <div className="flex justify-center">
            <div className="max-w-2xl p-6 rounded-lg shadow-lg bg-gray-800 border border-amber-700">
              <img
                src="/images/DTI.png"
                alt="DTI Certificate of Business Name Registration for OROMELO PAWNSHOP (REGIONAL)"
                className="max-w-full h-auto mx-auto"
              />
              <div className="mt-6 text-center">
                <p className="text-gray-300 mb-1">
                  <span className="text-gold font-bold">Business Name:</span>{" "}
                  OROMELO PAWNSHOP
                </p>
                <p className="text-gray-300 mb-1">
                  <span className="text-gold font-bold">Owner:</span> Erm
                  Policarpio
                </p>

                <p className="text-gray-300 italic mt-4 text-sm">
                  This business is registered in compliance with Act 3883, Act
                  4147 and Republic Act No. 863
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div
        className={darkMode ? "py-16 bg-dark-surface-1" : "py-16 bg-gray-50"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              className={`text-3xl font-extrabold ${
                darkMode ? "text-white" : "text-gray-900"
              } sm:text-4xl`}
            >
              How It Works
            </h2>
            <p
              className={`mt-4 max-w-2xl text-xl ${
                darkMode ? "text-gray-300" : "text-gray-500"
              } mx-auto`}
            >
              Simple steps to sell or pawn your gold items
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gold flex items-center justify-center">
                  <span className="text-black font-bold">1</span>
                </div>
                <h3
                  className={`mt-4 text-lg font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Create an Account
                </h3>
                <p
                  className={`mt-2 text-base ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Sign up and create your profile in just a few minutes
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gold flex items-center justify-center">
                  <span className="text-black font-bold">2</span>
                </div>
                <h3
                  className={`mt-4 text-lg font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  List Your Gold Item
                </h3>
                <p
                  className={`mt-2 text-base ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Choose to sell or pawn your gold and provide item details
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gold flex items-center justify-center">
                  <span className="text-black font-bold">3</span>
                </div>
                <h3
                  className={`mt-4 text-lg font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Get Evaluation
                </h3>
                <p
                  className={`mt-2 text-base ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Our team will review your listing and provide fair market
                  evaluation
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gold flex items-center justify-center">
                  <span className="text-black font-bold">4</span>
                </div>
                <h3
                  className={`mt-4 text-lg font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Complete Transaction
                </h3>
                <p
                  className={`mt-2 text-base ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Meet at your preferred location and time to complete the
                  transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className={darkMode ? "bg-dark-surface" : "bg-gray-900"}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-center lg:text-left">
            <span className="block">Turn your gold into cash</span>
            <span className="block">
              <span className="gold-shimmer">Sell or pawn with confidence</span>
            </span>
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row lg:mt-0 lg:flex-shrink-0 gap-3 justify-center">
            {user ? (
              isAdmin(user) ? (
                <div className="inline-flex w-full sm:w-auto">
                  <Link
                    to="/admin"
                    className={`btn-primary text-center w-full sm:w-auto ${
                      darkMode ? "hover:bg-amber-600" : ""
                    }`}
                  >
                    Go to Admin Dashboard
                  </Link>
                </div>
              ) : (
                <>
                  <div className="inline-flex w-full sm:w-auto">
                    <Link
                      to="/pawn-item"
                      className={`btn-primary text-center w-full sm:w-auto ${
                        darkMode ? "hover:bg-amber-600" : ""
                      }`}
                    >
                      Pawn Your Item
                    </Link>
                  </div>
                  <div className="inline-flex w-full sm:w-auto">
                    <Link
                      to="/sell-item"
                      className={`${
                        darkMode ? "shadow-gold-900/20" : ""
                      } btn-secondary text-center w-full sm:w-auto border-2 border-yellow-300 shadow-md hover:shadow-lg`}
                      style={{
                        boxShadow: darkMode
                          ? "0 2px 8px rgba(255, 215, 0, 0.3)"
                          : "0 2px 4px rgba(255, 215, 0, 0.2)",
                      }}
                    >
                      Sell Your Item
                    </Link>
                  </div>
                </>
              )
            ) : (
              <Link
                to="/signup"
                className="btn-gold text-center w-full sm:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-900 bg-gold hover:bg-yellow-400"
              >
                Create an Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
