import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode } = useTheme();

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`mb-4 border ${darkMode ? 'border-dark-surface-4' : 'border-gray-200'} rounded-lg overflow-hidden`}>
      <button
        className={`w-full p-4 text-left flex justify-between items-center ${darkMode ? 'bg-dark-surface-2 hover:bg-dark-surface-3' : 'bg-white hover:bg-gray-50'}`}
        onClick={toggleAccordion}
      >
        <span className={`font-semibold ${darkMode ? 'text-gold' : 'text-gray-900'}`}>{question}</span>
        <svg
          className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''} ${darkMode ? 'text-gold-400' : 'text-gold'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className={`p-4 ${darkMode ? 'bg-dark-surface-3 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
          <p dangerouslySetInnerHTML={{ __html: answer }} />
        </div>
      )}
    </div>
  );
}

export default FaqItem;
