import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";

function EditItem() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    price_estimate: "",
    item_type: "sell",
    status: "available",
    color: "",
    gold_type: "",
    gold_origin: "",
    karat: "",
    brand: "",
  });

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      setFetchLoading(true);
      setError(null);

      if (!user) {
        navigate("/signin", { state: { from: `/my-items/edit/${id}` } });
        return;
      }

      try {
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        // Check if this item belongs to the current user or user is admin
        if (data.user_id !== user.id && user.email !== "admin@goldpawn.com") {
          navigate("/my-items");
          return;
        }

        setFormData({
          title: data.title,
          category: data.category,
          description: data.description || "",
          price_estimate: data.price_estimate,
          item_type: data.item_type,
          status: data.status,
          color: data.color,
          gold_type: data.gold_type,
          gold_origin: data.gold_origin,
          karat: data.karat,
          brand: data.brand,
        });

        setImagePreview(data.image_url);
      } catch (error) {
        console.error("Error fetching item:", error);
        setError("Failed to fetch item details. Please try again later.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchItem();
  }, [id, user, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price_estimate" ? parseFloat(value) || "" : value,
    });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      let image_url = imagePreview;

      // Upload new image to Supabase Storage if file is selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("gold-items-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded image
        const { data: urlData } = supabase.storage
          .from("gold-items-images")
          .getPublicUrl(filePath);

        image_url = urlData.publicUrl;
      }

      // Update the item in the database
      const { error } = await supabase
        .from("items")
        .update({
          title: formData.title,
          category: formData.category,
          // Handle different fields depending on item_type
          ...(formData.item_type === "sell"
            ? {
                gold_type: formData.color || formData.gold_type,
                gold_origin: formData.gold_origin,
                purity: formData.karat || formData.purity,
              }
            : {}),
          status: formData.status,
          ...(imageFile && { image_url }),
        })
        .eq("id", id);

      if (error) throw error;

      // If this is a sell item, also update the sell_requests table
      if (formData.item_type === "sell") {
        const { error: sellUpdateError } = await supabase
          .from("sell_requests")
          .update({
            selling_price: formData.price_estimate,
            details: formData.description,
            brand: formData.brand || null,
          })
          .eq("item_id", id);

        if (sellUpdateError) {
          console.error(
            "Could not update sell request details:",
            sellUpdateError
          );
        }
      }

      // If this is a pawn item, also update the pawn_request table
      if (formData.item_type === "pawn") {
        const { error: pawnUpdateError } = await supabase
          .from("pawn_requests")
          .update({
            pawn_price: formData.price_estimate,
            details: formData.description,
          })
          .eq("item_id", id);

        if (pawnUpdateError) {
          console.error(
            "Could not update pawn request details:",
            pawnUpdateError
          );
        }
      }

      // Navigate back to the item details or my items page
      navigate(`/items/${id}`);
    } catch (error) {
      console.error("Error updating item:", error);
      setError(error.message || "Failed to update item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/my-items"
            className="text-gold hover:underline flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to My Items
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          Edit Gold Item
        </h1>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Item Type Selection */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Listing Type *
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="item_type"
                        value="sell"
                        checked={formData.item_type === "sell"}
                        onChange={handleChange}
                        className="h-4 w-4 text-gold focus:ring-gold border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        For Sale
                      </span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="item_type"
                        value="pawn"
                        checked={formData.item_type === "pawn"}
                        onChange={handleChange}
                        className="h-4 w-4 text-gold focus:ring-gold border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        For Pawn
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                    <option value="pawned">Pawned</option>
                  </select>
                </div>
              </div>

              {/* Item Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Item Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., 14K Gold Necklace with Diamond Pendant"
                  className="input-field"
                />
              </div>

              {/* Item Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="necklaces">Necklaces</option>
                  <option value="rings">Rings</option>
                  <option value="bracelets">Bracelets</option>
                  <option value="earrings">Earrings</option>
                  <option value="watches">Watches</option>
                  <option value="coins">Coins</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Item Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your item in detail (condition, age, etc.)"
                  className="input-field"
                ></textarea>
              </div>

              {/* Item Price */}
              <div>
                <label
                  htmlFor="price_estimate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Estimated Price ($) *
                </label>
                <input
                  type="number"
                  id="price_estimate"
                  name="price_estimate"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price_estimate}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="input-field"
                />
              </div>

              {/* Item Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Image
                </label>

                {imagePreview && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Current Image:</p>
                    <img
                      src={imagePreview}
                      alt="Current"
                      className="w-40 h-40 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <label className="flex flex-col items-center px-4 py-6 bg-white text-gold rounded-lg shadow-lg tracking-wide border border-gold cursor-pointer hover:bg-gold hover:text-white">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                    </svg>
                    <span className="mt-2 text-base leading-normal">
                      Change Image
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>

                  {imageFile && (
                    <div className="ml-5 relative">
                      <p className="text-sm text-gray-500 mb-2">New Image:</p>
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="New"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Upload a clear image of your item. Recommended size: at least
                  800x600 pixels.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Link
                  to="/my-items"
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 btn-primary ${
                    loading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditItem;
