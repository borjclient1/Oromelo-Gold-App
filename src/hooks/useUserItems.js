import { useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import useItems from './useItems';

/**
 * Hook for user-specific item operations
 */
function useUserItems({ user, activeTab = 'all', sortBy = 'created_at', sortOrder = 'desc' }) {
  const baseHook = useItems({ activeTab, sortBy, sortOrder });
  const { 
    setItems,
    setLoading, 
    setError, 
    setItemCounts,
    transformItemData
  } = baseHook;

  // User-specific data fetching
  const fetchItems = useCallback(async () => {
    if (!user || !user.id) {
      return;
    }
    
    setLoading(true);
    setError(null);

    try {      
      // Main query for items based on active tab
      let query = supabase
        .from("items")
        .select(
          `
          *,
          pawn_requests(*),
          sell_requests(*)
        `
        )
        .eq("user_id", user.id)
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (activeTab !== "all") {
        query = query.eq("status", activeTab);
      }

      const { data: itemsData, error: itemsError } = await query;

      if (itemsError) {
        console.error("Error fetching items:", itemsError);
        throw itemsError;
      }
      
      // Fetch pawn transaction details for pawned items
      let itemsWithTransactions = [...itemsData];
      const pawnedItems = itemsData.filter(item => item.status === "pawned" && item.item_type === "pawn");
      
      if (pawnedItems.length > 0) {
        const pawnedItemIds = pawnedItems.map(item => item.id);
        
        const { data: transactionsData, error: transactionsError } = await supabase
          .from("pawn_transactions")
          .select("*")
          .in("item_id", pawnedItemIds);
          
        if (transactionsError) {
          console.error("Error fetching pawn transactions:", transactionsError);
        } else if (transactionsData) {
          // Attach transaction data to the matching items
          itemsWithTransactions = itemsData.map(item => {
            if (item.status === "pawned" && item.item_type === "pawn") {
              const transaction = transactionsData.find(t => t.item_id === item.id);
              if (transaction) {
                return { ...item, pawn_transaction: transaction };
              }
            }
            return item;
          });
        }
      }

      // Fetch all items for status counts - separate query without tab filter
      const { data: allItemsStatus, error: statusError } = await supabase
        .from("items")
        .select("status, item_type")
        .eq("user_id", user.id);

      if (statusError) {
        console.error("Error fetching status counts:", statusError);
        throw statusError;
      }

      // Count items for each status
      const counts = {
        all: allItemsStatus.length,
        pending: allItemsStatus.filter((i) => i.status === "pending").length,
        approved: allItemsStatus.filter((i) => i.status === "approved").length,
        pawned: allItemsStatus.filter(
          (i) => i.status === "pawned" && i.item_type === "pawn"
        ).length,
        sold: allItemsStatus.filter(
          (i) => i.status === "sold" && i.item_type === "sell"
        ).length,
        rejected: allItemsStatus.filter((i) => i.status === "rejected").length,
      };

      setItemCounts(counts);

      // Transform the data to have pawn details and sell details directly accessible
      const transformedData = transformItemData(itemsWithTransactions || []);

      setItems(transformedData);
    } catch (error) {
      console.error("Error fetching user items:", error);
      setError("Failed to fetch your items. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [user, activeTab, sortBy, sortOrder, setItems, setLoading, setError, setItemCounts, transformItemData]);

  // Effect to trigger fetch when relevant dependencies change
  useEffect(() => {
    // Only fetch if there's a user with an ID
    if (user && user.id) {
      fetchItems();
    }
  }, [user, activeTab, sortBy, sortOrder, fetchItems]);

  // User actions
  const handleDeleteItem = async (itemId) => {
    // Find the item to check if it's pending
    const item = baseHook.items.find((item) => item.id === itemId);

    if (!item) {
      return { success: false, message: "Item not found." };
    }

    // Only allow deletion of pending items
    if (item.status !== "pending") {
      return { success: false, message: "You can only delete items that are pending review." };
    }

    try {
      // If it's a pawn item, delete the related pawn request first
      if (item.item_type === "pawn") {
        const { error: pawnDeleteError } = await supabase
          .from("pawn_requests")
          .delete()
          .eq("item_id", itemId);

        if (pawnDeleteError) throw pawnDeleteError;
      }

      // If it's a sell item, delete the related sell request first
      if (item.item_type === "sell") {
        const { error: sellDeleteError } = await supabase
          .from("sell_requests")
          .delete()
          .eq("item_id", itemId);

        if (sellDeleteError) throw sellDeleteError;
      }

      // Then delete the main item record
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId)
        .eq("user_id", user.id); // Ensure user can only delete their own items

      if (error) throw error;

      // Update local state to remove deleted item
      setItems(prevItems => prevItems.filter((item) => item.id !== itemId));

      return { success: true, message: "Item deleted successfully" };
    } catch (error) {
      console.error("Error deleting item:", error);
      return { success: false, message: "Failed to delete item. Please try again." };
    }
  };

  const handleMarkAsSold = async (itemId) => {
    try {
      const { error } = await supabase
        .from("items")
        .update({ 
          status: "sold",
          updated_at: new Date().toISOString()
        })
        .eq("id", itemId)
        .eq("user_id", user.id); // Safety check

      if (error) throw error;

      // Update local state
      setItems(prevItems => 
        prevItems.map((item) => 
          item.id === itemId ? { ...item, status: "sold" } : item
        )
      );

      return { success: true, message: "Item marked as sold successfully" };
    } catch (error) {
      console.error("Error marking item as sold:", error);
      return { success: false, message: "Failed to update item status. Please try again." };
    }
  };

  return {
    ...baseHook,
    fetchItems,
    handleDeleteItem,
    handleMarkAsSold
  };
}

export default useUserItems;
