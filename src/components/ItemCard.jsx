import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

function ItemCard({ item }) {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  const statusColor = {
    available: darkMode 
      ? 'bg-green-900 bg-opacity-50 text-green-300' 
      : 'bg-green-100 text-green-800',
    pending: darkMode 
      ? 'bg-yellow-900 bg-opacity-50 text-yellow-300' 
      : 'bg-yellow-100 text-yellow-800',
    sold: darkMode 
      ? 'bg-red-900 bg-opacity-50 text-red-300' 
      : 'bg-red-100 text-red-800',
    pawned: darkMode 
      ? 'bg-blue-900 bg-opacity-50 text-blue-300' 
      : 'bg-blue-100 text-blue-800',
    redeemed: darkMode 
      ? 'bg-purple-900 bg-opacity-50 text-purple-300' 
      : 'bg-purple-100 text-purple-800',
    expired: darkMode 
      ? 'bg-gray-800 text-gray-300' 
      : 'bg-gray-100 text-gray-800'
  };

  return (
    <div className={`${darkMode 
      ? 'bg-dark-surface-2 border-dark-surface-4 hover:bg-dark-surface-3' 
      : 'bg-white border-gray-200 hover:shadow-lg'} 
      rounded-lg shadow-md overflow-hidden border transition-all duration-300`}
    >
      <div className="relative">
        <img 
          src={item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={item.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[item.status] || (darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800')}`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        </div>
        <div className="absolute top-2 left-2">
          <span className={`${darkMode ? 'bg-gray-900' : 'bg-gray-900'} text-gold text-xs font-semibold px-2 py-1 rounded-full`}>
            {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'} mb-1`}>{item.title}</h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Category: {item.category}</p>
        <div className="flex justify-between items-center">
          <p className="text-gold font-bold">₱{item.price_estimate.toLocaleString()}</p>
          <div>
            <Link 
              to={`/items/${item.id}`} 
              className={`${darkMode 
                ? 'bg-dark-surface-4 hover:bg-dark-surface-5 text-gold' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} 
                rounded-md text-sm py-1 px-3 transition-colors duration-200`}
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
      
      {user && user.id === item.user_id && (
        <div className={`${darkMode 
          ? 'bg-dark-surface-3 border-dark-surface-5' 
          : 'bg-gray-50 border-gray-200'} 
          px-4 py-3 border-t`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Posted on {new Date(item.created_at).toLocaleDateString()}
            </span>
            <Link 
              to={`/my-items/edit/${item.id}`} 
              className={`text-xs ${darkMode ? 'text-gold-400 hover:text-gold-300' : 'text-gold hover:underline'}`}
            >
              Edit Item
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemCard;
