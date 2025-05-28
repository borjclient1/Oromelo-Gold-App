import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import {
  getListingById,
  getLikesForListing,
  toggleLike,
  getCommentsForListing,
  addComment,
  sendInquiry,
} from "../services/listings-service";

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const detailRef = React.useRef(null);

  // Scroll to top when the component mounts
  useEffect(() => {
    if (detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [likes, setLikes] = useState([]);
  const [userLiked, setUserLiked] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [inquiry, setInquiry] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch listing details
  useEffect(() => {
    const fetchListingDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await getListingById(id);
        if (error) throw error;
        setListing(data);

        // Fetch likes
        const { data: likesData } = await getLikesForListing(id);
        setLikes(likesData || []);

        // Check if user liked this listing
        if (user) {
          const userLike = likesData?.find((like) => like.user_id === user.id);
          setUserLiked(!!userLike);
        }

        // Fetch comments
        const { data: commentsData } = await getCommentsForListing(id);
        setComments(commentsData || []);
      } catch (err) {
        console.error("Error fetching listing details:", err);
        setError("Failed to load listing details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListingDetails();
    }
  }, [id, user]);

  const handleLikeToggle = async () => {
    if (!user) {
      // Redirect to login or show login modal
      return;
    }

    try {
      const { data, error } = await toggleLike(id, user.id);
      
      if (error) throw error;

      // Update local state
      setUserLiked(!userLiked);
      
      // Update the like count in the listing
      if (data?.count !== undefined) {
        setListing(prev => ({
          ...prev,
          likeCount: data.count
        }));
      }
      
      // Update the likes array for the current user
      if (userLiked) {
        setLikes(likes.filter((like) => like.user_id !== user.id));
      } else {
        setLikes([...likes, { listing_id: id, user_id: user.id }]);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setCommentLoading(true);
    try {
      const { error } = await addComment(id, user.id, newComment);
      if (error) throw error;

      // Refresh comments
      const { data: commentsData } = await getCommentsForListing(id);
      setComments(commentsData || []);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiry.trim() || !user || !contactNumber.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setInquiryLoading(true);
    try {
      const { error } = await sendInquiry(id, user.id, inquiry, contactNumber);
      if (error) throw error;

      setInquiry("");
      setContactNumber("");
      setInquirySent(true);

      // Reset success message after 5 seconds
      setTimeout(() => {
        setInquirySent(false);
      }, 5000);
    } catch (err) {
      console.error("Error sending inquiry:", err);
      alert("Failed to send inquiry. Please try again.");
    } finally {
      setInquiryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${darkMode ? 'bg-dark-surface-1' : 'bg-white'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-amber-400' : 'border-amber-600'}`}></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className={`container mx-auto px-4 py-8 text-center ${darkMode ? 'bg-dark-surface-1 text-white' : 'bg-white'}`}>
        <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div ref={detailRef} className={`min-h-screen ${darkMode ? 'bg-dark-surface-1 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Back to Listings Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/listings')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${darkMode ? 'bg-dark-surface-2 hover:bg-dark-surface-3 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'} border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Listings
          </button>
        </div>
        
        <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-dark-surface-2' : 'bg-white'}`}>
          <div className="md:flex">
            {/* Image Gallery */}
            <div className="md:w-1/2">
              <div className="relative h-80 md:h-96">
                <img
                  src={
                    activeImageIndex === 0
                      ? listing.image_url
                      : listing.additional_images?.[activeImageIndex - 1]
                  }
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              {listing.additional_images?.length > 0 && (
                <div className="flex mt-2 space-x-2 p-2">
                  <div
                    className={`w-16 h-16 border-2 cursor-pointer ${activeImageIndex === 0 ? "border-amber-600" : "border-gray-200"}`}
                    onClick={() => setActiveImageIndex(0)}
                  >
                    <img
                      src={listing.image_url}
                      alt="Main"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {listing.additional_images.map((img, index) => (
                    <div
                      key={index}
                      className={`w-16 h-16 border-2 cursor-pointer ${activeImageIndex === index + 1 ? "border-amber-600" : "border-gray-200"}`}
                      onClick={() => setActiveImageIndex(index + 1)}
                    >
                      <img
                        src={img}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Details */}
            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{listing.title}</h1>
                <div className="flex items-center">
                  <button
                    onClick={handleLikeToggle}
                    className={`p-2 rounded-full flex items-center ${userLiked ? "text-red-500" : darkMode ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"} transition-colors`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill={userLiked ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="ml-1 text-sm">{listing.likeCount || 0}</span>
                  </button>
                </div>
              </div>

              <p className={`text-2xl font-bold mb-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                ₱{listing.price?.toLocaleString()}
              </p>

              <div className={`grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg ${darkMode ? 'bg-dark-surface-3 bg-opacity-50' : 'bg-gray-50'}`}>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</p>
                  <p className="font-medium">{listing.category}</p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gold Color</p>
                  <p className="font-medium">{listing.gold_color || "N/A"}</p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gold Type</p>
                  <p className="font-medium">{listing.gold_origin || "N/A"}</p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Purity</p>
                  <p className="font-medium">{listing.purity || "N/A"}</p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Weight</p>
                  <p className="font-medium">{listing.weight}g</p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Brand</p>
                  <p className="font-medium">{listing.brand || "N/A"}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Details</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {listing.details || "No additional details provided."}
                </p>
              </div>

              {/* Inquiry Form */}
              <div className={`border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-lg font-semibold mb-2">
                  Interested in this item?
                </h3>
                {!user ? (
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Please{" "}
                    <a href="/signin" className={darkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}>
                      sign in
                    </a>{" "}
                    to send an inquiry.
                  </p>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Send an Inquiry</h3>
                    
                    <div className="mb-4">
                      <label htmlFor="contactNumber" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        id="contactNumber"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${darkMode ? 'bg-dark-surface-1 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                        placeholder="Enter your contact number"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="inquiry" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Your Message *
                      </label>
                      <textarea
                        id="inquiry"
                        value={inquiry}
                        onChange={(e) => setInquiry(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${darkMode ? 'bg-dark-surface-1 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                        rows="4"
                        placeholder="Enter your inquiry message"
                        required
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={inquiryLoading}
                      className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 w-full sm:w-auto"
                    >
                      {inquiryLoading ? "Sending..." : "Send Inquiry"}
                    </button>
                    
                    {inquirySent && (
                      <div className={`p-4 rounded-lg flex items-center ${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'}`}>
                        Your inquiry has been sent successfully! We'll contact you soon.
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-xl font-semibold mb-4">
              Comments ({comments.length})
            </h3>

            {/* Add Comment */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-dark-surface-1 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                  rows="2"
                  required
                ></textarea>
                <button
                  type="submit"
                  disabled={commentLoading}
                  className="bg-amber-600 text-white py-2 px-4 rounded font-medium hover:bg-amber-700 transition-colors"
                >
                  {commentLoading ? "Posting..." : "Post Comment"}
                </button>
              </form>
            ) : (
              <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Please{" "}
                <a href="/signin" className={darkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}>
                  sign in
                </a>{" "}
                to leave a comment.
              </p>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className={`border-b pb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center mb-2">
                      <div className={`w-10 h-10 rounded-full mr-3 overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        {comment.profiles?.avatar_url ? (
                          <img
                            src={comment.profiles.avatar_url}
                            alt={comment.profiles.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`flex flex-col md:flex-row md:items-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {comment.profiles?.name?.charAt(0).toUpperCase() ||
                              "U"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {comment.profiles?.name || "User"}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`mt-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{comment.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
