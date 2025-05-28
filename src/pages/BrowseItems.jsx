import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import ItemCard from '../components/ItemCard';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

function BrowseItems() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    item_type: '',
    price_min: '',
    price_max: '',
    status: 'available', // Default to only show available items
    gold_type: '', // New filter for gold type
    karat: '',     // New filter for karat
    color: '',     // New filter for gold color
    weight_min: '', // New filter for minimum weight
    weight_max: '', // New filter for maximum weight
  });

  const isAdmin = user && user.email === 'admin@goldpawn.com';

  // Fetch items from Supabase
  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from('items')
          .select('*');
        
        // Apply filters
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        
        if (filters.item_type) {
          query = query.eq('item_type', filters.item_type);
        }
        
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.gold_type) {
          query = query.eq('gold_type', filters.gold_type);
        }
        
        if (filters.karat) {
          query = query.eq('karat', filters.karat);
        }
        
        if (filters.color) {
          query = query.eq('color', filters.color);
        }
        
        if (filters.weight_min) {
          query = query.gte('weight', parseFloat(filters.weight_min));
        }
        
        if (filters.weight_max) {
          query = query.lte('weight', parseFloat(filters.weight_max));
        }
        
        if (filters.price_min) {
          query = query.gte('price_estimate', parseFloat(filters.price_min));
        }
        
        if (filters.price_max) {
          query = query.lte('price_estimate', parseFloat(filters.price_max));
        }
        
        // If not admin, only show items from the site owner (admin)
        if (!isAdmin) {
          // Get admin user ID (assuming email is admin@goldpawn.com)
          const { data: adminData } = await supabase
            .from('Users')
            .select('id')
            .eq('email', 'admin@goldpawn.com')
            .single();
            
          if (adminData && adminData.id) {
            query = query.eq('user_id', adminData.id);
          } else {
            // Fallback if admin user not found - use a placeholder ID that won't match anything
            query = query.eq('user_id', 'admin-user');
          }
        }
        
        // Order by creation date (newest first)
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setItems(data || []);
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Failed to fetch items. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchItems();
  }, [filters, user, isAdmin]);

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  }

  function resetFilters() {
    setFilters({
      category: '',
      item_type: '',
      price_min: '',
      price_max: '',
      status: 'available',
      gold_type: '',
      karat: '',
      color: '',
      weight_min: '',
      weight_max: '',
    });
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark-surface text-gray-200' : 'bg-gray-50 text-gray-900'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-3xl font-extrabold ${darkMode ? 'text-gold' : 'text-gray-900'} mb-6`}>
          Browse Gold Items
        </h1>

        {/* Filters */}
        <div className={`${darkMode ? 'bg-dark-surface-2 border border-dark-surface-4' : 'bg-white'} shadow rounded-lg p-6 mb-8`}>
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gold' : 'text-gray-900'} mb-4`}>Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category filter */}
            <div>
              <label htmlFor="category" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className={`${darkMode ? 'bg-dark-surface-3 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} input-field`}
              >
                <option value="">All Categories</option>
                <option value="necklaces">Necklaces</option>
                <option value="rings">Rings</option>
                <option value="bracelets">Bracelets</option>
                <option value="earrings">Earrings</option>
                <option value="watches">Watches</option>
                <option value="coins">Coins</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Item type filter */}
            <div>
              <label htmlFor="item_type" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Listing Type
              </label>
              <select
                id="item_type"
                name="item_type"
                value={filters.item_type}
                onChange={handleFilterChange}
                className={`${darkMode ? 'bg-dark-surface-3 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} input-field`}
              >
                <option value="">All Types</option>
                <option value="sell">For Sale</option>
                <option value="pawn">For Pawn</option>
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label htmlFor="status" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className={`${darkMode ? 'bg-dark-surface-3 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} input-field`}
              >
                <option value="available">Available</option>
                {isAdmin && (
                  <>
                    <option value="sold">Sold</option>
                    <option value="pawned">Pawned</option>
                    <option value="redeemed">Redeemed</option>
                    <option value="expired">Expired</option>
                    <option value="all">All Statuses</option>
                  </>
                )}
              </select>
            </div>

            {/* Gold Type filter */}
            <div>
              <label htmlFor="gold_type" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Gold Type
              </label>
              <select
                id="gold_type"
                name="gold_type"
                value={filters.gold_type}
                onChange={handleFilterChange}
                className={`${darkMode ? 'bg-dark-surface-3 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} input-field`}
              >
                <option value="">All Types</option>
                <option value="solid">Solid Gold</option>
                <option value="plated">Gold Plated</option>
                <option value="filled">Gold Filled</option>
                <option value="vermeil">Vermeil</option>
              </select>
            </div>

            {/* Karat filter */}
            <div>
              <label htmlFor="karat" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Karat
              </label>
              <select
                id="karat"
                name="karat"
                value={filters.karat}
                onChange={handleFilterChange}
                className={`${darkMode ? 'bg-dark-surface-3 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} input-field`}
              >
                <option value="">All Karats</option>
                <option value="24k">24K</option>
                <option value="22k">22K</option>
                <option value="18k">18K</option>
                <option value="14k">14K</option>
                <option value="10k">10K</option>
              </select>
            </div>

            {/* Color filter */}
            <div>
              <label htmlFor="color" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Gold Color
              </label>
              <select
                id="color"
                name="color"
                value={filters.color}
                onChange={handleFilterChange}
                className={`${darkMode ? 'bg-dark-surface-3 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} input-field`}
              >
                <option value="">All Colors</option>
                <option value="yellow">Yellow Gold</option>
                <option value="white">White Gold</option>
                <option value="rose">Rose Gold</option>
                <option value="two-tone">Two-Tone</option>
                <option value="tri-color">Tri-Color</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Price Range (PHP)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="price_min"
                  placeholder="Min"
                  value={filters.price_min}
                  onChange={handleFilterChange}
                  className={`w-1/2 ${darkMode ? 'bg-dark-surface-3 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} input-field`}
                />
                <input
                  type="number"
                  name="price_max"
                  placeholder="Max"
                  value={filters.price_max}
                  onChange={handleFilterChange}
                  className={`w-1/2 ${darkMode ? 'bg-dark-surface-3 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} input-field`}
                />
              </div>
            </div>

            {/* Weight Range */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Weight (grams)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="weight_min"
                  placeholder="Min"
                  value={filters.weight_min}
                  onChange={handleFilterChange}
                  className={`w-1/2 ${darkMode ? 'bg-dark-surface-3 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} input-field`}
                />
                <input
                  type="number"
                  name="weight_max"
                  placeholder="Max"
                  value={filters.weight_max}
                  onChange={handleFilterChange}
                  className={`w-1/2 ${darkMode ? 'bg-dark-surface-3 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} input-field`}
                />
              </div>
            </div>

            {/* Reset button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className={`${darkMode ? 'bg-dark-surface-4 text-gold hover:bg-dark-surface-5' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300 px-4 py-2 rounded-md`}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
              <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading items...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className={`${darkMode ? 'bg-red-900 text-white' : 'bg-red-100 text-red-700'} p-4 rounded-md`}>
                {error}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'bg-dark-surface-2' : 'bg-white'} shadow rounded-lg p-8`}>
              <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No items found matching your criteria.</p>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrowseItems;
