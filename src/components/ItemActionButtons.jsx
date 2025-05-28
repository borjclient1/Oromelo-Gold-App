import React from 'react';
import { useTheme } from '../hooks/useTheme';

function ItemActionButtons({ item, onApprove, onReject, onSell, onPawn, onDelete }) {
  const { darkMode } = useTheme();

  // Different button sets based on item status
  const renderActionButtons = () => {
    switch (item.status) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onApprove(item)}
              className={`px-3 py-1.5 text-white text-xs rounded ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'}`}
              title="Approve this item"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(item)}
              className={`px-3 py-1.5 text-white text-xs rounded ${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}
              title="Reject this item"
            >
              Reject
            </button>
          </div>
        );
        
      case 'approved':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onSell(item)}
              className={`px-3 py-1.5 text-white text-xs rounded ${darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}
              title="Mark as sold"
            >
              Mark Sold
            </button>
            <button
              onClick={() => onPawn(item)}
              className={`px-3 py-1.5 text-white text-xs rounded ${darkMode ? 'bg-purple-700 hover:bg-purple-600' : 'bg-purple-600 hover:bg-purple-700'}`}
              title="Mark as pawned"
            >
              Mark Pawned
            </button>
          </div>
        );
        
      case 'sold':
      case 'pawned':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onDelete(item.id)}
              className={`px-3 py-1.5 text-white text-xs rounded ${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}
              title="Delete this item"
            >
              Delete
            </button>
          </div>
        );
        
      case 'rejected':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onApprove(item)}
              className={`px-3 py-1.5 text-white text-xs rounded ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'}`}
              title="Approve this item"
            >
              Approve
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className={`px-3 py-1.5 text-white text-xs rounded ${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}
              title="Delete this item"
            >
              Delete
            </button>
          </div>
        );
        
      default:
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onDelete(item.id)}
              className={`px-3 py-1.5 text-white text-xs rounded ${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'}`}
              title="Delete this item"
            >
              Delete
            </button>
          </div>
        );
    }
  };

  return (
    <div className="mt-4 flex justify-end">
      {renderActionButtons()}
    </div>
  );
}

export default ItemActionButtons;
