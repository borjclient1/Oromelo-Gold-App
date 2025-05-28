import { useState, useCallback } from 'react';

/**
 * Base hook for item operations
 * Provides common functionality for both admin and user views
 */
export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemCounts, setItemCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    sold: 0,
    pawned: 0,
    rejected: 0
  });
  
  const itemsPerPage = 6;

  // Custom setter for items
  const setItemsWithLog = useCallback((newItems) => {
    setItems(newItems);
  }, []);
  
  // Custom setter for loading
  const setLoadingWithLog = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  // Transforms API data into a consistent format for both views
  const transformItemData = useCallback((itemsData) => {
    return itemsData.map((item) => {
      const result = { ...item };

      // Add pawn details if this is a pawn item
      if (
        item.item_type === "pawn" &&
        item.pawn_requests &&
        item.pawn_requests.length > 0
      ) {
        const pawnRequest = item.pawn_requests[0];
        result.pawn_request = pawnRequest;

        // For display in the existing UI components
        if (item.status === "pawned") {
          result.pawn_details = {
            date: item.updated_at,
            amount: pawnRequest.pawn_price,
            interest_rate: pawnRequest.interest_rate || "TBD",
            duration: pawnRequest.duration || "TBD",
            notes: pawnRequest.details,
          };
        }
      }

      // Add sell request details if this is a sell item
      if (
        item.item_type === "sell" &&
        item.sell_requests &&
        item.sell_requests.length > 0
      ) {
        const sellRequest = item.sell_requests[0];
        result.sell_request = sellRequest;

        // For display in the existing UI components
        if (item.status === "sold") {
          result.sell_details = {
            date: item.updated_at,
            amount: sellRequest.sell_price,
            notes: sellRequest.details,
          };
        }
      }

      return result;
    });
  }, []);

  // Calculate the items for the current page
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    // Data
    items,
    paginatedItems,
    itemCounts,
    loading,
    error,
    currentPage,
    itemsPerPage,
    
    // Setters
    setItems: setItemsWithLog,
    setLoading: setLoadingWithLog,
    setError,
    setItemCounts,
    setCurrentPage,
    
    // Utilities
    transformItemData,
  };
}

export default useItems;
