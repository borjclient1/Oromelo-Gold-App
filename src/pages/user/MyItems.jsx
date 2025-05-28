import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { supabase } from "../../services/supabase";
import useUserItems from "../../hooks/useUserItems";
import ItemList from "../../components/items/ItemList";
import ItemTabs from "../../components/items/ItemTabs";
import ItemDetails from "../../components/items/ItemDetails";

function MyItems() {
  const myItemsRef = useRef(null);

  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // State for controlling item details and editing
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Use the user items hook
  const {
    items,
    loading,
    error,
    itemCounts,
    fetchItems,
    handleDeleteItem,
    handleMarkAsSold,
  } = useUserItems({
    user,
    activeTab,
    sortBy,
    sortOrder,
    currentPage,
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }

    // Explicitly call fetchItems when component mounts
    fetchItems();
  }, [user, navigate, fetchItems]);

  // Scroll to top when the component mounts & when currentPage changes
  useEffect(() => {
    if (myItemsRef.current && currentPage !== null) {
      myItemsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // View details of an item
  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDetailsOpen(true);
    setEditMode(false);
    setEditedItem(null);
    setEditErrors({});
  };

  // Close details overlay
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedItem(null);
    setEditMode(false);
    setEditedItem(null);
  };

  // Sort handlers
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Action handlers
  const handleEditItem = () => {
    // Make sure all form values are properly formatted as strings for select elements
    const formattedItem = {
      ...selectedItem,
      category: selectedItem.category || "",
      gold_type: selectedItem.gold_type || "",
      gold_origin: selectedItem.gold_origin || "",
      purity: selectedItem.purity ? String(selectedItem.purity) : "", // Convert to string
      weight: selectedItem.weight || "",
      amount: selectedItem.amount || "",
    };

    setEditMode(true);
    setEditedItem(formattedItem);
    setEditErrors({});
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedItem(null);
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSellerChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({
      ...prev,
      sell_request: {
        ...prev.sell_request,
        [name]: value,
      },
    }));
  };

  // Validate the edited item
  const validateEditedItem = () => {
    const errors = {};

    // Required fields validation
    if (!editedItem.title.trim()) errors.title = "Title is required";
    if (!editedItem.category.trim()) errors.category = "Category is required";
    if (editedItem.item_type === "sell") {
      if (!editedItem.gold_origin.trim())
        errors.gold_origin = "Gold Type is required";
      if (!editedItem.purity.trim()) errors.purity = "Purity is required";
      if (!editedItem.gold_type.trim())
        errors.gold_type = "Gold Color is required";
      if (!editedItem.amount) errors.amount = "Price is required";
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save the edited item
  const handleSaveItem = async () => {
    if (!validateEditedItem()) return;

    setSaveLoading(true);
    try {
      // Update the item in the items table
      const { error: itemError } = await supabase
        .from("items")
        .update({
          title: editedItem.title,
          category: editedItem.category,
          gold_type: editedItem.gold_type,
          gold_origin: editedItem.gold_origin,
          purity: editedItem.purity,
          weight:
            editedItem.weight !== "" ? parseFloat(editedItem.weight) : null,
          amount:
            editedItem.amount !== "" ? parseFloat(editedItem.amount) : null,
          details: editedItem.details || null,
          brand: editedItem.brand || null,
        })
        .eq("id", editedItem.id);

      if (itemError) throw itemError;

      // If it's a sell item, update the seller information
      if (editedItem.item_type === "sell" && editedItem.sell_request) {
        const { error: sellError } = await supabase
          .from("sell_requests")
          .update({
            full_name: editedItem.sell_request.full_name,
            contact_number: editedItem.sell_request.contact_number,
            email: editedItem.sell_request.email,
          })
          .eq("item_id", editedItem.id);

        if (sellError) throw sellError;
      }

      // If it's a pawn item, update the pawn request information
      if (editedItem.item_type === "pawn") {
        const { error: pawnError } = await supabase
          .from("pawn_requests")
          .update({
            pawn_price: editedItem.amount,
            details: editedItem.details || null,
          })
          .eq("item_id", editedItem.id);

        if (pawnError) {
          throw pawnError;
        }
      }

      // Fetch updated items to refresh the list
      fetchItems();

      // Update selected item
      setSelectedItem((prevItem) => {
        // Create a properly updated item with all the new values
        const updatedItem = { ...editedItem };

        // If it's a pawn item, make sure the pawn_request data is updated too
        if (editedItem.item_type === "pawn") {
          updatedItem.pawn_request = {
            ...(prevItem?.pawn_request || {}),
            pawn_price: editedItem.amount,
            details: editedItem.details || null,
          };
        }

        return updatedItem;
      });

      // Exit edit mode
      setEditMode(false);
      setEditedItem(null);

      alert("Item updated successfully!");
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (itemId) => {
    if (
      !confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    )
      return;

    const result = await handleDeleteItem(itemId);
    if (result.success) {
      alert(result.message);
      if (detailsOpen) {
        handleCloseDetails();
      }
    } else {
      alert(result.message);
    }
  };

  // Handle mark as sold with confirmation
  const handleSold = async (itemId) => {
    if (!confirm("Are you sure you want to mark this item as sold?")) return;

    const result = await handleMarkAsSold(itemId);
    if (result.success) {
      alert(result.message);
      if (detailsOpen && selectedItem && selectedItem.id === itemId) {
        setSelectedItem({
          ...selectedItem,
          status: "sold",
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      alert(result.message);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-dark-surface text-gray-200" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={myItemsRef} className="px-4 sm:px-0">
          <h1 className="text-3xl leading-9 font-bold">My Gold Items</h1>
          <p className={`mt-1 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
            Manage your gold items listed for pawning or selling
          </p>
        </div>

        {/* Sorting controls */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div className="flex space-x-2">
              <a
                href="/pawn-item"
                className={`px-4 py-2 rounded text-sm flex items-center ${
                  darkMode
                    ? "bg-gold hover:bg-gold-600 text-black"
                    : "bg-gold hover:bg-gold-600 text-black"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Pawn New Item
              </a>
              <a
                href="/sell-item"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Sell New Item
              </a>
            </div>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
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
                You don't have any items for this status.
              </p>
            </div>
          ) : (
            <ItemList
              items={items}
              handleViewDetails={handleViewDetails}
              handleDeleteItem={handleDeleteItem}
              isAdmin={false}
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
            isAdmin={false}
            isEditing={editMode}
            editedItem={editedItem}
            onClose={handleCloseDetails}
            onEdit={handleEditItem}
            onSave={handleSaveItem}
            onCancel={handleCancelEdit}
            onDelete={handleDelete}
            onMarkAsSold={handleSold}
            editErrors={editErrors}
            onEditChange={handleEditChange}
            onSellerChange={handleSellerChange}
            saveLoading={saveLoading}
          />
        )}
      </div>
    </div>
  );
}

export default MyItems;
