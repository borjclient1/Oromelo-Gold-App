import React, { useState, useEffect } from "react";
import {
  getInquiries,
  markInquiryAsRead,
  deleteInquiry,
} from "../../services/listings-service";
import { useTheme } from "../../hooks/useTheme";

const ListingInquiries = () => {
  const { darkMode } = useTheme();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const inquiriesRef = React.useRef(null);
  
  // Scroll to top when the component mounts
  useEffect(() => {
    if (inquiriesRef.current) {
      inquiriesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await getInquiries();
      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInquiryClick = async (inquiry) => {
    setSelectedInquiry(inquiry);

    // Mark as read if it's unread
    if (inquiry.status === "unread") {
      try {
        await markInquiryAsRead(inquiry.id);
        // Update local state
        setInquiries(
          inquiries.map((item) =>
            item.id === inquiry.id ? { ...item, status: "read" } : item
          )
        );
      } catch (error) {
        console.error("Error marking inquiry as read:", error);
      }
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    if (window.confirm("Are you sure you want to delete this inquiry? This action cannot be undone.")) {
      try {
        const { error } = await deleteInquiry(inquiryId);
        if (error) throw error;
        
        // Remove from local state
        setInquiries(inquiries.filter(item => item.id !== inquiryId));
        
        // If the deleted inquiry was selected, clear the selection
        if (selectedInquiry && selectedInquiry.id === inquiryId) {
          setSelectedInquiry(null);
        }
      } catch (error) {
        console.error("Error deleting inquiry:", error);
        alert("Failed to delete inquiry. Please try again.");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "unread":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Unread
          </span>
        );
      case "read":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Read
          </span>
        );
      case "replied":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Replied
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={inquiriesRef} className={`min-h-screen ${darkMode ? 'bg-dark-surface-1 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Listing Inquiries</h1>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${darkMode ? 'border-amber-400' : 'border-amber-600'}`}></div>
          </div>
        ) : (
          <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-dark-surface-2' : 'bg-white'}`}>
            {/* Mobile View Controls */}
            <div className="lg:hidden px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium">
                {selectedInquiry ? 'Inquiry Details' : 'Inquiries'}
              </h2>
              {selectedInquiry && (
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
                >
                  Back to List
                </button>
              )}
            </div>

            <div className="flex flex-col lg:flex-row h-[500px] lg:h-[calc(100vh-200px)]">
              {/* Inquiry List - Hidden on mobile when an inquiry is selected */}
              <div className={`${selectedInquiry ? 'hidden lg:block' : 'block'} lg:w-1/3 border-r overflow-y-auto h-full ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {inquiries.length === 0 ? (
                  <div className={`p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No inquiries found.
                  </div>
                ) : (
                  <ul>
                    {inquiries.map((inquiry) => (
                      <li
                        key={inquiry.id}
                        onClick={() => handleInquiryClick(inquiry)}
                        className={`p-4 border-b cursor-pointer ${
                          selectedInquiry?.id === inquiry.id 
                            ? darkMode ? 'bg-amber-900/20' : 'bg-amber-50' 
                            : ''
                        } ${
                          darkMode 
                            ? 'hover:bg-gray-800 border-gray-700' 
                            : 'hover:bg-gray-50 border-gray-200'
                        } ${inquiry.status === "unread" ? "font-semibold" : ""}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {inquiry.profiles?.name || "User"}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                              {inquiry.listings?.title || "Unknown Listing"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(inquiry.created_at).toLocaleDateString()}
                            </span>
                            {getStatusBadge(inquiry.status)}
                          </div>
                        </div>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1 truncate`}>
                          {inquiry.message}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Inquiry Detail - Shown on mobile only when an inquiry is selected */}
              <div className={`${!selectedInquiry && 'hidden lg:block'} lg:w-2/3 p-4 md:p-6 overflow-y-auto h-full`}>
                {selectedInquiry ? (
                  <div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                      <div>
                        <h2 className="text-xl font-semibold break-words">
                          Inquiry from {selectedInquiry.profiles?.name}
                        </h2>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} break-words`}>
                          For: {selectedInquiry.listings?.title}
                        </p>
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(selectedInquiry.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} overflow-x-auto`}>
                      <p className="whitespace-pre-line break-words">
                        {selectedInquiry.message}
                      </p>
                    </div>

                    <div className={`border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className="font-medium mb-2">Contact Information</h3>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} break-words`}>
                        Email: {selectedInquiry.profiles?.email || "No email provided"}
                      </p>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} break-words`}>
                        Phone: {selectedInquiry.contact_number || "No phone provided"}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <a
                          href={`mailto:${selectedInquiry.profiles?.email}`}
                          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 inline-flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          Reply via Email
                        </a>
                        <button
                          onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 inline-flex items-center"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 mr-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                            />
                          </svg>
                          Delete Inquiry
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                      Select an inquiry from the list to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingInquiries;
