import React from 'react';
import { useTheme } from '../../hooks/useTheme';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const { darkMode } = useTheme();
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than our max, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of page numbers to show
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust start and end to ensure we show enough pages
      if (end - start + 1 < Math.min(maxPagesToShow - 2, totalPages - 2)) {
        if (currentPage < totalPages / 2) {
          end = Math.min(totalPages - 1, start + Math.min(maxPagesToShow - 3, totalPages - 3));
        } else {
          start = Math.max(2, end - Math.min(maxPagesToShow - 3, totalPages - 3));
        }
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle page numbers
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center mt-6 space-x-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md text-sm ${
          darkMode
            ? currentPage === 1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-600'
            : currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Previous
      </button>
      
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
            darkMode
              ? page === currentPage
                ? 'bg-gold text-gray-900 font-medium'
                : page === '...'
                ? 'bg-gray-700 text-gray-400 cursor-default'
                : 'bg-gray-700 text-white hover:bg-gray-600'
              : page === currentPage
                ? 'bg-gold text-white font-medium'
                : page === '...'
                ? 'bg-gray-200 text-gray-400 cursor-default'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md text-sm ${
          darkMode
            ? currentPage === totalPages
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-600'
            : currentPage === totalPages
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
