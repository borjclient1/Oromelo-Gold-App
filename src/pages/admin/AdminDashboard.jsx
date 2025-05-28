import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { isAdmin } from "../../config/constants";
import useAdminItems from "../../hooks/useAdminItems";
import ItemList from "../../components/items/ItemList";
import ItemTabs from "../../components/items/ItemTabs";
import ItemDetails from "../../components/items/ItemDetails";

function AdminDashboard() {
  const adminRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // State for controlling filters and sorting
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // State for pawn transaction form
  const [showPawnForm, setShowPawnForm] = useState(false);
  const [pawnItem, setPawnItem] = useState(null);
  const [pawnFormData, setPawnFormData] = useState({
    transaction_id: "",
    full_name: "",
    gov_id: "",
    contact_info: "",
    item_id: "",
    item_title: "",
    appraised_value: "",
    loan_amount: "",
    interest_rate: "",
    maturity_date: "",
    due_date: "",
  });

  // Advanced filtering
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    priceMin: "",
    priceMax: "",
    gold_origin: "",
    goldType: "",
    category: "",
  });

  // Get admin specific hooks and state
  const {
    items,
    loading,
    error,
    itemCounts,
    fetchItems,
    handleApproveItem,
    handleRejectItem,
    handleMarkAsPawned,
    handleDeleteItem,
    handleMarkAsSold,
  } = useAdminItems({
    user,
    activeTab,
    sortBy,
    sortOrder,
    filters,
  });

  // Check if user is admin and fetch items
  useEffect(() => {
    if (!user) {
      return; // Don't redirect if user is still loading
    }

    if (!isAdmin(user)) {
      navigate("/");
      return;
    }

    // Explicitly call fetchItems when component mounts
    fetchItems();
  }, [user, navigate, fetchItems]);

  // Scroll to top when the component mounts & when currentPage changes
  useEffect(() => {
    if (adminRef.current && currentPage !== null) {
      adminRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset to first page on tab change
  };

  // View details of an item
  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  // Close details overlay
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedItem(null);
  };

  // Filter change handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page on filter
    fetchItems();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      priceMin: "",
      priceMax: "",
      goldType: "",
      gold_origin: "",
      category: "",
    });
  };

  // Sort handlers
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Action handlers
  const handleApprove = async (item) => {
    const result = await handleApproveItem(item);
    if (result.success) {
      alert(result.message);
      handleCloseDetails();
    } else {
      alert(result.message);
    }
  };

  const handleReject = async (item) => {
    if (!confirm("Are you sure you want to reject this item?")) return;

    const result = await handleRejectItem(item);
    if (result.success) {
      alert(result.message);
      handleCloseDetails();
    } else {
      alert(result.message);
    }
  };

  const handleMarkPawned = async (item) => {
    // Open the pawn form instead of directly marking as pawned
    setPawnItem(item);
    // Pre-populate form data
    setPawnFormData({
      transaction_id: `TRX-${Date.now()}`,
      full_name: item?.pawn_request?.full_name || "",
      gov_id: "",
      contact_info: item?.pawn_request?.contact_number || "",
      item_id: item?.id || "",
      item_title: item?.title || "",
      appraised_value: "",
      loan_amount: "",
      interest_rate: "",
      maturity_date: "",
      due_date: "",
    });
    setShowPawnForm(true);
  };

  const handleMarkSold = async (item) => {
    if (!confirm("Are you sure you want to mark this item as Sold?")) return;

    const result = await handleMarkAsSold(item);
    if (result.success) {
      alert(result.message);
      handleCloseDetails();
    } else {
      alert(result.message);
    }
  };

  const handleDelete = async (item) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this item? This action cannot be undone."
      )
    )
      return;

    const result = await handleDeleteItem(item);
    if (result.success) {
      alert(result.message);
      handleCloseDetails();
    } else {
      alert(result.message);
    }
  };

  // Handle pawn form change
  const handlePawnFormChange = (e) => {
    const { name, value } = e.target;
    setPawnFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle pawn form submission
  const handlePawnFormSubmit = async (e) => {
    e.preventDefault();

    const result = await handleMarkAsPawned(pawnItem, pawnFormData);
    if (result.success) {
      alert(result.message);
      setShowPawnForm(false);
      setPawnItem(null);
      // Reset form data
      setPawnFormData({
        transaction_id: "",
        full_name: "",
        gov_id: "",
        contact_info: "",
        item_id: "",
        item_title: "",
        appraised_value: "",
        loan_amount: "",
        interest_rate: "",
        maturity_date: "",
        due_date: "",
      });
    } else {
      alert(result.message);
    }
  };

  // Gold types and categories for filters
  const gold_origin = [
    "Japanese Gold",
    "Saudi Gold",
    "Italian Gold",
    "Chinese Gold",
    "Other",
  ];

  const goldTypes = [
    "Yellow Gold",
    "White Gold",
    "Rose Gold",
    "Green Gold",
    "Other",
  ];

  const categories = [
    "Ring",
    "Necklace",
    "Pendant",
    "Bracelet",
    "Earrings",
    "Watch",
    "Coin",
    "Bar",
    "Other",
  ];

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-dark-surface text-gray-200" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={adminRef} className="px-4 py-6 sm:px-0">
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Admin Dashboard
          </h1>
          <p className={`mt-1 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
            Manage gold items listed on the platform
          </p>
        </div>

        {/* Filtering and sorting controls */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div className="flex space-x-2">
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
            </div>

            <div
              className={`w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ${
                showFilters ? "mb-4" : ""
              }`}
            >
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
                <option value="amount">Price</option>
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

          {/* Advanced filters */}
          {showFilters && (
            <div
              className={`p-4 rounded-lg mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${
                darkMode
                  ? "bg-dark-surface-2"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div>
                <label
                  className={`block mb-1 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  From Date
                </label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className={`w-full px-3 py-2 rounded text-sm ${
                    darkMode
                      ? "bg-dark-surface-3 text-gray-200 border-dark-surface-4"
                      : "bg-white text-gray-800 border-gray-300"
                  } border`}
                />
              </div>

              <div>
                <label
                  className={`block mb-1 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  To Date
                </label>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className={`w-full px-3 py-2 rounded text-sm ${
                    darkMode
                      ? "bg-dark-surface-3 text-gray-200 border-dark-surface-4"
                      : "bg-white text-gray-800 border-gray-300"
                  } border`}
                />
              </div>

              <div>
                <label
                  className={`block mb-1 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Min Price
                </label>
                <input
                  type="number"
                  name="priceMin"
                  value={filters.priceMin}
                  onChange={handleFilterChange}
                  placeholder="Min Price"
                  className={`w-full px-3 py-2 rounded text-sm ${
                    darkMode
                      ? "bg-dark-surface-3 text-gray-200 border-dark-surface-4"
                      : "bg-white text-gray-800 border-gray-300"
                  } border`}
                />
              </div>

              <div>
                <label
                  className={`block mb-1 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Max Price
                </label>
                <input
                  type="number"
                  name="priceMax"
                  value={filters.priceMax}
                  onChange={handleFilterChange}
                  placeholder="Max Price"
                  className={`w-full px-3 py-2 rounded text-sm ${
                    darkMode
                      ? "bg-dark-surface-3 text-gray-200 border-dark-surface-4"
                      : "bg-white text-gray-800 border-gray-300"
                  } border`}
                />
              </div>

              <div>
                <label
                  className={`block mb-1 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Gold Type
                </label>
                <select
                  name="gold_origin"
                  value={filters.gold_origin}
                  onChange={handleFilterChange}
                  className={`w-full px-3 py-2 rounded text-sm ${
                    darkMode
                      ? "bg-dark-surface-3 text-gray-200 border-dark-surface-4"
                      : "bg-white text-gray-800 border-gray-300"
                  } border`}
                >
                  <option value="">All Gold Types</option>
                  {gold_origin.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block mb-1 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Gold Color
                </label>
                <select
                  name="goldType"
                  value={filters.goldType}
                  onChange={handleFilterChange}
                  className={`w-full px-3 py-2 rounded text-sm ${
                    darkMode
                      ? "bg-dark-surface-3 text-gray-200 border-dark-surface-4"
                      : "bg-white text-gray-800 border-gray-300"
                  } border`}
                >
                  <option value="">All Gold Colors</option>
                  {goldTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block mb-1 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className={`w-full px-3 py-2 rounded text-sm ${
                    darkMode
                      ? "bg-dark-surface-3 text-gray-200 border-dark-surface-4"
                      : "bg-white text-gray-800 border-gray-300"
                  } border`}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end space-x-2 md:col-span-2 lg:col-span-3">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded text-sm"
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  className={`px-4 py-2 rounded text-sm ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="mt-6">
          {/* Tab navigation */}
          <ItemTabs
            activeTab={activeTab}
            handleTabChange={handleTabChange}
            itemCounts={itemCounts}
            darkMode={darkMode}
          />

          {/* Item list */}
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400 mb-2"></div>
              <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                Loading items...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10">
              <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                No items found for this status.
              </p>
            </div>
          ) : (
            <ItemList
              items={items}
              handleViewDetails={handleViewDetails}
              handleDeleteItem={handleDeleteItem}
              handleApproveItem={handleApproveItem}
              handleRejectItem={handleRejectItem}
              handleMarkAsPawned={handleMarkPawned}
              handleMarkAsSold={handleMarkSold}
              isAdmin={true}
              darkMode={darkMode}
              pageSize={6}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>

        {/* Item Details Modal */}
        {detailsOpen && selectedItem && (
          <ItemDetails
            item={selectedItem}
            isAdmin={true}
            onClose={handleCloseDetails}
            onApprove={handleApprove}
            onReject={handleReject}
            onMarkAsPawned={handleMarkPawned}
            onMarkAsSold={handleMarkSold}
            onDelete={handleDelete}
          />
        )}

        {/* Pawn Transaction Form Overlay */}
        {showPawnForm && pawnItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div
              className={`relative w-full max-w-2xl mx-auto p-6 rounded-lg shadow-lg ${darkMode ? "bg-dark-surface-2" : "bg-white"}`}
            >
              <button
                onClick={() => setShowPawnForm(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2
                className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Create Pawn Transaction
              </h2>

              <form onSubmit={handlePawnFormSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Transaction ID */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={pawnFormData.transaction_id}
                      disabled
                      className={`w-full px-3 py-2 border rounded-md bg-gray-100 ${darkMode ? "border-dark-surface-4 text-gray-400" : "border-gray-300 text-gray-500"}`}
                    />
                  </div>

                  {/* Customer Information Section */}
                  <div className="md:col-span-2">
                    <h3
                      className={`text-md font-medium mb-2 ${darkMode ? "text-amber-300" : "text-amber-600"}`}
                    >
                      Customer Information
                    </h3>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={pawnFormData.full_name}
                      onChange={handlePawnFormChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? "bg-dark-surface-3 border-dark-surface-4 text-white" : "bg-white border-gray-300 text-gray-800"}`}
                    />
                  </div>

                  {/* Government ID */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Government ID (Type and Number)
                    </label>
                    <input
                      type="text"
                      name="gov_id"
                      value={pawnFormData.gov_id}
                      onChange={handlePawnFormChange}
                      placeholder="e.g. Driver's License 12345678"
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? "bg-dark-surface-3 border-dark-surface-4 text-white" : "bg-white border-gray-300 text-gray-800"}`}
                    />
                  </div>

                  {/* Contact Info */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Contact Information{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contact_info"
                      value={pawnFormData.contact_info}
                      onChange={handlePawnFormChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? "bg-dark-surface-3 border-dark-surface-4 text-white" : "bg-white border-gray-300 text-gray-800"}`}
                    />
                  </div>

                  {/* Item Information Section */}
                  <div className="md:col-span-2">
                    <h3
                      className={`text-md font-medium mb-2 mt-2 ${darkMode ? "text-amber-300" : "text-amber-600"}`}
                    >
                      Item Information
                    </h3>
                  </div>

                  {/* Item ID */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Item ID
                    </label>
                    <input
                      type="text"
                      value={pawnFormData.item_id}
                      disabled
                      className={`w-full px-3 py-2 border rounded-md bg-gray-100 ${darkMode ? "border-dark-surface-4 text-gray-400" : "border-gray-300 text-gray-500"}`}
                    />
                  </div>

                  {/* Item Title */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Item Title
                    </label>
                    <input
                      type="text"
                      value={pawnFormData.item_title}
                      disabled
                      className={`w-full px-3 py-2 border rounded-md bg-gray-100 ${darkMode ? "border-dark-surface-4 text-gray-400" : "border-gray-300 text-gray-500"}`}
                    />
                  </div>

                  {/* Transaction Details Section */}
                  <div className="md:col-span-2">
                    <h3
                      className={`text-md font-medium mb-2 mt-2 ${darkMode ? "text-amber-300" : "text-amber-600"}`}
                    >
                      Transaction Details
                    </h3>
                  </div>

                  {/* Appraised Value */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Appraised Value (PHP){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="appraised_value"
                      value={pawnFormData.appraised_value}
                      onChange={handlePawnFormChange}
                      required
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? "bg-dark-surface-3 border-dark-surface-4 text-white" : "bg-white border-gray-300 text-gray-800"}`}
                    />
                  </div>

                  {/* Loan Amount */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Loan Amount (PHP) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="loan_amount"
                      value={pawnFormData.loan_amount}
                      onChange={handlePawnFormChange}
                      required
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? "bg-dark-surface-3 border-dark-surface-4 text-white" : "bg-white border-gray-300 text-gray-800"}`}
                    />
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Interest Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="interest_rate"
                      value={pawnFormData.interest_rate}
                      onChange={handlePawnFormChange}
                      required
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? "bg-dark-surface-3 border-dark-surface-4 text-white" : "bg-white border-gray-300 text-gray-800"}`}
                    />
                  </div>

                  {/* Maturity Date */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Maturity Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="maturity_date"
                      value={pawnFormData.maturity_date}
                      onChange={handlePawnFormChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? "bg-dark-surface-3 border-dark-surface-4 text-white" : "bg-white border-gray-300 text-gray-800"}`}
                    />
                  </div>

                  {/* Due Date */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="due_date"
                      value={pawnFormData.due_date}
                      onChange={handlePawnFormChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? "bg-dark-surface-3 border-dark-surface-4 text-white" : "bg-white border-gray-300 text-gray-800"}`}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPawnForm(false)}
                    className={`px-4 py-2 rounded-md ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
