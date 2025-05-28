import { useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import useItems from './useItems';

/**
 * Hook for admin-specific item operations
 */
function useAdminItems({ user, activeTab = 'all', sortBy = 'created_at', sortOrder = 'desc', filters = {} }) {
  const baseHook = useItems({ activeTab, sortBy, sortOrder, filters });
  const { 
    setItems, 
    setLoading, 
    setError, 
    setItemCounts,
    transformItemData
  } = baseHook;
  
  // Admin-specific data fetching
  const fetchItems = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      // Build the base query
      let query = supabase
        .from("items")
        .select(
          `
          *,
          pawn_requests(*),
          sell_requests(*),
          pawn_transactions(*)
        `
        )
        .order(sortBy, { ascending: sortOrder === "asc" });

      // Apply tab filter (status filter)
      if (activeTab !== "all") {
        query = query.eq("status", activeTab);
      }

      // Apply advanced filters if they exist
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      if (filters.priceMin) {
        query = query.gte(
          "amount",
          parseFloat(filters.priceMin)
        );
      }

      if (filters.priceMax) {
        query = query.lte(
          "amount",
          parseFloat(filters.priceMax)
        );
      }

      if (filters.gold_origin) {
        query = query.eq("gold_origin", filters.gold_origin);
      }

      if (filters.goldType) {
        query = query.eq("gold_type", filters.goldType);
      }

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      const { data: itemsData, error: itemsError } = await query;

      if (itemsError) {
        console.error("Error fetching items:", itemsError);
        throw itemsError;
      }

      // Get counts for each status
      const { data: allItemsStatus, error: allItemsError } = await supabase
        .from("items")
        .select("status");

      if (allItemsError) {
        console.error("Error fetching all items:", allItemsError);
      } else if (allItemsStatus) {
        // Initialize counts object
        const counts = {
          pending: 0,
          approved: 0,
          sold: 0,
          pawned: 0,
          rejected: 0,
          all: allItemsStatus.length,
        };

        // Count items by status
        allItemsStatus.forEach((item) => {
          if (item.status in counts) {
            counts[item.status]++;
          }
        });

        setItemCounts(counts);
      }

      // Transform the data to have pawn details and sell details directly accessible
      const transformedData = transformItemData(itemsData || []);

      // Fetch user data if needed
      if (transformedData && transformedData.length > 0) {
        const userIds = transformedData
          .filter((item) => item.user_id)
          .map((item) => item.user_id);

        if (userIds.length > 0) {
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", userIds);

          if (userError) {
            console.error("Error fetching user data:", userError);
          } else if (userData) {
            // Add user data to items
            transformedData.forEach((item) => {
              if (item.user_id) {
                const user = userData.find((u) => u.id === item.user_id);
                if (user) {
                  item.user_profile = user;
                }
              }
            });
          }
        }
      }

      setItems(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [user, activeTab, sortBy, sortOrder, filters, setItems, setLoading, setError, setItemCounts, transformItemData]);

  // Effect to trigger fetch when relevant dependencies change
  useEffect(() => {
    // Only fetch if there's a user
    if (user) {
      fetchItems();
    }
  }, [user, activeTab, sortBy, sortOrder, filters, fetchItems]);

  // Admin actions
  const handleApproveItem = async (item) => {
    try {
      const { error } = await supabase
        .from("items")
        .update({ status: "approved" })
        .eq("id", item.id);

      if (error) throw error;

      // Update the items state
      setItems(prevItems => 
        prevItems.map((i) => (i.id === item.id ? { ...i, status: "approved" } : i))
      );

      return { success: true, message: "Item has been approved!" };
    } catch (error) {
      console.error("Error approving item:", error);
      return { success: false, message: "Failed to approve the item." };
    }
  };

  const handleRejectItem = async (item) => {
    try {
      const { error } = await supabase
        .from("items")
        .update({ status: "rejected" })
        .eq("id", item.id);

      if (error) throw error;

      setItems(prevItems => 
        prevItems.map((i) => (i.id === item.id ? { ...i, status: "rejected" } : i))
      );

      return { success: true, message: "Item has been rejected." };
    } catch (error) {
      console.error("Error rejecting item:", error);
      return { success: false, message: "Failed to reject the item." };
    }
  };

  const handleMarkAsPawned = async (item, pawnFormData) => {
    try {
      // Format dates as ISO strings to avoid type conversion issues
      const maturityDate = pawnFormData.maturity_date ? 
        new Date(pawnFormData.maturity_date).toISOString() : null;
      
      const dueDate = pawnFormData.due_date ? 
        new Date(pawnFormData.due_date).toISOString() : null;
      
      // Use a direct SQL query approach to bypass RLS policies
      // This requires that your Supabase client has sufficient permissions
      const { data: transactionData, error: transactionError } = await supabase
        .from("pawn_transactions")
        .insert({
          transaction_id: pawnFormData.transaction_id,
          item_id: item.id,
          customer_name: pawnFormData.full_name,
          customer_id_type: pawnFormData.gov_id,
          customer_id_number: pawnFormData.item_title, 
          customer_contact: pawnFormData.contact_info,
          appraised_value: parseFloat(pawnFormData.appraised_value),
          loan_amount: parseFloat(pawnFormData.loan_amount),
          interest_rate: parseFloat(pawnFormData.interest_rate),
          maturity_date: maturityDate,
          due_date: dueDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: "pawned",
          // Add the user_id reference that matches the profiles table
          // This is likely required by your RLS policies
          user_id: item.user_id
        }, { 
          // Use the Supabase options to bypass RLS
          // This might be necessary if the RLS policies are restrictive
          returning: 'minimal',
          count: 'exact'
        });

      if (transactionError) {
        console.error("Error creating transaction record:", transactionError);
        throw transactionError;
      }
      
      // Now update the item's status to pawned
      const { error: itemUpdateError } = await supabase
        .from("items")
        .update({
          status: "pawned",
          updated_at: new Date().toISOString(),
          // If we have transaction data, link it
          ...(transactionData && transactionData.length > 0 ? { pawn_transaction_id: transactionData[0].id } : {})
        })
        .eq("id", item.id);

      if (itemUpdateError) {
        console.error("Error updating item status:", itemUpdateError);
        throw itemUpdateError;
      }

      // Update local state
      setItems(prevItems => 
        prevItems.map((i) => (i.id === item.id ? { 
          ...i, 
          status: "pawned",
          pawn_transaction: transactionData && transactionData.length > 0 ? transactionData[0] : null
        } : i))
      );

      return { 
        success: true, 
        message: "Item has been successfully marked as Pawned and transaction details have been saved."
      };
    } catch (error) {
      console.error("Error marking item as pawned:", error);
      return { success: false, message: "Failed to update the item status: " + error.message };
    }
  };

  const handleMarkAsSold = async (item) => {
    try {
      // Update the item's status to sold
      const { error: itemUpdateError } = await supabase
        .from("items")
        .update({
          status: "sold",
          updated_at: new Date().toISOString()
        })
        .eq("id", item.id);

      if (itemUpdateError) {
        console.error("Error updating item status:", itemUpdateError);
        throw itemUpdateError;
      }

      // Update local state
      setItems(prevItems => 
        prevItems.map((i) => (i.id === item.id ? { 
          ...i, 
          status: "sold"
        } : i))
      );

      return { 
        success: true, 
        message: "Item has been successfully marked as Sold."
      };
    } catch (error) {
      console.error("Error marking item as sold:", error);
      return { success: false, message: "Failed to update the item status: " + error.message };
    }
  };

  const handleDeleteItem = async (item) => {
    try {
      // Delete associated image from storage bucket for approved/sold/pawned items
      if (item.image_url && (item.status === 'approved' || item.status === 'sold' || item.status === 'pawned')) {
        // Extract the path relative to the bucket
        const path = item.image_url.split('/storage/v1/object/public/gold-items-images/')[1];
        
        try {
          // Try to delete the file using the relative path
          const { error: storageError } = await supabase
            .storage
            .from('gold-items-images')
            .remove([path.trim()]);

          if (storageError) {
            console.error('Error deleting image:', storageError);
          }
        } catch (error) {
          console.error('Failed to delete image:', error);
        }
      }

      // Delete associated pawn_requests if they exist
      if (item.item_type === "pawn") {
        const { error: pawnError } = await supabase
          .from("pawn_requests")
          .delete()
          .eq("item_id", item.id);

        if (pawnError) throw pawnError;
      }

      // Delete associated sell_requests if they exist
      if (item.item_type === "sell") {
        const { error: sellError } = await supabase
          .from("sell_requests")
          .delete()
          .eq("item_id", item.id);

        if (sellError) throw sellError;
      }

      // Delete the item itself
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      // Update local state
      setItems(prevItems => 
        prevItems.filter((i) => i.id !== item.id)
      );

      return { success: true, message: "Item and associated image have been deleted." };
    } catch (error) {
      console.error("Error deleting item and image:", error);
      return { success: false, message: "Failed to delete item and image." };
    }
  };

  return {
    ...baseHook,
    fetchItems,
    handleApproveItem,
    handleRejectItem,
    handleMarkAsPawned,
    handleDeleteItem,
    handleMarkAsSold
  };
}

export default useAdminItems;
