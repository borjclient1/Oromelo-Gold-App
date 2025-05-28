import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { supabase } from "../services/supabase";

function Profile() {
  const { user, updateProfile } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleClose = () => {
    navigate("/");
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Track if there are any changes to be saved
  const hasChanges = () => {
    if (avatarUrl !== user.user_metadata?.avatar_url) return true;
    if (formData.name !== user.user_metadata?.name) return true;
    if (formData.phone !== user.user_metadata?.phone) return true;
    return false;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        // First, check if there's a profile record with an avatar
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
          return;
        }

        // If no avatar in profiles table, check user metadata
        if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }
      } catch {
        // Error handling is silent to avoid disrupting the UI
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (user) {
      // Set initial form data from user object
      setFormData({
        name: user.user_metadata?.name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
      });
    }
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Check if user is still logged in
      if (!user || !user.id) {
        throw new Error("User session expired. Please sign in again.");
      }

      // Validate phone number format
      if (formData.phone) {
        const phoneRegex = /^(\+63|0)9\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
          throw new Error("Please enter a valid Philippine mobile number (e.g., +639123456789 or 09123456789)");
        }
      }

      // Create a clean profile data object
      const profileData = {
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        avatar_url: avatarUrl || undefined,
      };

      await updateProfile(profileData);

      setMessage({
        text: "Profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        text: error.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarUpload(event) {
    try {
      setUploading(true);
      setMessage({ text: "", type: "" });

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes

      if (file.size > maxSize) {
        throw new Error("File size must be less than 1MB");
      }

      // Delete old avatar if it exists
      if (avatarUrl) {
        try {
          const oldFileName = avatarUrl.split('/').pop();
          await supabase.storage
            .from("avatars")
            .remove([oldFileName]);
        } catch (error) {
          console.error("Error deleting old avatar:", error);
          // Continue with upload even if deletion fails
        }
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}-${Date.now()}.${fileExt}`;

      // Direct upload to storage bucket
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const newAvatarUrl = urlData.publicUrl;

      // Update user metadata
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: { avatar_url: newAvatarUrl },
      });

      if (userUpdateError) {
        console.error("Failed to update user metadata:", userUpdateError);
        throw userUpdateError;
      }

      // Refresh the user session to get the updated metadata
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        updateProfile({ avatar_url: newAvatarUrl });
      }

      // Set the avatar URL in state
      setAvatarUrl(newAvatarUrl);

      setMessage({
        text: "Avatar uploaded successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setMessage({
        text: `Upload failed: ${error.message}`,
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  }

  if (!user) {
    navigate("/signin");
    return null;
  }

  // Check if user is properly initialized
  if (!user.id) {
    setMessage({
      text: "User session not properly initialized. Please sign in again.",
      type: "error",
    });
    return null;
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-dark-surface" : "bg-gray-50"
      } py-12 px-4 sm:px-6 lg:px-8`}
    >
      <div
        className={`max-w-3xl mx-auto ${
          darkMode
            ? "bg-dark-surface-2 border border-dark-surface-4"
            : "bg-white"
        } shadow sm:rounded-lg`}
      >
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center mb-6">
            <h2
              className={`text-2xl font-bold leading-7 ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Profile Settings
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p
            className={`mt-1 max-w-2xl text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Update your personal information and profile picture
          </p>
        </div>

        {message.text && (
          <div
            className={`px-4 py-3 mb-4 ${
              message.type === "success"
                ? darkMode
                  ? "bg-green-900 bg-opacity-30 text-green-300 border border-green-700"
                  : "bg-green-50 text-green-800"
                : darkMode
                ? "bg-red-900 bg-opacity-30 text-red-300 border border-red-700"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div
          className={`border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row gap-8 justify-center">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4 mb-6 md:mb-0">
                <div className="relative">
                  <div
                    className={`h-32 w-32 rounded-full overflow-hidden ${
                      darkMode ? "bg-dark-surface-3" : "bg-gray-200"
                    }`}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg
                        className={`h-full w-full ${
                          darkMode ? "text-gray-600" : "text-gray-400"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gold flex items-center justify-center cursor-pointer"
                  >
                    <svg
                      className="h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="sr-only"
                    disabled={uploading}
                  />
                </div>
                <div className="text-center">
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {uploading ? "Uploading..." : "Click to upload new avatar"}
                  </span>
                </div>
              </div>

              {/* Profile Form */}
              <div className="flex-1 max-w-md">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Full Name
                      </label>
                      <div className="mt-1">
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className={`shadow-sm ${
                            darkMode
                              ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                              : "border-gray-300 focus:ring-gold focus:border-gold"
                          } block w-full sm:text-sm rounded-md p-2`}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Email Address
                      </label>
                      <div className="mt-1">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          disabled
                          className={`${
                            darkMode
                              ? "bg-dark-surface-4 border-gray-600 text-gray-400"
                              : "bg-gray-50 border-gray-300 text-gray-500"
                          } shadow-sm block w-full sm:text-sm rounded-md p-2`}
                        />
                        <p
                          className={`mt-1 text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Email address cannot be changed
                        </p>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Phone Number
                      </label>
                      <div className="mt-1">
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`shadow-sm ${
                            darkMode
                              ? "bg-dark-surface-3 border-gray-600 text-white focus:ring-gold-400 focus:border-gold-400"
                              : "border-gray-300 focus:ring-gold focus:border-gold"
                          } block w-full sm:text-sm rounded-md p-2`}
                          placeholder="+639123456789 or 09123456789"
                        />
                      </div>
                    </div>

                    <div className="pt-5">
                      <div className="flex justify-end gap-4">
                        {hasChanges() && (
                          <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold hover:bg-gold-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold ${
                              loading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:opacity-90"
                            }`}
                          >
                            {loading ? "Saving..." : "Save Changes"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
