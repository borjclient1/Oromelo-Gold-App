import React, { useState, useEffect } from "react";
import {
  createListing,
  updateListing,
  deleteListing,
} from "../../services/listings-service";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const ManageListings = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const manageListingsRef = React.useRef(null);

  // Scroll to top when the component mounts
  useEffect(() => {
    if (manageListingsRef.current) {
      manageListingsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  const [formData, setFormData] = useState({
    id: null,
    title: "",
    category: "",
    gold_color: "",
    gold_origin: "",
    purity: "",
    weight: "",
    price: "",
    details: "",
    brand: "",
    image_url: "",
    status: "active",
  });

  const [imageFile, setImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convert numeric inputs
    if (["price", "weight"].includes(name)) {
      setFormData({ ...formData, [name]: parseFloat(value) || "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image size should not exceed 2MB');
      e.target.value = ''; // Reset the file input
      return;
    }
    
    setImageFile(file);
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    // Check each file size
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert('One or more images exceed the 2MB size limit. Please select smaller files.');
      e.target.value = ''; // Reset the file input
      return;
    }
    
    setAdditionalImageFiles(files);
  };

  const uploadImage = async (file, path) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("gold-listings") // Make sure this matches your bucket name
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("gold-listings").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error in uploadImage:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadProgress(0);

    try {
      // Ensure we have form data, use empty object as fallback
      const formDataToUse = formData || {};
      let finalFormData = { ...formDataToUse };

      // Upload main image if provided
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile, "images");
        finalFormData.image_url = imageUrl;
        setUploadProgress(50);
      }

      // Upload additional images if provided
      if (additionalImageFiles.length > 0) {
        const additionalUrls = await Promise.all(
          additionalImageFiles.map((file) => uploadImage(file, "images"))
        );
        finalFormData.additional_images = additionalUrls;
        setUploadProgress(90);
      }

      // Add admin_id to the data
      finalFormData.admin_id = user.id;

      let result;
      if (isEditing) {
        // For updates, extract the id and update the listing
        const { id, ...updateData } = finalFormData;
        result = await updateListing(id, updateData);
      } else {
        // For new listings, remove the id and let the database generate it
        const { id, ...newListingData } = finalFormData;
        console.log(id);
        result = await createListing(newListingData);
      }

      if (result.error) throw result.error;

      setUploadProgress(100);
      resetForm();
      fetchListings();
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving listing:", error);
      alert("Error saving listing. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: "",
      category: "",
      gold_color: "",
      gold_origin: "",
      purity: "",
      weight: "",
      price: "",
      details: "",
      brand: "",
      image_url: "",
      status: "active",
    });
    setImageFile(null);
    setAdditionalImageFiles([]);
    setUploadProgress(0);
  };

  const handleEditClick = (listing) => {
    setFormData({
      id: listing.id,
      title: listing.title || "",
      category: listing.category || "",
      gold_color: listing.gold_color || "",
      gold_origin: listing.gold_origin || "",
      purity: listing.purity || "",
      weight: listing.weight || "",
      price: listing.price || "",
      details: listing.details || "",
      brand: listing.brand || "",
      image_url: listing.image_url || "",
      status: listing.status || "active",
    });
    setIsEditing(true);
    setFormOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        const { error } = await deleteListing(id);
        if (error) throw error;
        fetchListings();
      } catch (error) {
        console.error("Error deleting listing:", error);
        alert("Error deleting listing. Please try again.");
      }
    }
  };

  return (
    <div
      ref={manageListingsRef}
      className={`min-h-screen ${darkMode ? "bg-dark-surface-1 text-white" : "bg-white text-gray-900"}`}
    >
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-4 sm:px-0">
          <h1 className="text-2xl font-bold">Manage Gold Listings</h1>
          <button
            onClick={() => {
              setFormOpen(true);
              setIsEditing(false);
              resetForm();
            }}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 whitespace-nowrap"
          >
            Add New Listing
          </button>
        </div>

        {/* Add/Edit Form */}
        {formOpen && (
          <div
            className={`p-4 sm:p-6 rounded-lg shadow-md mb-8 mx-4 sm:mx-0 ${darkMode ? "bg-dark-surface-2" : "bg-white"}`}
          >
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? "Edit Listing" : "Add New Listing"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Ring">Ring</option>
                    <option value="Necklace">Necklace</option>
                    <option value="Pendant">Pendant</option>
                    <option value="Bracelet">Bracelet</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Watch">Watch</option>
                    <option value="Coin">Coin</option>
                    <option value="Bar">Bar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Purity *
                  </label>
                  <select
                    name="purity"
                    value={formData.purity}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                    required
                  >
                    <option value="">Select Purity</option>
                    <option value="24K">24K (99.9%)</option>
                    <option value="22K">22K (91.7%)</option>
                    <option value="18K">18K (75.0%)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gold Color
                  </label>
                  <select
                    name="gold_color"
                    value={formData.gold_color}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                  >
                    <option value="">Select Color</option>
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Green Gold">Green Gold</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gold Origin
                  </label>
                  <select
                    name="gold_origin"
                    value={formData.gold_origin}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                  >
                    <option value="">Select type</option>
                    <option value="Japanese Gold">Japanese Gold</option>
                    <option value="Saudi Gold">Saudi Gold</option>
                    <option value="Italian Gold">Italian Gold</option>
                    <option value="Chinese Gold">Chinese Gold</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Weight (g) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    step="0.01"
                    className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price (₱) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Details
                  </label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                    rows="3"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Main Image {!isEditing && "*"}
                  </label>
                  {isEditing && (
                    <div
                      className={`mb-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {formData.image_url
                        ? "Current image will be kept unless you upload a new one."
                        : "No current image."}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                    required={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Additional Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className={`w-full p-2 border rounded ${darkMode ? "bg-dark-surface-1 border-gray-700 text-white" : "bg-white border-gray-300"}`}
                  />
                </div>
              </div>

              {uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-amber-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p
                    className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setFormOpen(false);
                  }}
                  className={`px-4 py-2 border rounded ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                >
                  {isEditing ? "Update" : "Create"} Listing
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listings Section */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div
              className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${darkMode ? "border-amber-400" : "border-amber-600"}`}
            ></div>
          </div>
        ) : (
          <div className="px-4 sm:px-0">
            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table
                className={`min-w-full rounded-lg overflow-hidden shadow ${darkMode ? "bg-dark-surface-2" : "bg-white"}`}
              >
                <thead className={darkMode ? "bg-gray-800" : "bg-gray-100"}>
                  <tr>
                    <th className="py-3 px-4 text-left">Image</th>
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-left">Price</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Created</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className={`py-4 px-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        No listings found. Create your first listing!
                      </td>
                    </tr>
                  ) : (
                    listings.map((listing) => (
                      <tr
                        key={listing.id}
                        className={`border-t ${darkMode ? "hover:bg-gray-800 border-gray-700" : "hover:bg-gray-50 border-gray-200"}`}
                      >
                        <td className="py-3 px-4">
                          {listing.image_url ? (
                            <img
                              src={listing.image_url}
                              alt={listing.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div
                              className={`w-16 h-16 rounded flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
                            >
                              <span
                                className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                              >
                                No image
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium">{listing.title}</td>
                        <td className="py-3 px-4">{listing.category}</td>
                        <td className="py-3 px-4">
                          ₱{listing.price?.toLocaleString() || "0"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              listing.status === "active"
                                ? "bg-green-100 text-green-800"
                                : listing.status === "inactive"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {listing.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(listing)}
                              className={`${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(listing.id)}
                              className={`${darkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-800"}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card View (shown only on mobile) */}
            <div className="md:hidden">
              {listings.length === 0 ? (
                <div className={`p-4 text-center rounded-lg shadow ${darkMode ? "bg-dark-surface-2 text-gray-400" : "bg-white text-gray-500"}`}>
                  No listings found. Create your first listing!
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div 
                      key={listing.id}
                      className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-dark-surface-2" : "bg-white"}`}
                    >
                      <div className="flex items-start p-4">
                        <div className="mr-4">
                          {listing.image_url ? (
                            <img
                              src={listing.image_url}
                              alt={listing.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div
                              className={`w-16 h-16 rounded flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
                            >
                              <span
                                className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                              >
                                No image
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-lg mb-1 truncate">{listing.title}</h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Category: </span>
                              {listing.category}
                            </div>
                            <div>
                              <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Price: </span>
                              ₱{listing.price?.toLocaleString() || "0"}
                            </div>
                            <div>
                              <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Status: </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  listing.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : listing.status === "inactive"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {listing.status}
                              </span>
                            </div>
                            <div>
                              <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Created: </span>
                              {new Date(listing.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex justify-end px-4 py-3 gap-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                        <button
                          onClick={() => handleEditClick(listing)}
                          className={`px-3 py-1 text-sm rounded ${darkMode 
                            ? "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50" 
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(listing.id)}
                          className={`px-3 py-1 text-sm rounded ${darkMode 
                            ? "bg-red-900/30 text-red-300 hover:bg-red-900/50" 
                            : "bg-red-50 text-red-700 hover:bg-red-100"}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageListings;
