import React, { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import StatusBadge from "../StatusBadge";

function ItemDetails({
  item,
  isAdmin = false,
  isEditing = false,
  editedItem = null,
  onClose,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onApprove,
  onReject,
  onMarkAsPawned,
  onMarkAsSold,
  editErrors = {},
  onEditChange,
  onSellerChange,
  saveLoading = false,
}) {
  const { darkMode } = useTheme();
  // State for current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // State for pawn transaction form
  const [showPawnForm, setShowPawnForm] = useState(false);
  const [pawnFormData, setPawnFormData] = useState({
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

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Helper function to get all item images from various formats
  const getItemImages = (item) => {
    if (!item) return [];
    let images = [];

    // Check for different potential image storage formats
    if (item.image_url) {
      images.push(item.image_url);
    }

    if (item.images) {
      if (Array.isArray(item.images)) {
        images = [...images, ...item.images];
      } else if (typeof item.images === "string") {
        try {
          const parsedImages = JSON.parse(item.images);
          if (Array.isArray(parsedImages)) {
            images = [...images, ...parsedImages];
          }
        } catch (error) {
          if (error instanceof SyntaxError) {
            // If parsing fails, it's not a JSON string
            // Silently continue - no need for console errors in production
          } else {
            throw error;
          }
        }
      }
    }

    // Check for additional_images field - this is where the additional photos are stored
    if (item.additional_images && Array.isArray(item.additional_images)) {
      images = [...images, ...item.additional_images];
    }

    if (item.photos && Array.isArray(item.photos)) {
      images = [...images, ...item.photos];
    }

    if (item.photo_urls && Array.isArray(item.photo_urls)) {
      images = [...images, ...item.photo_urls];
    }

    // Remove duplicates and filter out null/undefined values
    return [...new Set(images)].filter((img) => img);
  };

  if (!item) return null;

  // Current display item (either the original or the edited version)
  const displayItem = isEditing ? editedItem : item;

  // Get all available images
  const itemImages = getItemImages(item);

  // Handle image navigation
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? itemImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === itemImages.length - 1 ? 0 : prev + 1
    );
  };

  // Get current image to display
  const getCurrentImage = () => {
    return itemImages.length > 0 ? itemImages[currentImageIndex] : null;
  };

  // Handle pawn form change
  const handlePawnFormChange = (e) => {
    const { name, value } = e.target;
    setPawnFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle pawn form submit
  const handlePawnFormSubmit = async (e) => {
    e.preventDefault();
    // Call the pawn function provided by parent with the form data
    const result = await onMarkAsPawned(item, pawnFormData);
    if (result?.success) {
      setShowPawnForm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className={`relative w-full max-w-3xl mx-auto p-3 sm:p-6 rounded-lg shadow-lg overflow-y-auto max-h-[95vh] ${
          darkMode ? "bg-dark-surface-2" : "bg-white"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 z-10"
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

        {/* Header with item title and status */}
        <div className="mb-6 pt-2">
          {isEditing ? (
            <div className="mb-4">
              <label
                className={`block mb-1 text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Title
              </label>
              <input
                type="text"
                name="title"
                value={editedItem.title}
                onChange={onEditChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                } ${editErrors.title ? "border-red-500" : ""}`}
              />
              {editErrors.title && (
                <p className="mt-1 text-sm text-red-500">{editErrors.title}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2
                className={`text-2xl font-bold pr-8 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {item.title}
              </h2>
              <div className="flex-shrink-0">
                <StatusBadge status={item.status} />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Item photo and details */}
          <div>
            {/* Image Gallery */}
            <div className="mb-4 relative">
              {getCurrentImage() ? (
                <img
                  src={getCurrentImage()}
                  alt={item.title}
                  className="w-full h-64 object-cover rounded-lg cursor-pointer"
                  onClick={() => window.open(getCurrentImage(), "_blank")}
                />
              ) : (
                <div
                  className={`w-full h-64 flex items-center justify-center rounded-lg ${
                    darkMode ? "bg-dark-surface-3" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    No image available
                  </span>
                </div>
              )}

              {/* Image navigation controls - only show if multiple images */}
              {itemImages.length > 1 && (
                <>
                  {/* Navigation arrows */}
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    ❮
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    ❯
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIndex + 1}/{itemImages.length}
                  </div>

                  {/* Thumbnail navigation (optional) */}
                  <div className="flex justify-center mt-2 gap-1 overflow-x-auto py-1">
                    {itemImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-12 h-12 flex-shrink-0 overflow-hidden rounded cursor-pointer border-2 ${
                          idx === currentImageIndex
                            ? "border-amber-500"
                            : darkMode
                            ? "border-gray-700"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Item metadata */}
            <div
              className={`rounded-lg p-4 ${
                darkMode ? "bg-dark-surface-3" : "bg-gray-50"
              } mb-4`}
            >
              <h3
                className={`text-lg font-medium mb-3 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Item Details
              </h3>

              {isEditing ? (
                <div className="space-y-3">
                  {/* Category */}
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
                      value={editedItem.category || ""}
                      onChange={onEditChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode
                          ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                          : "bg-white border-gray-300 text-gray-800"
                      } ${editErrors.category ? "border-red-500" : ""}`}
                    >
                      <option value="">Select Category</option>
                      <option value="Ring">Ring</option>
                      <option value="Necklace">Necklace</option>
                      <option value="Bracelet">Bracelet</option>
                      <option value="Earrings">Earrings</option>
                      <option value="Watch">Watch</option>
                      <option value="Coin">Coin</option>
                      <option value="Bar">Bar</option>
                      <option value="Other">Other</option>
                    </select>
                    {editErrors.category && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.category}
                      </p>
                    )}
                  </div>

                  {/* Gold Type */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Gold Color
                    </label>
                    <select
                      name="gold_type"
                      value={editedItem.gold_type || ""}
                      onChange={onEditChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode
                          ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                          : "bg-white border-gray-300 text-gray-800"
                      } ${editErrors.gold_type ? "border-red-500" : ""}`}
                    >
                      <option value="">Select gold color</option>
                      <option value="Yellow Gold">Yellow Gold</option>
                      <option value="White Gold">White Gold</option>
                      <option value="Rose Gold">Rose Gold</option>
                      <option value="Green Gold">Green Gold</option>
                      <option value="Mixed">Mixed</option>
                      <option value="Other">Other</option>
                    </select>
                    {editErrors.gold_type && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.gold_type}
                      </p>
                    )}
                  </div>

                  {/* Gold Origin */}
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
                      value={editedItem.gold_origin || ""}
                      onChange={onEditChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode
                          ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                          : "bg-white border-gray-300 text-gray-800"
                      } ${editErrors.gold_origin ? "border-red-500" : ""}`}
                    >
                      <option value="">Select type</option>
                      <option value="Japanese Gold">Japanese Gold</option>
                      <option value="Saudi Gold">Saudi Gold</option>
                      <option value="Italian Gold">Italian Gold</option>
                      <option value="Chinese Gold">Chinese Gold</option>
                      <option value="Other">Other</option>
                    </select>
                    {editErrors.gold_origin && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.gold_origin}
                      </p>
                    )}
                  </div>

                  {/* Purity */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Purity (Karat)
                    </label>
                    <select
                      name="purity"
                      value={editedItem.purity || ""}
                      onChange={onEditChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode
                          ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                          : "bg-white border-gray-300 text-gray-800"
                      } ${editErrors.purity ? "border-red-500" : ""}`}
                    >
                      <option value="">Select purity</option>
                      <option value="24K">24K (99.9%)</option>
                      <option value="22K">22K (91.7%)</option>
                      <option value="18K">18K (75.0%)</option>
                      <option value="14K">14K (58.3%)</option>
                      <option value="10K">10K (41.7%)</option>
                      <option value="Other">Other</option>
                    </select>
                    {editErrors.purity && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.purity}
                      </p>
                    )}
                  </div>

                  {/* Weight */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Weight (grams)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="weight"
                      value={editedItem.weight || ""}
                      onChange={onEditChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode
                          ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                          : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>

                  {/* Brand/Manufacturer */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Brand (if applicable)
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={editedItem.brand || ""}
                      onChange={onEditChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode
                          ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                          : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className={`space-y-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {displayItem.category}
                  </p>
                  <p>
                    <span className="font-medium">Gold Color:</span>{" "}
                    {displayItem.gold_type}
                  </p>
                  <p>
                    <span className="font-medium">Gold Type:</span>{" "}
                    {displayItem.gold_origin}
                  </p>
                  <p>
                    <span className="font-medium">Purity:</span>{" "}
                    {displayItem.purity}
                  </p>
                  {displayItem.weight && (
                    <p>
                      <span className="font-medium">Weight:</span>{" "}
                      {displayItem.weight}g
                    </p>
                  )}
                  {displayItem.brand && (
                    <p>
                      <span className="font-medium">Brand:</span>{" "}
                      {displayItem.brand}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Listed on:</span>{" "}
                    {formatDate(displayItem.created_at)}
                  </p>
                  {(displayItem.status === "sold" ||
                    displayItem.status === "pawned") && (
                    <p>
                      <span className="font-medium">
                        {displayItem.status === "sold"
                          ? "Sold on"
                          : "Pawned on"}
                        :
                      </span>{" "}
                      {formatDate(displayItem.updated_at)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right column - Transaction details and actions */}
          <div>
            {/* Price/transaction info */}
            <div
              className={`rounded-lg p-4 ${
                darkMode ? "bg-dark-surface-3" : "bg-gray-50"
              } mb-4`}
            >
              <h3
                className={`text-lg font-medium mb-3 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {displayItem.item_type === "pawn"
                  ? "Pawn Request"
                  : "Sale Request"}
              </h3>

              {isEditing ? (
                <div className="space-y-3">
                  {/* Estimated Price */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {displayItem.item_type === "pawn"
                        ? "Requested Amount (PHP)"
                        : "Selling Price (PHP)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      value={editedItem.amount || ""}
                      onChange={onEditChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode
                          ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                          : "bg-white border-gray-300 text-gray-800"
                      } ${editErrors.amount ? "border-red-500" : ""}`}
                    />
                    {editErrors.amount && (
                      <p className="mt-1 text-sm text-red-500">
                        {editErrors.amount}
                      </p>
                    )}
                  </div>

                  {/* Description/Details */}
                  <div>
                    <label
                      className={`block mb-1 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Additional Details
                    </label>
                    <textarea
                      name="details"
                      value={editedItem.details || ""}
                      onChange={onEditChange}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-md ${
                        darkMode
                          ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                          : "bg-white border-gray-300 text-gray-800"
                      }`}
                    ></textarea>
                  </div>

                  {/* Seller information if it's a sell item */}
                  {displayItem.item_type === "sell" &&
                    editedItem.sell_request && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4
                          className={`text-md font-medium mb-3 ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          Seller Information
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <label
                              className={`block mb-1 text-sm ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="full_name"
                              value={editedItem.sell_request.full_name || ""}
                              onChange={onSellerChange}
                              className={`w-full px-3 py-2 border rounded-md ${
                                darkMode
                                  ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                                  : "bg-white border-gray-300 text-gray-800"
                              }`}
                            />
                          </div>

                          <div>
                            <label
                              className={`block mb-1 text-sm ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              Contact Number
                            </label>
                            <input
                              type="text"
                              name="contact_number"
                              value={
                                editedItem.sell_request.contact_number || ""
                              }
                              onChange={onSellerChange}
                              className={`w-full px-3 py-2 border rounded-md ${
                                darkMode
                                  ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                                  : "bg-white border-gray-300 text-gray-800"
                              }`}
                            />
                          </div>

                          <div>
                            <label
                              className={`block mb-1 text-sm ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={editedItem.sell_request.email || ""}
                              onChange={onSellerChange}
                              className={`w-full px-3 py-2 border rounded-md ${
                                darkMode
                                  ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                                  : "bg-white border-gray-300 text-gray-800"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div>
                  <div
                    className={`space-y-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <p>
                      <span className="font-medium">
                        {displayItem.item_type === "pawn"
                          ? "Requested Amount:"
                          : "Selling Price:"}
                      </span>{" "}
                      {formatCurrency(
                        displayItem.item_type === "pawn"
                          ? displayItem.pawn_request?.pawn_price ||
                              displayItem.amount
                          : displayItem.sell_request?.price_estimate ||
                              displayItem.amount
                      )}
                    </p>

                    {/* Show pawn transaction details if pawned */}
                    {displayItem.status === "pawned" &&
                      displayItem.item_type === "pawn" && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <h4
                            className={`text-md font-medium mb-2 ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Pawn Transaction Details
                          </h4>
                          <div className="space-y-2 mt-2">
                            <p>
                              <span className="font-medium">
                                Interest Rate:
                              </span>{" "}
                              {(isAdmin
                                ? displayItem.pawn_transactions?.[0]
                                : displayItem.pawn_transaction
                              )?.interest_rate ||
                                displayItem.pawn_details?.interest_rate ||
                                "TBD"}
                              {(isAdmin
                                ? displayItem.pawn_transactions?.[0]
                                : displayItem.pawn_transaction
                              )?.interest_rate && "%"}
                            </p>
                            <p>
                              <span className="font-medium">Loan Amount:</span>{" "}
                              {(isAdmin
                                ? displayItem.pawn_transactions?.[0]
                                : displayItem.pawn_transaction
                              )?.loan_amount
                                ? `₱${parseFloat(
                                    (isAdmin
                                      ? displayItem.pawn_transactions?.[0]
                                      : displayItem.pawn_transaction
                                    ).loan_amount
                                  ).toLocaleString()}`
                                : "TBD"}
                            </p>
                            <p>
                              <span className="font-medium">
                                Maturity Date:
                              </span>{" "}
                              {(isAdmin
                                ? displayItem.pawn_transactions?.[0]
                                : displayItem.pawn_transaction
                              )?.maturity_date
                                ? new Date(
                                    (isAdmin
                                      ? displayItem.pawn_transactions?.[0]
                                      : displayItem.pawn_transaction
                                    ).maturity_date
                                  ).toLocaleDateString()
                                : "TBD"}
                            </p>
                            <p>
                              <span className="font-medium">Due Date:</span>{" "}
                              {(isAdmin
                                ? displayItem.pawn_transactions?.[0]
                                : displayItem.pawn_transaction
                              )?.due_date
                                ? new Date(
                                    (isAdmin
                                      ? displayItem.pawn_transactions?.[0]
                                      : displayItem.pawn_transaction
                                    ).due_date
                                  ).toLocaleDateString()
                                : "TBD"}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Seller Information for Sell items */}
            {displayItem.item_type === "sell" && displayItem.sell_request && (
              <div
                className={`mt-3 p-3 rounded-md ${
                  darkMode
                    ? "bg-amber-900 bg-opacity-30 border border-amber-700"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <h4
                  className={`text-sm font-medium mb-1 ${
                    darkMode ? "text-amber-300" : "text-yellow-700"
                  }`}
                >
                  Seller Information
                </h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs sm:text-sm">
                  <div
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Name:
                  </div>
                  <div>{displayItem.sell_request.full_name}</div>

                  <div
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Contact:
                  </div>
                  <div>{displayItem.sell_request.contact_number}</div>

                  {displayItem.sell_request.email && (
                    <>
                      <div
                        className={`${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Email:
                      </div>
                      <div>{displayItem.sell_request.email}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Additional details */}
            {displayItem.details && !isEditing && (
              <div
                className={`rounded-lg p-4 ${
                  darkMode ? "bg-dark-surface-3" : "bg-gray-50"
                } mb-4`}
              >
                <h3
                  className={`text-lg font-medium mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Additional Details
                </h3>
                <p
                  className={`whitespace-pre-line ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {displayItem.details}
                </p>
              </div>
            )}

            {/* Pawn Request for Pawn items */}
            {displayItem.item_type === "pawn" &&
              displayItem.pawn_request &&
              (displayItem.status === "pending" ||
                displayItem.status === "rejected" ||
                displayItem.status === "approved") && (
                <div
                  className={`mt-3 p-3 rounded-md ${
                    darkMode
                      ? "bg-amber-900 bg-opacity-30 border border-amber-700"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  <h4
                    className={`text-sm font-medium mb-1 ${
                      darkMode ? "text-amber-300" : "text-yellow-700"
                    }`}
                  >
                    Pawn Request
                  </h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs sm:text-sm">
                    <div
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Name:
                    </div>
                    <div>{displayItem.pawn_request.full_name}</div>
                    <div
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Preferred Date:
                    </div>
                    <div>
                      {formatDate(displayItem.pawn_request.meeting_date_1)}
                    </div>
                    {displayItem.pawn_request.meeting_date_2 && (
                      <>
                        <div
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Alternative Date:
                        </div>
                        <div>
                          {formatDate(displayItem.pawn_request.meeting_date_2)}
                        </div>
                      </>
                    )}
                    <div
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Meeting Place:
                    </div>
                    <div>{displayItem.pawn_request.meeting_place}</div>
                    {displayItem.pawn_request.contact_number && (
                      <>
                        <div
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Contact Number:
                        </div>
                        <div>{displayItem.pawn_request.contact_number}</div>
                      </>
                    )}
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className="mt-6 space-y-2 pb-4">
              {isEditing ? (
                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                  <button
                    onClick={onSave}
                    disabled={saveLoading}
                    className={`py-2 px-4 rounded-md ${
                      darkMode
                        ? "bg-gold hover:bg-amber-600 text-black"
                        : "bg-gold hover:bg-amber-600 text-black"
                    } font-medium sm:flex-1`}
                  >
                    {saveLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={onCancel}
                    disabled={saveLoading}
                    className={`py-2 px-4 rounded-md ${
                      darkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    } sm:flex-1`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  {/* Admin-specific actions */}
                  {isAdmin && (
                    <div className="space-y-2">
                      {item.status === "pending" && (
                        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                          <button
                            onClick={() => onApprove(item)}
                            className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium sm:flex-1"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onReject(item)}
                            className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium sm:flex-1"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {item.status === "approved" &&
                        item.item_type === "pawn" && (
                          <button
                            onClick={() => setShowPawnForm(true)}
                            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium"
                          >
                            Mark as Pawned
                          </button>
                        )}

                      <button
                        onClick={() => onDelete(item)}
                        className={`w-full py-2 px-4 rounded-md ${
                          darkMode
                            ? "bg-red-900 hover:bg-red-800 text-white"
                            : "bg-red-100 hover:bg-red-200 text-red-800"
                        }`}
                      >
                        Delete Item
                      </button>
                    </div>
                  )}

                  {/* User-specific actions */}
                  {!isAdmin && (
                    <div className="space-y-2">
                      {item.status === "pending" && (
                        <button
                          onClick={onEdit}
                          className={`w-full py-2 px-4 rounded-md ${
                            darkMode
                              ? "bg-gold hover:bg-amber-600 text-black"
                              : "bg-gold hover:bg-amber-600 text-black"
                          } font-medium`}
                        >
                          Edit Item
                        </button>
                      )}

                      {item.status === "approved" &&
                        item.item_type === "sell" && (
                          <button
                            onClick={() => onMarkAsSold(item.id)}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                          >
                            Mark as Sold
                          </button>
                        )}

                      {item.status === "pending" && (
                        <button
                          onClick={() => onDelete(item.id)}
                          className={`w-full py-2 px-4 rounded-md ${
                            darkMode
                              ? "bg-red-900 hover:bg-red-800 text-white"
                              : "bg-red-100 hover:bg-red-200 text-red-800"
                          }`}
                        >
                          Delete Item
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pawn Transaction Form Overlay */}
      {showPawnForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div
            className={`relative w-full max-w-2xl mx-auto p-6 rounded-lg shadow-lg ${
              darkMode ? "bg-dark-surface-2" : "bg-white"
            }`}
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
              className={`text-xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Create Pawn Transaction
            </h2>

            <form onSubmit={handlePawnFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Transaction ID */}
                <div>
                  <label
                    className={`block mb-1 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={pawnFormData.transaction_id}
                    disabled
                    className={`w-full px-3 py-2 border rounded-md bg-gray-100 ${
                      darkMode
                        ? "border-dark-surface-4 text-gray-400"
                        : "border-gray-300 text-gray-500"
                    }`}
                  />
                </div>

                {/* Customer Information Section */}
                <div className="md:col-span-2">
                  <h3
                    className={`text-md font-medium mb-2 ${
                      darkMode ? "text-amber-300" : "text-amber-600"
                    }`}
                  >
                    Customer Information
                  </h3>
                </div>

                {/* Full Name */}
                <div>
                  <label
                    className={`block mb-1 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={pawnFormData.full_name}
                    onChange={handlePawnFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                </div>

                {/* Government ID */}
                <div>
                  <label
                    className={`block mb-1 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Government ID (Type and Number)
                  </label>
                  <input
                    type="text"
                    name="gov_id"
                    value={pawnFormData.gov_id}
                    onChange={handlePawnFormChange}
                    placeholder="e.g. Driver's License 12345678"
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                </div>

                {/* Contact Info */}
                <div>
                  <label
                    className={`block mb-1 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Contact Information <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_info"
                    value={pawnFormData.contact_info}
                    onChange={handlePawnFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                </div>

                {/* Item Information Section */}
                <div className="md:col-span-2">
                  <h3
                    className={`text-md font-medium mb-2 mt-2 ${
                      darkMode ? "text-amber-300" : "text-amber-600"
                    }`}
                  >
                    Item Information
                  </h3>
                </div>

                {/* Item ID */}
                <div>
                  <label
                    className={`block mb-1 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Item ID
                  </label>
                  <input
                    type="text"
                    value={pawnFormData.item_id}
                    disabled
                    className={`w-full px-3 py-2 border rounded-md bg-gray-100 ${
                      darkMode
                        ? "border-dark-surface-4 text-gray-400"
                        : "border-gray-300 text-gray-500"
                    }`}
                  />
                </div>

                {/* Item Title */}
                <div>
                  <label
                    className={`block mb-1 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Item Title
                  </label>
                  <input
                    type="text"
                    value={pawnFormData.item_title}
                    disabled
                    className={`w-full px-3 py-2 border rounded-md bg-gray-100 ${
                      darkMode
                        ? "border-dark-surface-4 text-gray-400"
                        : "border-gray-300 text-gray-500"
                    }`}
                  />
                </div>

                {/* Transaction Details Section */}
                <div className="md:col-span-2">
                  <h3
                    className={`text-md font-medium mb-2 mt-2 ${
                      darkMode ? "text-amber-300" : "text-amber-600"
                    }`}
                  >
                    Transaction Details
                  </h3>
                </div>

                {/* Appraised Value */}
                <div>
                  <label
                    className={`block mb-1 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
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
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                </div>

                {/* Loan Amount */}
                <div>
                  <label
                    className={`block mb-1 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
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
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                </div>

                {/* Interest Rate */}
                <div>
                  <label
                    className={`block mb-1 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
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
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                </div>

                {/* Maturity Date */}
                <div>
                  <label
                    className={`block mb-1 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Maturity Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="maturity_date"
                    value={pawnFormData.maturity_date}
                    onChange={handlePawnFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label
                    className={`block mb-1 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={pawnFormData.due_date}
                    onChange={handlePawnFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? "bg-dark-surface-3 border-dark-surface-4 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPawnForm(false)}
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
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
  );
}
export default ItemDetails;
