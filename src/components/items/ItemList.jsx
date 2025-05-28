import React, { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";
import ItemCard from "./ItemCard";
import Pagination from "../common/Pagination";

function ItemList({
  items = [],
  handleViewDetails,
  handleDeleteItem,
  handleApproveItem,
  handleRejectItem,
  handleMarkAsPawned,
  handleMarkAsSold,
  isAdmin = false,
  darkMode: propDarkMode,
  pageSize = 6,
  currentPage: propCurrentPage = 1,
  setCurrentPage: propSetCurrentPage = () => {},
}) {
  // Use provided darkMode from props or from the theme context
  const themeContext = useTheme();
  const darkMode =
    propDarkMode !== undefined ? propDarkMode : themeContext.darkMode;

  // Local state for pagination if not provided
  const [localCurrentPage, setLocalCurrentPage] = useState(1);

  // Determine which page state to use
  const currentPage = propCurrentPage || localCurrentPage;
  const setCurrentPage = propSetCurrentPage || setLocalCurrentPage;

  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length, setCurrentPage]);

  // Calculate paginated items
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / pageSize);

  return (
    <div className="space-y-6">
      {/* Grid of item cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onClick={() => handleViewDetails(item)}
            onDelete={handleDeleteItem}
            onApprove={handleApproveItem}
            onReject={handleRejectItem}
            onMarkAsPawned={handleMarkAsPawned}
            onMarkAsSold={handleMarkAsSold}
            isAdmin={isAdmin}
            darkMode={darkMode}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default ItemList;
