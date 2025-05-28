import React, { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import StatusBadge from "../common/StatusBadge";

function ItemCard({
  item,
  onClick,
  onDelete,
  onApprove,
  onReject,
  onMarkAsPawned,
  onMarkAsSold,
  isAdmin,
  darkMode: propDarkMode,
}) {
  // Use provided darkMode from props or from the theme context
  const themeContext = useTheme();
  const darkMode =
    propDarkMode !== undefined ? propDarkMode : themeContext.darkMode;

  // State for current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    let images = [];

    // Check for different potential image storage formats
    if (item.image_url) {
      images.push(item.image_url);
    }

    // Main image field
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

  // Get all available images
  const itemImages = getItemImages(item);

  // Handle image navigation
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? itemImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === itemImages.length - 1 ? 0 : prev + 1
    );
  };

  // Helper function to get the current image URL
  const getCurrentImage = () => {
    return itemImages.length > 0 ? itemImages[currentImageIndex] : null;
  };

  return (
    <div
      className={`border rounded-lg shadow-sm overflow-hidden ${
        darkMode
          ? "bg-dark-surface-2 border-dark-surface-4"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Item Photos - Clickable to open details view */}
      <div
        className="relative h-40 sm:h-48 bg-gray-200 overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        {getCurrentImage() ? (
          <img
            src={getCurrentImage()}
            alt={item.title || "Item"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              darkMode ? "bg-dark-surface-3" : "bg-gray-200"
            }`}
          >
            <span className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              No Image
            </span>
          </div>
        )}

        {/* Image navigation and counter */}
        {itemImages.length > 1 && (
          <>
            {/* Left/right navigation arrows */}
            <button
              onClick={handlePrevImage}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-r-md hover:bg-opacity-70`}
            >
              ❮
            </button>
            <button
              onClick={handleNextImage}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-l-md hover:bg-opacity-70`}
            >
              ❯
            </button>

            {/* Image counter */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
              {currentImageIndex + 1}/{itemImages.length}
            </div>
          </>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Item details */}
      <div className="p-4">
        <h3
          className={`font-medium text-lg mb-1 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {item.title || "Unnamed Item"}
        </h3>

        <div
          className={`text-sm mb-2 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {item.category && <span>{item.category}</span>}
          {item.gold_type && <span> • {item.gold_type}</span>}
          {item.purity && <span> • {item.purity}</span>}
          {item.weight && <span> • {item.weight}g</span>}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {item.item_type === "pawn" ? "Pawn Value" : "Selling Price"}
            </p>
            <p
              className={`font-medium ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {item.item_type === "pawn" && item.pawn_request
                ? formatCurrency(item.pawn_request.pawn_price)
                : formatCurrency(item.price_estimate || item.amount)}
            </p>
          </div>
          <div>
            <p
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Submitted
            </p>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {formatDate(item.created_at)}
            </p>
          </div>
        </div>

        {/* If admin view, show user info */}
        {isAdmin && item.user_profile && (
          <div
            className={`text-sm mb-3 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
              Owner:
            </span>{" "}
            {item.user_profile.name || "Unknown"}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={onClick}
            className={`flex-1 py-1.5 px-3 text-sm rounded-md ${
              darkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            View Details
          </button>

          {/* Admin actions */}
          {isAdmin && item.status === "pending" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove && onApprove(item);
                }}
                className="py-1.5 px-3 text-sm rounded-md bg-green-100 text-green-800 hover:bg-green-200"
              >
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject && onReject(item);
                }}
                className="py-1.5 px-3 text-sm rounded-md bg-red-100 text-red-800 hover:bg-red-200"
              >
                Reject
              </button>
            </>
          )}

          {/* Admin actions for approved items */}
          {isAdmin && item.status === "approved" && (
            <>
              {item.item_type === "pawn" && onMarkAsPawned && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsPawned(item);
                  }}
                  className="py-1.5 px-3 text-sm rounded-md bg-purple-100 text-purple-800 hover:bg-purple-200"
                >
                  Mark as Pawned
                </button>
              )}
              {item.item_type === "sell" && onMarkAsSold && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsSold(item);
                  }}
                  className="py-1.5 px-3 text-sm rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  Mark as Sold
                </button>
              )}
            </>
          )}

          {/* User delete action */}
          {!isAdmin && item.status === "pending" && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="py-1.5 px-3 text-sm rounded-md bg-red-100 text-red-800 hover:bg-red-200"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemCard;
