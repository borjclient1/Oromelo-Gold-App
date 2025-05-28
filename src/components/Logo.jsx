import React from 'react';
import { Link } from 'react-router-dom';

function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex-shrink-0 flex items-center ${className}`}>
      <img 
        src="/images/oromelo-logo.png" 
        alt="Oromelo Gold" 
        className="h-8 md:h-10 w-auto object-contain" 
      />
    </Link>
  );
}

export default Logo;
