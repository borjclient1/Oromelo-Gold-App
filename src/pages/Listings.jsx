import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getListings, toggleLike } from "../services/listings-service";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const Listings = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState({});
  const listingsRef = React.useRef(null);

  // Scroll to top when the component mounts
  React.useEffect(() => {
    if (listingsRef.current) {
      listingsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  const [filters, setFilters] = useState({
    category: "",
    purity: "",
    minPrice: "",
    maxPrice: "",
    minWeight: "",
    maxWeight: "",
    gold_origin: "",
    gold_color: "",
    dateFrom: "",
    dateTo: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      // Add sorting parameters to the filters
      const queryParams = {
        ...filters,
        sortBy,
        sortOrder,
      };

      const { data, error } = await getListings(queryParams);
      if (error) throw error;
      setListings(data || []);

      // Initialize user likes
      if (user) {
        const likesMap = {};
        data.forEach((listing) => {
          likesMap[listing.id] = listing.user_has_liked || false;
        });
        setUserLikes(likesMap);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  const applyFilters = () => {
    fetchListings();
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      purity: "",
      minPrice: "",
      maxPrice: "",
      minWeight: "",
      maxWeight: "",
      gold_origin: "",
      gold_color: "",
      dateFrom: "",
      dateTo: "",
    });
    setSortBy("created_at");
    setSortOrder("desc");
  };

  const handleLikeToggle = async (listingId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login or show login modal
      return;
    }

    try {
      const { data, error } = await toggleLike(listingId, user.id);
      if (error) throw error;

      // Update the like count in the listings array
      setListings((prevListings) =>
        prevListings.map((listing) =>
          listing.id === listingId
            ? {
                ...listing,
                likeCount:
                  data?.count !== undefined ? data.count : listing.likeCount,
              }
            : listing
        )
      );

      // Update user likes state
      setUserLikes((prev) => ({
        ...prev,
        [listingId]: !prev[listingId],
      }));
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  return (
    <div
      ref={listingsRef}
      className={`min-h-screen ${darkMode ? "bg-dark-surface-1 text-white" : "bg-white text-gray-900"}`}
    >
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gold Listings</h1>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded text-sm flex items-center ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
              }`}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            <select
              value={sortBy}
              onChange={handleSortChange}
              className={`px-3 py-2 rounded text-sm ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-800 border-gray-300"
              } border`}
            >
              <option value="created_at">Date Added</option>
              <option value="price">Price</option>
              <option value="weight">Weight</option>
              <option value="title">Title</option>
            </select>

            <select
              value={sortOrder}
              onChange={handleSortOrderChange}
              className={`px-3 py-2 rounded text-sm ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-800 border-gray-300"
              } border`}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div
            className={`mb-8 p-4 rounded-lg ${darkMode ? "bg-dark-surface-2" : "bg-white border border-gray-200"}`}
          >
            <h2 className="text-xl font-semibold mb-4">Filter Listings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 text-white border-gray-700" : "bg-white border-gray-300"}`}
                >
                  <option value="">All Categories</option>
                  <option value="Ring">Ring</option>
                  <option value="Necklace">Necklace</option>
                  <option value="Pendant">Pendant</option>
                  <option value="Bracelet">Bracelet</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Watch">Watch</option>
                  <option value="Coin">Coin</option>
                  <option value="Bar">Bar</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Purity</label>
                <select
                  name="purity"
                  value={filters.purity}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 text-white border-gray-700" : "bg-white border-gray-300"}`}
                >
                  <option value="">All Purities</option>
                  <option value="24K">24K (99.9%)</option>
                  <option value="22K">22K (91.7%)</option>
                  <option value="18K">18K (75.0%)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className={`w-1/2 p-2 border rounded ${darkMode ? "bg-dark-surface-1 text-white" : "bg-white"}`}
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className={`w-1/2 p-2 border rounded ${darkMode ? "bg-dark-surface-1 text-white" : "bg-white"}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Weight Range (g)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="minWeight"
                    placeholder="Min"
                    value={filters.minWeight}
                    onChange={handleFilterChange}
                    className={`w-1/2 p-2 border rounded ${darkMode ? "bg-dark-surface-1 text-white border-gray-700" : "bg-white border-gray-300"}`}
                  />
                  <input
                    type="number"
                    name="maxWeight"
                    placeholder="Max"
                    value={filters.maxWeight}
                    onChange={handleFilterChange}
                    className={`w-1/2 p-2 border rounded ${darkMode ? "bg-dark-surface-1 text-white border-gray-700" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Gold Origin
                </label>
                <select
                  name="gold_origin"
                  value={filters.gold_origin}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 text-white border-gray-700" : "bg-white border-gray-300"}`}
                >
                  <option value="">All Origins</option>
                  <option value="Japanese Gold">Japanese Gold</option>
                  <option value="Saudi Gold">Saudi Gold</option>
                  <option value="Italian Gold">Italian Gold</option>
                  <option value="Chinese Gold">Chinese Gold</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Gold Color
                </label>
                <select
                  name="gold_color"
                  value={filters.gold_color}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 text-white border-gray-700" : "bg-white border-gray-300"}`}
                >
                  <option value="">All Colors</option>
                  <option value="Yellow Gold">Yellow Gold</option>
                  <option value="White Gold">White Gold</option>
                  <option value="Rose Gold">Rose Gold</option>
                  <option value="Green Gold">Green Gold</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Date Listed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      className={`block text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      From
                    </label>
                    <input
                      type="date"
                      name="dateFrom"
                      value={filters.dateFrom}
                      onChange={handleFilterChange}
                      className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 text-white border-gray-700" : "bg-white border-gray-300"}`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      To
                    </label>
                    <input
                      type="date"
                      name="dateTo"
                      value={filters.dateTo}
                      onChange={handleFilterChange}
                      className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 text-white border-gray-700" : "bg-white border-gray-300"}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={resetFilters}
                className={`px-4 py-2 rounded ${darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? "border-amber-400" : "border-amber-600"}`}
            ></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p
              className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              No listings found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <Link
                to={`/listing/${listing.id}`}
                key={listing.id}
                className="block"
              >
                <div
                  className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${darkMode ? "bg-dark-surface-2" : "bg-white"}`}
                >
                  <div className="relative">
                    <img
                      src={
                        listing.image_url || "https://via.placeholder.com/300"
                      }
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />

                    {/* Badges for NEW and HOT items */}
                    <div className="absolute top-2 right-2 flex flex-col space-y-1.5">
                      {/* NEW Badge - show if item is less than 3 days old */}
                      {listing.created_at &&
                        new Date(listing.created_at) >
                          new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) && (
                          <div className="flex items-center px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold rounded-md shadow-md">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 mr-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            NEW
                          </div>
                        )}

                      {/* HOT Badge - show if item has more than 10 likes */}
                      {(listing.likeCount || 0) > 10 && (
                        <div className="flex items-center px-2 py-0.5 bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-bold rounded-md shadow-md">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                            />
                          </svg>
                          HOT
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">
                      {listing.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="col-span-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"}`}
                        >
                          {listing.category}
                        </span>
                      </div>
                      <div className="col-span-1 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? "bg-amber-800/30 text-amber-200" : "bg-amber-100 text-amber-800"}`}
                        >
                          {listing.purity}
                        </span>
                      </div>
                    </div>

                    {listing.gold_origin && (
                      <div className="mb-3">
                        <div
                          className={`flex items-center gap-1.5 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-medium">
                            {listing.gold_origin}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={(e) => handleLikeToggle(listing.id, e)}
                        className={`flex items-center ${darkMode ? "text-gray-300 hover:text-red-400" : "text-gray-600 hover:text-red-500"} transition-colors`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 mr-1 ${userLikes[listing.id] ? "text-red-500 fill-current" : darkMode ? "text-gray-500" : "text-gray-400"}`}
                          viewBox="0 0 20 20"
                          fill={userLikes[listing.id] ? "currentColor" : "none"}
                          stroke="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm">
                          {listing.likeCount || 0}
                        </span>
                      </button>
                      <div className="text-right">
                        <span
                          className={`text-sm block ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                        >
                          {listing.weight}g
                        </span>
                        <span
                          className={`font-bold block ${darkMode ? "text-amber-400" : "text-amber-600"}`}
                        >
                          ₱{listing.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;
