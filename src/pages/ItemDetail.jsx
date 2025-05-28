import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquiryData, setInquiryData] = useState({
    message: '',
    scheduledDate: '',
    scheduledTime: '10:00', // Default time
    contactPhone: '',
    meetingType: 'in-person', // in-person or virtual
  });
  const [availableDates, setAvailableDates] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Generate available dates (next 14 days, excluding weekends)
  useEffect(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          date: date.toISOString().split('T')[0],
          formatted: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })
        });
      }
    }
    
    setAvailableDates(dates);
  }, []);

  useEffect(() => {
    async function fetchItem() {
      setLoading(true);
      setError(null);
      
      try {
        // Get the item details
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          setError('Item not found');
          setLoading(false);
          return;
        }
        
        // Check if user has permission to view this item
        const isOwnedByUser = user && user.id === data.user_id;
        const isAdminUser = user && user.email === 'admin@goldpawn.com';
        
        // Get seller info if this is an admin item (needed for regular users)
        if (data.user_id) {
          const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('*')
            .eq('id', data.user_id)
            .single();
          
          if (!userError) {
            setSeller(userData);
            
            // Permission check: only allow if item is owned by the current user, 
            // or if the current user is admin, or if the item is owned by the admin
            const isSiteOwnerItem = userData?.email === 'admin@goldpawn.com';
            
            if (isOwnedByUser || isAdminUser || isSiteOwnerItem) {
              setItem(data);
            } else {
              // Redirect to not found if user shouldn't see this item
              navigate('/not-found');
            }
          }
        } else {
          if (isOwnedByUser || isAdminUser) {
            setItem(data);
          } else {
            navigate('/not-found');
          }
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        setError('Failed to fetch item details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchItem();
  }, [id, user, navigate, isAdmin]);

  function handleInquiryChange(e) {
    const { name, value } = e.target;
    setInquiryData({
      ...inquiryData,
      [name]: value,
    });
  };

  async function handleInquirySubmit(e) {
    e.preventDefault();
    
    if (!user) {
      navigate('/signin', { state: { from: `/items/${id}` } });
      return;
    }
    
    // Validation
    if (!inquiryData.scheduledDate) {
      setSubmitError('Please select a date for your appointment');
      return;
    }
    
    if (!inquiryData.contactPhone) {
      setSubmitError('Please provide a contact phone number');
      return;
    }
    
    setSubmitLoading(true);
    setSubmitError(null);
    
    try {
      // Create a new inquiry
      const { error } = await supabase
        .from('Inquiries')
        .insert([
          {
            user_id: user.id,
            item_id: id,
            message: inquiryData.message,
            scheduled_date: inquiryData.scheduledDate,
            scheduled_time: inquiryData.scheduledTime,
            contact_phone: inquiryData.contactPhone,
            meeting_type: inquiryData.meetingType,
            status: 'pending',
          },
        ]);
      
      if (error) throw error;
      
      // Create a meeting for the scheduled date
      const { error: meetingError } = await supabase
        .from('Meetings')
        .insert([
          {
            user_id: user.id,
            item_id: id,
            scheduled_date: `${inquiryData.scheduledDate}T${inquiryData.scheduledTime}:00`,
            meeting_type: inquiryData.meetingType,
            contact_phone: inquiryData.contactPhone,
            status: 'scheduled',
          },
        ]);
      
      if (meetingError) throw meetingError;
      
      setSubmitSuccess(true);
      setInquiryData({
        message: '',
        scheduledDate: '',
        scheduledTime: '10:00',
        contactPhone: '',
        meetingType: 'in-person'
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitError('Failed to schedule your appointment. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Format timestamp to readable date
  function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error || 'Item not found'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link to="/browse" className="btn-primary">
              Browse Other Items
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === item.user_id;
  const isSiteOwnerItem = seller && seller.email === 'admin@goldpawn.com';
  const showBookingForm = !isOwner && user;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Item Image */}
            <div className="md:w-1/2">
              <img
                src={item.image_url || 'https://via.placeholder.com/600x400?text=No+Image'}
                alt={item.title}
                className="w-full h-96 object-cover"
              />
            </div>
            
            {/* Item Details */}
            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                <div className="flex space-x-2">
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full 
                    ${item.status === 'available' ? 'bg-green-100 text-green-800' : 
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      item.status === 'sold' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'}`
                  }>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  <span className="bg-gray-900 text-amber-400 text-sm font-semibold px-2 py-1 rounded-full">
                    {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-500">Category: {item.category}</p>
                <p className="text-gray-500">Added on: {formatDate(item.created_at)}</p>
              </div>
              
              <div className="mt-4">
                <h2 className="text-2xl font-bold text-gold">${item.price_estimate}</h2>
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <p className="text-gray-700 mt-2">{item.description}</p>
              </div>

              {/* Important Notice */}
              <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-amber-700 font-medium">
                      IMPORTANT: All transactions require a scheduled meeting with our store personnel.
                      No direct sales are conducted through this app.
                    </p>
                  </div>
                </div>
              </div>
              
              {isSiteOwnerItem && (
                <div className="mb-4 bg-green-100 p-2 rounded-md">
                  <p className="text-green-800 font-medium">This item is offered by the Gold Pawn Shop</p>
                </div>
              )}
              
              {isOwner && (
                <div className="mt-6">
                  <Link
                    to={`/my-items/edit/${item.id}`}
                    className="btn-primary mr-4"
                  >
                    Edit Item
                  </Link>
                  <Link
                    to="/my-items"
                    className="btn-secondary"
                  >
                    Back to My Items
                  </Link>
                </div>
              )}
              
              {isAdmin && !isOwner && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Seller Information</h3>
                  <p className="text-gray-700"><span className="font-medium">Name:</span> {seller?.name || 'Unknown'}</p>
                  <p className="text-gray-700"><span className="font-medium">Email:</span> {seller?.email || 'Unknown'}</p>
                  <p className="text-gray-700"><span className="font-medium">Contact:</span> {seller?.phone || 'Not provided'}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Booking Form */}
          {showBookingForm && item.status === 'available' && (
            <div className="border-t border-gray-200 px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule an Appointment</h2>
              
              {submitSuccess ? (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Your appointment has been scheduled! We will contact you to confirm the details.
                      </p>
                    </div>
                  </div>
                </div>
              ) : submitError ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  </div>
                </div>
              ) : null}
              
              <form onSubmit={handleInquirySubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message (Optional)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      className="input-field"
                      placeholder="Any questions or notes about this item?"
                      value={inquiryData.message}
                      onChange={handleInquiryChange}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone Number*
                    </label>
                    <input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      className="input-field"
                      placeholder="(123) 456-7890"
                      value={inquiryData.contactPhone}
                      onChange={handleInquiryChange}
                      required
                    />
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meeting Type*
                      </label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="meetingType"
                            value="in-person"
                            checked={inquiryData.meetingType === 'in-person'}
                            onChange={handleInquiryChange}
                            className="h-4 w-4 text-gold focus:ring-gold"
                          />
                          <span className="ml-2">In-Person Meeting</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="meetingType"
                            value="virtual"
                            checked={inquiryData.meetingType === 'virtual'}
                            onChange={handleInquiryChange}
                            className="h-4 w-4 text-gold focus:ring-gold"
                          />
                          <span className="ml-2">Video Call</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a Date & Time for Your Appointment*
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Available Dates
                        </label>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {availableDates.map((dateObj) => (
                            <button
                              key={dateObj.date}
                              type="button"
                              className={`py-2 px-3 border rounded-md text-sm ${
                                inquiryData.scheduledDate === dateObj.date
                                  ? 'bg-gold text-white border-gold'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => handleInquiryChange({
                                target: { name: 'scheduledDate', value: dateObj.date }
                              })}
                            >
                              {dateObj.formatted}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Time
                        </label>
                        <select
                          id="scheduledTime"
                          name="scheduledTime"
                          className="input-field"
                          value={inquiryData.scheduledTime}
                          onChange={handleInquiryChange}
                          required
                        >
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className={`btn-primary w-full ${
                      submitLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {submitLoading ? 'Scheduling Appointment...' : 'Schedule Appointment'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {!user && (
            <div className="border-t border-gray-200 px-6 py-6">
              <div className="text-center">
                <p className="text-gray-700 mb-4">
                  Please sign in to schedule an appointment to view or purchase this item.
                </p>
                <Link
                  to={`/signin?redirect=/items/${id}`}
                  className="btn-primary"
                >
                  Sign In to Continue
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
