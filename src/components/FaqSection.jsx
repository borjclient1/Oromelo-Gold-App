import React from 'react';
import FaqItem from './FaqItem';
import { useTheme } from '../hooks/useTheme';

function FaqSection({ faqs, title = "Frequently Asked Questions" }) {
  const { darkMode } = useTheme();
  
  return (
    <div className={`py-12 ${darkMode ? 'bg-dark-surface text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-3xl font-bold text-center mb-12 ${darkMode ? 'text-gold' : 'text-gray-900'}`}>{title}</h2>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <FaqItem 
              key={index} 
              question={faq.question} 
              answer={faq.answer} 
            />
          ))}
        </div>
        
        <div className={`mt-12 text-center p-6 rounded-lg ${darkMode ? 'bg-dark-surface-2' : 'bg-white'} shadow-sm`}>
          <p className={`text-lg mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Still have questions?
          </p>
          <a 
            href="/contact" 
            className={`inline-flex items-center font-medium ${darkMode ? 'text-gold hover:text-gold-300' : 'text-gold hover:text-gold-600'}`}
          >
            Contact our team 
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default FaqSection;
