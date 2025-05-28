import React, { useState } from 'react';
import faqData from '../data/faqData';
import { useTheme } from '../hooks/useTheme';

function FAQ() {
  const { darkMode } = useTheme();
  const faqRef = React.useRef(null);

  // Scroll to top when the component mounts
  React.useEffect(() => {
    if (faqRef.current) {
      faqRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  
  return (
    <div
      ref={faqRef}
      className={`min-h-screen pt-20 pb-12 ${darkMode ? 'bg-dark-surface text-gray-200' : 'bg-gray-50 text-gray-800'}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-gold' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </h1>
          <p className={`text-xl max-w-3xl mx-auto mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Find answers to common questions about our gold pawn and selling services
          </p>
        </div>
        
        {/* Custom FAQ display with reduced spacing */}
        <div className="space-y-6">
          {faqData.map((faq, index) => (
            <div key={index} className={`mb-4 rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-dark-surface-2' : 'bg-white'}`}>
              <FaqItem question={faq.question} answer={faq.answer} />
            </div>
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

// Inline FaqItem component to eliminate any extra spacing from the FaqSection component
function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode } = useTheme();

  return (
    <>
      <button
        className={`w-full p-4 text-left flex justify-between items-center ${darkMode ? 'hover:bg-dark-surface-3' : 'hover:bg-gray-50'}`}
        onClick={() => setIsOpen(!isOpen)}
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
    </>
  );
}

export default FAQ;
