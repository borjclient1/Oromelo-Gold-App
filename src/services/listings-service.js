import { supabase } from './supabase';

// Listings
export const getListings = async (filters = {}) => {
  // First, get all listings with filters applied
  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active');
  
  // Determine sort field and order
  const sortField = filters.sortBy || 'created_at';
  const sortOrder = filters.sortOrder === 'asc';
  
  // Apply sorting
  query = query.order(sortField, { ascending: sortOrder });
    
  // Apply filters if provided
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.purity) {
    query = query.eq('purity', filters.purity);
  }
  if (filters.minWeight) {
    query = query.gte('weight', filters.minWeight);
  }
  if (filters.maxWeight) {
    query = query.lte('weight', filters.maxWeight);
  }
  if (filters.minPrice) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }
  
  // Apply new filters
  if (filters.gold_origin) {
    query = query.eq('gold_origin', filters.gold_origin);
  }
  if (filters.gold_color) {
    query = query.eq('gold_color', filters.gold_color);
  }
  
  // Apply date range filters
  if (filters.dateFrom) {
    query = query.gte('created_at', new Date(filters.dateFrom).toISOString());
  }
  if (filters.dateTo) {
    // Add one day to include the end date fully
    const endDate = new Date(filters.dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt('created_at', endDate.toISOString());
  }
  
  const { data: listings, error } = await query;
  
  if (error) return { error };
  
  // If no listings, return empty array
  if (!listings || listings.length === 0) return { data: [] };
  
  // Get like counts for all listings
  const listingIds = listings.map(listing => listing.id);
  const { data: likes, error: likesError } = await supabase
    .from('listing_likes')
    .select('listing_id')
    .in('listing_id', listingIds);
    
  if (likesError) return { error: likesError };
  
  // Count likes for each listing
  const likeCounts = likes.reduce((acc, { listing_id }) => {
    acc[listing_id] = (acc[listing_id] || 0) + 1;
    return acc;
  }, {});
  
  // Add like count to each listing
  const listingsWithLikes = listings.map(listing => ({
    ...listing,
    likeCount: likeCounts[listing.id] || 0
  }));
  
  return { data: listingsWithLikes };
};

export const getListingById = async (id) => {
  // First, get the listing
  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error || !listing) return { error: error || new Error('Listing not found') };
  
  // Get like count for the listing
  const { count: likeCount, error: likesError } = await supabase
    .from('listing_likes')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', id);
    
  if (likesError) return { error: likesError };
  
  // Add like count to the listing
  return {
    data: {
      ...listing,
      likeCount: likeCount || 0
    }
  };
};

export const createListing = async (listingData) => {
  return supabase
    .from('listings')
    .insert(listingData);
};

export const updateListing = async (id, listingData) => {
  return supabase
    .from('listings')
    .update(listingData)
    .eq('id', id);
};

export const deleteListing = async (id) => {
  return supabase
    .from('listings')
    .delete()
    .eq('id', id);
};

// Likes
export const getLikesForListing = async (listingId) => {
  return supabase
    .from('listing_likes')
    .select('*')
    .eq('listing_id', listingId);
};

export const getUserLikeForListing = async (listingId, userId) => {
  return supabase
    .from('listing_likes')
    .select('*')
    .eq('listing_id', listingId)
    .eq('user_id', userId)
    .single();
};

export const toggleLike = async (listingId, userId) => {
  try {
    // Check if like exists
    const { data: existingLike, error: fetchError } = await supabase
      .from('listing_likes')
      .select('id')
      .eq('listing_id', listingId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError) throw fetchError;
    
    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('listing_likes')
        .delete()
        .eq('id', existingLike.id);
        
      if (deleteError) throw deleteError;
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('listing_likes')
        .insert([{ 
          listing_id: listingId, 
          user_id: userId 
        }]);
        
      if (insertError) throw insertError;
    }
    
    // Get updated like count
    const { count, error: countError } = await supabase
      .from('listing_likes')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listingId);
      
    if (countError) throw countError;

    return { data: { count: count || 0 }, error: null };
  } catch (error) {
    console.error('Error in toggleLike:', error);
    return { data: null, error };
  }
};

// Comments
export const getCommentsForListing = async (listingId) => {
  return supabase
    .from('listing_comments')
    .select(`
      *,
      profiles:user_id (name, avatar_url)
    `)
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });
};

export const addComment = async (listingId, userId, comment) => {
  return supabase
    .from('listing_comments')
    .insert({
      listing_id: listingId,
      user_id: userId,
      comment
    });
};

export const updateComment = async (commentId, comment) => {
  return supabase
    .from('listing_comments')
    .update({ comment, updated_at: new Date().toISOString() })
    .eq('id', commentId);
};

export const deleteComment = async (commentId) => {
  return supabase
    .from('listing_comments')
    .delete()
    .eq('id', commentId);
};

// Inquiries
export const sendInquiry = async (listingId, userId, message, contactNumber) => {
  return supabase
    .from('listing_inquiries')
    .insert({
      listing_id: listingId,
      user_id: userId,
      message,
      contact_number: contactNumber
    });
};

export const getInquiries = async () => {
  return supabase
    .from('listing_inquiries')
    .select(`
      *,
      listings (title),
      profiles:user_id (name, email, avatar_url)
    `)
    .order('created_at', { ascending: false });
};

export const getUserInquiries = async (userId) => {
  return supabase
    .from('listing_inquiries')
    .select(`
      *,
      listings (title)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

export const markInquiryAsRead = async (inquiryId) => {
  try {
    const { data, error } = await supabase
      .from('listing_inquiries')
      .update({ status: 'read' })
      .eq('id', inquiryId);
    return { data, error };
  } catch (error) {
    return { error };
  }
};

export const deleteInquiry = async (inquiryId) => {
  try {
    const { data, error } = await supabase
      .from('listing_inquiries')
      .delete()
      .eq('id', inquiryId);
    return { data, error };
  } catch (error) {
    return { error };
  }
};
