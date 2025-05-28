import React from 'react';
import { useTheme } from '../../hooks/useTheme';

function ItemTabs({ 
  activeTab, 
  handleTabChange, 
  itemCounts,
  darkMode: propDarkMode
}) {
  // Use provided darkMode from props or from the theme context
  const themeContext = useTheme();
  const darkMode = propDarkMode !== undefined ? propDarkMode : themeContext.darkMode;

  // Define the tabs configuration - same tabs for both admin and user views
  const tabs = [
    { id: "all", label: "All Items" },
    { id: "pending", label: "Pending Review" },
    { id: "approved", label: "Approved" },
    { id: "sold", label: "Sold" },
    { id: "pawned", label: "Pawned" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div
      className={`mb-6 border-b ${
        darkMode ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div className="flex flex-wrap -mb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? "border-b-2 border-gold text-gold"
                : darkMode
                ? "text-gray-400 hover:text-gold hover:border-gray-600 hover:border-b-2"
                : "text-gray-500 hover:text-gold hover:border-gray-300 hover:border-b-2"
            }`}
          >
            {tab.label}
            <span
              className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                darkMode
                  ? "bg-dark-surface-3 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {itemCounts[tab.id] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ItemTabs;
