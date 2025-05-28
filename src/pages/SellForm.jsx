import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

function SellForm() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const sellFormRef = React.useRef(null);

  // Scroll to top when the component mounts
  React.useEffect(() => {
    if (sellFormRef.current) {
      sellFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  
  // State to check if any "Other" option is selected
  const [hasOtherSelected, setHasOtherSelected] = useState(false);

  // Track validation errors for each field
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    price_estimate: "",
    gold_origin: "", // Field for gold origin/source
    karat: "", // Field for karat
    color: "", // Field for gold color
    weight: "", // Field for gold weight
    brand: "", // Brand field for SellForm
    full_name: "",
    contact_number: "",
    email: "",
  });

  // Handle form input changes
  function handleChange(e) {
    const { name, value } = e.target;

    // Clear the error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }

    const updatedFormData = {
      ...formData,
      [name]:
        name === "price_estimate" || name === "weight"
          ? parseFloat(value) || ""
          : value,
    };
    
    setFormData(updatedFormData);
    
    // Check if any "Other" option is selected in any of the dropdown fields
    const hasOther = 
      updatedFormData.category === "Other" ||
      updatedFormData.karat === "Other" ||
      updatedFormData.color === "Other" ||
      updatedFormData.gold_origin === "Other";
    
    setHasOtherSelected(hasOther);
  }

  // Handle image file selection
  function handleImageChange(e) {
    const files = e.target.files;
    if (!files) return;

    handleFileUpload(files);

    // Clear image error when files are selected
    if (fieldErrors.images) {
      setFieldErrors((prev) => ({
        ...prev,
        images: false,
      }));
    }
  }

  // Validate fields and return an object with error flags
  function validateFields(step) {
    const errors = {};
    let hasErrors = false;

    // Step 1 validation fields
    if (step === 1 || step === "all") {
      if (!formData.title) {
        errors.title = true;
        hasErrors = true;
      }

      if (!formData.category) {
        errors.category = true;
        hasErrors = true;
      }

      if (!formData.gold_origin) {
        errors.gold_origin = true;
        hasErrors = true;
      }

      if (!formData.karat) {
        errors.karat = true;
        hasErrors = true;
      }

      if (!formData.color) {
        errors.color = true;
        hasErrors = true;
      }
      
      // Check if description is required (when any "Other" option is selected) and empty
      if (hasOtherSelected && !formData.description) {
        errors.description = true;
        hasErrors = true;
      }

      if (!imageFiles.length) {
        errors.images = true;
        hasErrors = true;
      }
    }

    // Step 2 validation fields
    if (step === 2 || step === "all") {
      if (!formData.price_estimate) {
        errors.price_estimate = true;
        hasErrors = true;
      }

      if (!formData.full_name) {
        errors.full_name = true;
        hasErrors = true;
      }

      if (!formData.contact_number) {
        errors.contact_number = true;
        hasErrors = true;
      }

      if (!formData.email) {
        errors.email = true;
        hasErrors = true;
      }
    }

    return { errors, hasErrors };
  }

  // Handle navigation to next step
  function handleNextStep() {
    // Validate step 1 data
    const { errors, hasErrors } = validateFields(1);

    if (hasErrors) {
      setFieldErrors(errors);
      setError("Please fill in all required fields");
      return;
    }

    setError(null);
    setFieldErrors({});
    setCurrentStep(2);
  }

  // Handle navigation to previous step
  function handlePrevStep() {
    setError(null);
    setFieldErrors({});
    setCurrentStep(1);
  }

  // Load user profile data when component mounts
  useEffect(() => {
    if (user) {
      // Fetch user profile data from Supabase
      async function fetchUserProfile() {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("name, phone, email")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          if (data) {
            setFormData((prev) => ({
              ...prev,
              full_name: data.name || "",
              contact_number: data.phone || "",
              email: data.email || user.email || "",
            }));
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }

      fetchUserProfile();
    }
  }, [user]);

  // Handle drag events
  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  // Handle drop event
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);

      // Clear image error when files are dropped
      if (fieldErrors.images) {
        setFieldErrors((prev) => ({
          ...prev,
          images: false,
        }));
      }
    }
  }

  // Process the uploaded file
  function handleFileUpload(files) {
    // Convert FileList to Array for easier processing
    const filesArray = Array.from(files);

    // Limit to 3 images
    if (imageFiles.length + filesArray.length > 3) {
      setError("You can upload a maximum of 3 images");
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    // Check each file
    filesArray.forEach((file) => {
      // Check if it's an image
      if (!file.type.match("image.*")) {
        setError("Only image files are allowed");
        return;
      }

      // Check file size - limit to 2MB
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 2) {
        setError("Image file is too large. Maximum size is 2MB.");
        return;
      }

      validFiles.push(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === validFiles.length) {
          setImageFiles([...imageFiles, ...validFiles]);
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Remove an image
  function handleRemoveImage(index) {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);

    // Set image error if no images left
    if (newFiles.length === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        images: true,
      }));
    }
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      setError("You must be signed in to sell items");
      return;
    }

    // Validate all fields
    const { errors, hasErrors } = validateFields("all");

    if (hasErrors) {
      setFieldErrors(errors);
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Create record in the items table - using the same table structure as PawnForm
      const item = {
        user_id: user.id,
        title: formData.title,
        category: formData.category,
        gold_type: formData.color,
        gold_origin: formData.gold_origin,
        purity: formData.karat,
        weight: formData.weight !== "" ? parseFloat(formData.weight) : null,
        item_type: "sell",
        status: "pending",
        created_at: new Date().toISOString(),
        // Add the missing fields to the items table
        amount:
          formData.price_estimate !== ""
            ? parseFloat(formData.price_estimate)
            : null,
        details: formData.description || null,
        brand: formData.brand || null,
      };

      const { data, error: insertError } = await supabase
        .from("items")
        .insert(item)
        .select();

      if (insertError) throw insertError;

      const itemId = data[0].id;

      // Store seller information in the sell_requests table
      const sellRequestData = {
        item_id: itemId,
        full_name: formData.full_name,
        contact_number: formData.contact_number,
        email: formData.email,
      };

      const { error: sellRequestError } = await supabase
        .from("sell_requests")
        .insert(sellRequestData);

      if (sellRequestError) throw sellRequestError;

      // If there's an image, upload it to storage
      if (imageFiles.length) {
        const imageUrls = [];

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${user.id}-${Date.now()}-${i}.${fileExt}`;
          const filePath = `items/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("gold-items-images")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("gold-items-images")
            .getPublicUrl(filePath);

          imageUrls.push(urlData.publicUrl);
        }

        // Update the item record with image URLs
        if (imageUrls.length > 0) {
          const { error: updateError } = await supabase
            .from("items")
            .update({
              image_url: imageUrls[0],
              additional_images: imageUrls.slice(1), // Match PawnForm format
            })
            .eq("id", itemId);

          if (updateError) throw updateError;
        }
      }

      // Send notification to admin about the new item
      try {
        await fetch("/.netlify/functions/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.full_name,
            email: formData.email,
            phone: formData.contact_number,
            itemTitle: formData.title,
            message: `A new item has been listed for sale:

Item Details:
- Title: ${formData.title}
- Category: ${formData.category}
- Description: ${formData.description || "N/A"}
- Listed By: ${formData.full_name}
- Contact Email: ${formData.email}
- Contact Number: ${formData.contact_number}

Please check the admin panel for more details and to take appropriate action.`,
          }),
        });
      } catch (emailError) {
        console.error(
          "Email notification failed, but item was created:",
          emailError
        );
        // Continue with the flow even if email fails
      }

      navigate(`/my-items`);
    } catch (error) {
      console.error("Error creating item:", error);
      setError(error.message || "Error creating item");
    } finally {
      setLoading(false);
    }
  }

  // Helper function to get input classes based on field error state
  function getInputClasses(fieldName) {
    const baseClasses = `${
      darkMode
        ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
        : "border-gray-300 focus:ring-gold focus:border-gold"
    } w-full px-3 py-2 border shadow-sm rounded-md`;

    // Add error classes if the field has an error
    return fieldErrors[fieldName]
      ? `${baseClasses} ${
          darkMode ? "border-red-700" : "border-red-500"
        } ring-2 ${darkMode ? "ring-red-700" : "ring-red-500"}`
      : baseClasses;
  }

  return (
    <div
      ref={sellFormRef}
      className={`min-h-screen ${
        darkMode ? "bg-dark-surface text-gray-200" : "bg-gray-50 text-gray-900"
      } py-8`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className={`text-3xl font-extrabold text-center ${
            darkMode ? "text-gold" : "text-gray-900"
          } mb-6`}
        >
          Sell Your Gold Item
        </h1>

        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div
              className={`flex items-center justify-center rounded-full h-10 w-10 
              ${
                currentStep === 1
                  ? "bg-gold text-white"
                  : darkMode
                    ? "bg-dark-surface-3 text-gray-400"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div
              className={`h-1 w-16 ${
                currentStep === 2
                  ? "bg-gold"
                  : darkMode
                    ? "bg-dark-surface-3"
                    : "bg-gray-200"
              }`}
            />
            <div
              className={`flex items-center justify-center rounded-full h-10 w-10 
              ${
                currentStep === 2
                  ? "bg-gold text-white"
                  : darkMode
                    ? "bg-dark-surface-3 text-gray-400"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <span
              className={`text-sm mx-4 ${
                currentStep === 1
                  ? "text-gold font-medium"
                  : darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
              }`}
            >
              Item Details
            </span>
            <span
              className={`text-sm mx-4 ${
                currentStep === 2
                  ? "text-gold font-medium"
                  : darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
              }`}
            >
              Seller Information
            </span>
          </div>
        </div>

        <div
          className={`${
            darkMode
              ? "bg-dark-surface-2 border border-dark-surface-4"
              : "bg-white"
          } shadow-lg rounded-lg overflow-hidden p-6`}
        >
          {error && (
            <div
              className={`mb-6 ${
                darkMode
                  ? "bg-red-900 bg-opacity-30 border-red-700"
                  : "bg-red-50 border-red-400"
              } border-l-4 p-4`}
            >
              <div className="flex">
                <div className="ml-3">
                  <p
                    className={`text-sm ${
                      darkMode ? "text-red-300" : "text-red-700"
                    }`}
                  >
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div>
                <label
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  Upload Images{" "}
                  <span className="text-amber-500 font-bold text-lg">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-md p-6 text-center ${
                    dragActive
                      ? "border-gold bg-amber-50"
                      : fieldErrors.images
                        ? darkMode
                          ? "border-red-700 bg-red-900 bg-opacity-20"
                          : "border-red-500 bg-red-50"
                        : darkMode
                          ? "border-dark-surface-4 bg-dark-surface-3"
                          : "border-gray-300"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    name="image"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <svg
                      className={`mx-auto h-12 w-12 ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 015.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p
                      className={`mt-2 text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Click to upload or drag and drop
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      PNG, JPG, GIF up to 2MB (Maximum 3 images)
                    </p>
                  </label>
                </div>

                {/* Image preview */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-2`}
                    >
                      Selected Images:
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p
                  className={`mt-2 text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Upload a clear photo of your item. If available, include the
                  original receipt in one of the photos.
                </p>
              </div>

              {/* Item Basic Info */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="title"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Item Title{" "}
                    <span className="text-amber-500 font-bold text-lg">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className={getInputClasses("title")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Category{" "}
                    <span className="text-amber-500 font-bold text-lg">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className={getInputClasses("category")}
                  >
                    <option value="">Select a category</option>
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
                  {formData.category === "Other" && (
                    <p
                      className={`mt-2 text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Please provide details in the Description Field
                    </p>
                  )}
                </div>
              </div>

              {/* Gold Properties */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

                <div>
                  <label
                    htmlFor="gold_origin"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Gold Type{" "}
                    <span className="text-amber-500 font-bold text-lg">*</span>
                  </label>
                  <select
                    id="gold_origin"
                    name="gold_origin"
                    value={formData.gold_origin}
                    onChange={handleChange}
                    required
                    className={getInputClasses("gold_origin")}
                  >
                    <option value="">Select type</option>
                    <option value="Japanese Gold">Japanese Gold</option>
                    <option value="Saudi Gold">Saudi Gold</option>
                    <option value="Italian Gold">Italian Gold</option>
                    <option value="Chinese Gold">Chinese Gold</option>
                    <option value="Other">Other</option>
                  </select>
                  {formData.gold_origin === "Other" && (
                    <p
                      className={`mt-2 text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Please provide details in the Description Field
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="karat"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Purity{" "}
                    <span className="text-amber-500 font-bold text-lg">*</span>
                  </label>
                  <select
                    id="karat"
                    name="karat"
                    value={formData.karat}
                    onChange={handleChange}
                    required
                    className={getInputClasses("karat")}
                  >
                    <option value="">Select purity</option>
                    <option value="24K">24K (99.9%)</option>
                    <option value="22K">22K (91.7%)</option>
                    <option value="18K">18K (75.0%)</option>
                    <option value="Other">Other</option>
                  </select>
                  {formData.karat === "Other" && (
                    <p
                      className={`mt-2 text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Please provide details in the Description Field
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="color"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Gold Color{" "}
                    <span className="text-amber-500 font-bold text-lg">*</span>
                  </label>
                  <select
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    required
                    className={getInputClasses("color")}
                  >
                    <option value="">Select gold color</option>
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Green Gold">Green Gold</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Other">Other</option>
                  </select>
                  {formData.color === "Other" && (
                    <p
                      className={`mt-2 text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Please provide details in the Description Field
                    </p>
                  )}
                </div>
              </div>

              {/* Brand and Price in a 2-column grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="brand"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Brand (optional)
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Enter brand name if applicable"
                    className={getInputClasses("brand")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="price_estimate"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Selling Price (PHP){" "}
                    <span className="text-amber-500 font-bold text-lg">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span
                        className={`${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        } sm:text-sm`}
                      >
                        ₱
                      </span>
                    </div>
                    <input
                      type="number"
                      id="price_estimate"
                      name="price_estimate"
                      min="0"
                      step="0.01"
                      value={formData.price_estimate}
                      onChange={handleChange}
                      required
                      className={getInputClasses("price_estimate")}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Description and Weight in a 2-column grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="description"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Details {hasOtherSelected ? (
                      <span className="text-amber-500 font-bold text-lg">*</span>
                    ) : "(optional)"}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className={getInputClasses("description")}
                    placeholder="Enter details about the item's condition, history, etc."
                    required={hasOtherSelected}
                  ></textarea>

                </div>

                <div>
                  <label
                    htmlFor="weight"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Weight in grams (optional)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      min="0"
                      step="0.01"
                      value={formData.weight}
                      onChange={handleChange}
                      className={getInputClasses("weight")}
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span
                        className={`${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        } sm:text-sm`}
                      >
                        g
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold hover:bg-amber-700"
                  disabled={loading}
                >
                  Next Step
                </button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seller Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="full_name"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Full Name{" "}
                    <span className="text-amber-500 font-bold text-lg">*</span>
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className={getInputClasses("full_name")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact_number"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Contact Number{" "}
                    <span className="text-amber-500 font-bold text-lg">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{11}"
                    placeholder="09XXXXXXXXX"
                    className={getInputClasses("contact_number")}
                  />
                  <p
                    className={`text-xs mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Enter a valid 11-digit phone number (e.g., 09123456789)
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Email{" "}
                  <span className="text-amber-500 font-bold text-lg">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={getInputClasses("email")}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                    darkMode
                      ? "border-gray-600 text-gray-300 bg-dark-surface-3 hover:bg-dark-surface-4"
                      : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold hover:bg-amber-700"
                >
                  {loading ? "Submitting..." : "List Item for Sale"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellForm;
