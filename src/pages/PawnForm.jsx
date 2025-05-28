import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

function PawnForm() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const pawnFormRef = React.useRef(null);

  // Scroll to top when the component mounts
  React.useEffect(() => {
    if (pawnFormRef.current) {
      pawnFormRef.current.scrollIntoView({
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

  // Form data for step 1 (Item Details)
  const [itemFormData, setItemFormData] = useState({
    title: "",
    category: "",
    brand: "",
    purity: "",
    gold_type: "",
    gold_origin: "",
    weight: "",
    details: "",
  });

  // Form data for step 2 (Meeting Details)
  const [meetingFormData, setMeetingFormData] = useState({
    pawn_price: "",
    full_name: "",
    contact_number: "",
    email: "",
    address: "",
    meeting_date_1: "",
    meeting_date_2: "",
    meeting_date_3: "",
    meeting_place: "",
    meeting_time: "",
  });

  // Handle item form input changes
  function handleItemFormChange(e) {
    const { name, value } = e.target;
    const updatedFormData = {
      ...itemFormData,
      [name]: name === "weight" ? (value ? parseFloat(value) : "") : value,
    };
    
    setItemFormData(updatedFormData);
    
    // Check if any "Other" option is selected in any of the dropdown fields
    const hasOther = 
      updatedFormData.category === "Other" ||
      updatedFormData.purity === "Other" ||
      updatedFormData.gold_type === "Other" ||
      updatedFormData.gold_origin === "Other";
    
    setHasOtherSelected(hasOther);
  }

  // Handle meeting form input changes
  function handleMeetingFormChange(e) {
    const { name, value } = e.target;
    setMeetingFormData({
      ...meetingFormData,
      [name]: name === "pawn_price" ? (value ? parseFloat(value) : "") : value,
    });
  }

  // Handle form navigation - go to next step
  function handleNextStep() {
    // Validate step 1 data
    if (currentStep === 1) {
      if (
        !itemFormData.title ||
        !itemFormData.category ||
        !itemFormData.purity ||
        !itemFormData.gold_type ||
        !itemFormData.gold_origin ||
        (hasOtherSelected && !itemFormData.details) // Check if details is required and empty
      ) {
        setError("Please fill in all required fields");
        return;
      }

      if (imageFiles.length === 0) {
        setError("Please upload at least one image of your item");
        return;
      }
    }

    setError(null);
    setCurrentStep(2);
  }

  // Handle form navigation - go to previous step
  function handlePrevStep() {
    setError(null);
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
            setMeetingFormData((prev) => ({
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

  // Handle image file selection
  function handleImageChange(e) {
    const files = Array.from(e.target.files || []);
    handleFilesUpload(files);
  }

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleFilesUpload(files);
    }
  }

  // Process the uploaded files
  function handleFilesUpload(files) {
    // Limit to 3 images
    if (imageFiles.length + files.length > 3) {
      setError("You can upload a maximum of 3 images");
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    // Check each file
    files.forEach((file) => {
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
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      setError("You must be signed in to pawn items");
      return;
    }

    // Validate required fields for step 2
    if (
      !meetingFormData.pawn_price ||
      !meetingFormData.full_name ||
      !meetingFormData.contact_number ||
      !meetingFormData.email ||
      !meetingFormData.address ||
      !meetingFormData.meeting_place ||
      !meetingFormData.meeting_time
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate that at least one meeting date is provided
    if (
      !meetingFormData.meeting_date_1 &&
      !meetingFormData.meeting_date_2 &&
      !meetingFormData.meeting_date_3
    ) {
      setError("Please provide at least one preferred meeting date");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, create record in the items table
      const itemData = {
        user_id: user.id,
        title: itemFormData.title,
        category: itemFormData.category,
        gold_type: itemFormData.gold_type,
        gold_origin: itemFormData.gold_origin,
        purity: itemFormData.purity,
        weight:
          itemFormData.weight !== "" ? parseFloat(itemFormData.weight) : null,
        item_type: "pawn",
        status: "pending",
        created_at: new Date().toISOString(),
        brand: itemFormData.brand || null,
        details: itemFormData.details || null,
        amount: meetingFormData.pawn_price, // Store pawn amount in the items table
      };

      // Insert into the items table and get the new item id
      const { data: itemResult, error: itemError } = await supabase
        .from("items")
        .insert(itemData)
        .select();

      if (itemError) throw itemError;

      const itemId = itemResult[0].id;

      // Upload images
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

        // Get URL for the uploaded image
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
            additional_images: imageUrls.slice(1),
          })
          .eq("id", itemId);

        if (updateError) throw updateError;
      }

      // Create pawn request with reference to the item
      const pawnData = {
        item_id: itemId,
        full_name: meetingFormData.full_name,
        contact_number: meetingFormData.contact_number,
        email: meetingFormData.email,
        address: meetingFormData.address,
        meeting_date_1: meetingFormData.meeting_date_1,
        meeting_date_2: meetingFormData.meeting_date_2 || null,
        meeting_date_3: meetingFormData.meeting_date_3 || null,
        meeting_place: meetingFormData.meeting_place,
        meeting_time: meetingFormData.meeting_time,
        pawn_price: meetingFormData.pawn_price, // Add back the pawn_price
        brand: itemFormData.brand || null, // Keep brand in pawn_requests too
        details: itemFormData.details || null, // Keep details in pawn_requests too
      };

      const { error: pawnError } = await supabase
        .from("pawn_requests")
        .insert(pawnData);

      if (pawnError) throw pawnError;

      // Send notification to admin about the new pawn item
      try {
        await fetch("/.netlify/functions/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: meetingFormData.full_name,
            email: meetingFormData.email,
            phone: meetingFormData.contact_number,
            itemTitle: itemFormData.title,
            message: `A new pawn request has been received:

Item Details:
- Title: ${itemFormData.title}
- Category: ${itemFormData.category}
- Requested Amount: ₱${meetingFormData.pawn_price}
- Gold Type: ${itemFormData.gold_type}
- Purity: ${itemFormData.purity}

Customer Details:
- Name: ${meetingFormData.full_name}
- Email: ${meetingFormData.email}
- Phone: ${meetingFormData.contact_number}
- Address: ${meetingFormData.address}

Meeting Preferences:
- Preferred Date 1: ${meetingFormData.meeting_date_1}
- Preferred Date 2: ${meetingFormData.meeting_date_2 || "Not specified"}
- Preferred Date 3: ${meetingFormData.meeting_date_3 || "Not specified"}
- Meeting Place: ${meetingFormData.meeting_place}
- Preferred Time: ${meetingFormData.meeting_time}

Please check the admin panel for more details and to schedule an appointment.`,
          }),
        });
      } catch (emailError) {
        console.error(
          "Email notification failed, but pawn request was created:",
          emailError
        );
        // Continue with the flow even if email fails
      }

      // Navigate to the MyItems page to see the submitted item
      navigate("/my-items");
    } catch (error) {
      console.error("Error creating pawn request:", error);
      setError(error.message || "Error creating pawn request");
      setLoading(false);
    }
  }

  return (
    <div
      ref={pawnFormRef}
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
          Pawn Your Gold Item
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
              Meeting Details
            </span>
          </div>
        </div>

        {/* Form content */}
        <div
          className={`${
            darkMode
              ? "bg-dark-surface-2 border border-dark-surface-4"
              : "bg-white"
          } shadow-lg rounded-lg overflow-hidden p-6`}
        >
          {/* Error message display */}
          {error && (
            <div
              className={`mb-6 ${
                darkMode
                  ? "bg-red-900 bg-opacity-30 border-red-700"
                  : "bg-red-50 border-red-400"
              } border-l-4 p-4`}
            >
              <p
                className={`text-sm ${
                  darkMode ? "text-red-300" : "text-red-700"
                }`}
              >
                {error}
              </p>
            </div>
          )}

          {currentStep === 1 && (
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-6">
                {/* Item Title */}
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
                    value={itemFormData.title}
                    onChange={handleItemFormChange}
                    className={`w-full px-3 py-2 border ${
                      darkMode
                        ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                        : "border-gray-300 focus:ring-gold focus:border-gold"
                    } rounded-md shadow-sm focus:outline-none`}
                    placeholder="Enter the title of your gold item"
                    required
                  />
                </div>

                {/* Category */}
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
                    value={itemFormData.category}
                    onChange={handleItemFormChange}
                    className={`w-full px-3 py-2 border ${
                      darkMode
                        ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                        : "border-gray-300 focus:ring-gold focus:border-gold"
                    } rounded-md shadow-sm focus:outline-none`}
                    required
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
                  {itemFormData.category === "Other" && (
                    <p
                      className={`mt-2 text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Please provide details in the Description Field
                    </p>
                  )}
                </div>

                {/* Brand */}
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
                    value={itemFormData.brand}
                    onChange={handleItemFormChange}
                    className={`w-full px-3 py-2 border ${
                      darkMode
                        ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                        : "border-gray-300 focus:ring-gold focus:border-gold"
                    } rounded-md shadow-sm focus:outline-none`}
                    placeholder="Enter the brand name (if applicable)"
                  />
                </div>

                {/* Purity */}
                <div>
                  <label
                    htmlFor="purity"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Purity{" "}
                    <span className="text-amber-500 font-bold text-lg">*</span>
                  </label>
                  <select
                    id="purity"
                    name="purity"
                    value={itemFormData.purity}
                    onChange={handleItemFormChange}
                    className={`w-full px-3 py-2 border ${
                      darkMode
                        ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                        : "border-gray-300 focus:ring-gold focus:border-gold"
                    } rounded-md shadow-sm focus:outline-none`}
                    required
                  >
                    <option value="">Select purity</option>
                    <option value="24K">24K (99.9%)</option>
                    <option value="22K">22K (91.7%)</option>
                    <option value="18K">18K (75.0%)</option>
                    <option value="Other">Other</option>
                  </select>
                  {itemFormData.purity === "Other" && (
                    <p
                      className={`mt-2 text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Please provide details in the Description Field
                    </p>
                  )}
                </div>

                {/* Gold Type - Changed to Gold Color */}
                <div>
                  <label
                    htmlFor="gold_type"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Gold Color{" "}
                    <span className="text-amber-500 font-bold text-lg">*</span>
                  </label>
                  <select
                    id="gold_type"
                    name="gold_type"
                    value={itemFormData.gold_type}
                    onChange={handleItemFormChange}
                    className={`w-full px-3 py-2 border ${
                      darkMode
                        ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                        : "border-gray-300 focus:ring-gold focus:border-gold"
                    } rounded-md shadow-sm focus:outline-none`}
                    required
                  >
                    <option value="">Select gold color</option>
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Green Gold">Green Gold</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Other">Other</option>
                  </select>
                  {itemFormData.gold_type === "Other" && (
                    <p
                      className={`mt-2 text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Please provide details in the Description Field
                    </p>
                  )}
                </div>

                {/* New Type field */}
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
                    value={itemFormData.gold_origin || ""}
                    onChange={handleItemFormChange}
                    className={`w-full px-3 py-2 border ${
                      darkMode
                        ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                        : "border-gray-300 focus:ring-gold focus:border-gold"
                    } rounded-md shadow-sm focus:outline-none`}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Japanese Gold">Japanese Gold</option>
                    <option value="Saudi Gold">Saudi Gold</option>
                    <option value="Italian Gold">Italian Gold</option>
                    <option value="Chinese Gold">Chinese Gold</option>
                    <option value="Other">Other</option>
                  </select>
                  {itemFormData.gold_origin === "Other" && (
                    <p
                      className={`mt-2 text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Please provide details in the Description Field
                    </p>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <label
                    htmlFor="weight"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Weight in grams (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="weight"
                    name="weight"
                    value={itemFormData.weight}
                    onChange={handleItemFormChange}
                    className={`w-full px-3 py-2 border ${
                      darkMode
                        ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                        : "border-gray-300 focus:ring-gold focus:border-gold"
                    } rounded-md shadow-sm focus:outline-none`}
                    placeholder="Enter the weight in grams"
                  />
                </div>

                {/* Details */}
                <div>
                  <label
                    htmlFor="details"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Details {hasOtherSelected ? (
                      <span className="text-amber-500 font-bold text-lg">*</span>
                    ) : "(optional)"}
                  </label>
                  <textarea
                    id="details"
                    name="details"
                    rows="4"
                    value={itemFormData.details}
                    onChange={handleItemFormChange}
                    className={`w-full px-3 py-2 border ${
                      darkMode
                        ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                        : "border-gray-300 focus:ring-gold focus:border-gold"
                    } rounded-md shadow-sm focus:outline-none`}
                    placeholder="Enter additional details about your item"
                    required={hasOtherSelected}
                  ></textarea>

                </div>

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
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      multiple
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
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
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
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
                  <p
                    className={`mt-2 text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Upload a clear photo of your item. If available, include the
                    original receipt in one of the photos.
                  </p>

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
                </div>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-6">
                {/* Pawn Price */}
                <div>
                  <label
                    htmlFor="pawn_price"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Desired Pawn Amount (₱){" "}
                    <span className="text-amber-500 font-bold text-lg">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="pawn_price"
                    name="pawn_price"
                    value={meetingFormData.pawn_price}
                    onChange={handleMeetingFormChange}
                    className={`w-full px-3 py-2 border ${
                      darkMode
                        ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                        : "border-gray-300 focus:ring-gold focus:border-gold"
                    } rounded-md shadow-sm focus:outline-none`}
                    placeholder="Enter the amount you want to pawn this item for"
                    required
                  />
                </div>

                <div
                  className={`border-t ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } pt-4`}
                >
                  <h3
                    className={`text-lg font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    } mb-4`}
                  >
                    Contact Information
                  </h3>

                  {/* Full Name */}
                  <div className="mb-4">
                    <label
                      htmlFor="full_name"
                      className={`block text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-1`}
                    >
                      Full Name{" "}
                      <span className="text-amber-500 font-bold text-lg">
                        *
                      </span>
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={meetingFormData.full_name}
                      onChange={handleMeetingFormChange}
                      className={`w-full px-3 py-2 border ${
                        darkMode
                          ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                          : "border-gray-300 focus:ring-gold focus:border-gold"
                      } rounded-md shadow-sm focus:outline-none`}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="mb-4">
                    <label
                      htmlFor="contact_number"
                      className={`block text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-1`}
                    >
                      Contact Number{" "}
                      <span className="text-amber-500 font-bold text-lg">
                        *
                      </span>
                    </label>
                    <input
                      type="tel"
                      id="contact_number"
                      name="contact_number"
                      value={meetingFormData.contact_number}
                      onChange={handleMeetingFormChange}
                      className={`w-full px-3 py-2 border ${
                        darkMode
                          ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                          : "border-gray-300 focus:ring-gold focus:border-gold"
                      } rounded-md shadow-sm focus:outline-none`}
                      placeholder="Enter your contact number"
                      required
                    />
                  </div>

                  {/* Email Address */}
                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className={`block text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-1`}
                    >
                      Email Address{" "}
                      <span className="text-amber-500 font-bold text-lg">
                        *
                      </span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={meetingFormData.email}
                      onChange={handleMeetingFormChange}
                      className={`w-full px-3 py-2 border ${
                        darkMode
                          ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                          : "border-gray-300 focus:ring-gold focus:border-gold"
                      } rounded-md shadow-sm focus:outline-none`}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="address"
                      className={`block text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-1`}
                    >
                      Address{" "}
                      <span className="text-amber-500 font-bold text-lg">
                        *
                      </span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows="2"
                      value={meetingFormData.address}
                      onChange={handleMeetingFormChange}
                      className={`w-full px-3 py-2 border ${
                        darkMode
                          ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                          : "border-gray-300 focus:ring-gold focus:border-gold"
                      } rounded-md shadow-sm focus:outline-none`}
                      placeholder="Enter your address"
                      required
                    ></textarea>
                  </div>
                </div>

                <div
                  className={`border-t ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } pt-4`}
                >
                  <h3
                    className={`text-lg font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    } mb-4`}
                  >
                    Meeting Preferences
                  </h3>

                  {/* Preferred Meeting Dates */}
                  <div className="mb-4">
                    <label
                      className={`block text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-1`}
                    >
                      Preferred Meeting Dates{" "}
                      <span className="text-amber-500 font-bold text-lg">
                        *
                      </span>{" "}
                      <span
                        className={`block text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        (Choose at least one)
                      </span>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Date 1 */}
                      <div>
                        <label
                          htmlFor="meeting_date_1"
                          className={`block text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          } mb-1`}
                        >
                          Option 1{" "}
                          <span className="text-amber-500 font-bold text-lg">
                            *
                          </span>
                        </label>
                        <input
                          type="date"
                          id="meeting_date_1"
                          name="meeting_date_1"
                          value={meetingFormData.meeting_date_1}
                          onChange={handleMeetingFormChange}
                          className={`w-full px-3 py-2 border ${
                            darkMode
                              ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                              : "border-gray-300 focus:ring-gold focus:border-gold"
                          } rounded-md shadow-sm focus:outline-none`}
                          required
                        />
                      </div>

                      {/* Date 2 */}
                      <div>
                        <label
                          htmlFor="meeting_date_2"
                          className={`block text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          } mb-1`}
                        >
                          Option 2
                        </label>
                        <input
                          type="date"
                          id="meeting_date_2"
                          name="meeting_date_2"
                          value={meetingFormData.meeting_date_2}
                          onChange={handleMeetingFormChange}
                          className={`w-full px-3 py-2 border ${
                            darkMode
                              ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                              : "border-gray-300 focus:ring-gold focus:border-gold"
                          } rounded-md shadow-sm focus:outline-none`}
                        />
                      </div>

                      {/* Date 3 */}
                      <div>
                        <label
                          htmlFor="meeting_date_3"
                          className={`block text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          } mb-1`}
                        >
                          Option 3
                        </label>
                        <input
                          type="date"
                          id="meeting_date_3"
                          name="meeting_date_3"
                          value={meetingFormData.meeting_date_3}
                          onChange={handleMeetingFormChange}
                          className={`w-full px-3 py-2 border ${
                            darkMode
                              ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                              : "border-gray-300 focus:ring-gold focus:border-gold"
                          } rounded-md shadow-sm focus:outline-none`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferred Meeting Place */}
                  <div className="mb-4">
                    <label
                      htmlFor="meeting_place"
                      className={`block text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-1`}
                    >
                      Preferred Meeting Place{" "}
                      <span className="text-amber-500 font-bold text-lg">
                        *
                      </span>
                      <span
                        className={`block text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        (Nearest Bank / Starbucks / McDonalds)
                      </span>
                    </label>
                    <input
                      type="text"
                      id="meeting_place"
                      name="meeting_place"
                      value={meetingFormData.meeting_place}
                      onChange={handleMeetingFormChange}
                      className={`w-full px-3 py-2 border ${
                        darkMode
                          ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                          : "border-gray-300 focus:ring-gold focus:border-gold"
                      } rounded-md shadow-sm focus:outline-none`}
                      placeholder="Enter preferred meeting location"
                      required
                    />
                  </div>

                  {/* Preferred Meeting Time */}
                  <div>
                    <label
                      htmlFor="meeting_time"
                      className={`block text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-1`}
                    >
                      Preferred Meeting Time{" "}
                      <span className="text-amber-500 font-bold text-lg">
                        *
                      </span>
                    </label>
                    <input
                      type="time"
                      id="meeting_time"
                      name="meeting_time"
                      value={meetingFormData.meeting_time}
                      onChange={handleMeetingFormChange}
                      className={`w-full px-3 py-2 border ${
                        darkMode
                          ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                          : "border-gray-300 focus:ring-gold focus:border-gold"
                      } rounded-md shadow-sm focus:outline-none`}
                      required
                    />
                  </div>
                </div>

                <div
                  className={`${
                    darkMode
                      ? "bg-amber-900 bg-opacity-30 border-amber-700"
                      : "bg-yellow-50 border-yellow-400"
                  } border-l-4 p-4`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-sm ${
                          darkMode ? "text-yellow-300" : "text-yellow-700"
                        }`}
                      >
                        By submitting this form, you agree to meet with a
                        representative to verify your item and complete the pawn
                        process. The final pawn amount may be adjusted based on
                        the inspection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
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
            )}
            {currentStep === 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold hover:bg-amber-700"
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold hover:bg-amber-700"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Pawn Request"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PawnForm;
