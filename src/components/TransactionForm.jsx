import { useState } from 'react';

function TransactionForm({ 
  type, 
  item, 
  isOpen, 
  onClose, 
  onSubmit,
  darkMode
}) {
  const initialData = {
    date: new Date().toISOString().split('T')[0],
    price: type === 'sold' ? (item?.price_estimate || '') : '',
    amount: type === 'pawned' ? (item?.price_estimate || '') : '',
    interest_rate: '5',
    duration: '30',
    notes: ''
  };

  const [formData, setFormData] = useState(initialData);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(formData);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-dark-surface-2 border border-dark-surface-4 text-gray-200' : 'bg-white text-gray-900'} rounded-lg shadow-xl p-6 w-full max-w-md`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {type === 'sold' ? 'Mark Item as Sold' : 'Mark Item as Pawned'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>
              Transaction Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`input-field ${darkMode ? 'bg-dark-surface-1 text-gray-200' : 'bg-white text-gray-900'}`}
              required
            />
          </div>
          
          {type === 'sold' && (
            <div>
              <label htmlFor="price" className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>
                Sale Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`input-field ${darkMode ? 'bg-dark-surface-1 text-gray-200' : 'bg-white text-gray-900'}`}
                required
              />
            </div>
          )}
          
          {type === 'pawned' && (
            <>
              <div>
                <label htmlFor="amount" className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>
                  Pawn Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`input-field ${darkMode ? 'bg-dark-surface-1 text-gray-200' : 'bg-white text-gray-900'}`}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="interest_rate" className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  id="interest_rate"
                  name="interest_rate"
                  value={formData.interest_rate}
                  onChange={handleChange}
                  placeholder="5"
                  min="0"
                  step="0.1"
                  className={`input-field ${darkMode ? 'bg-dark-surface-1 text-gray-200' : 'bg-white text-gray-900'}`}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="duration" className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>
                  Duration (days)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="30"
                  min="1"
                  className={`input-field ${darkMode ? 'bg-dark-surface-1 text-gray-200' : 'bg-white text-gray-900'}`}
                  required
                />
              </div>
            </>
          )}
          
          <div>
            <label htmlFor="notes" className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className={`input-field ${darkMode ? 'bg-dark-surface-1 text-gray-200' : 'bg-white text-gray-900'}`}
              placeholder="Add any additional notes about this transaction"
            ></textarea>
          </div>
          
          <div className={`flex justify-end space-x-3 pt-4 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border border-${darkMode ? 'dark-surface-4' : 'gray-300'} rounded-md shadow-sm text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} ${darkMode ? 'bg-dark-surface-2' : 'bg-white'} hover:${darkMode ? 'bg-dark-surface-3' : 'bg-gray-50'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-white'} ${darkMode ? 'bg-gold-dark' : 'bg-gold'} hover:${darkMode ? 'bg-gold-darker' : 'bg-darkgold'}`}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
