import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Top-level "home" pages have nowhere useful to go back to within the app
const HOME_PATHS = ['/dashboard', '/admin'];

const BackButton = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (HOME_PATHS.includes(location.pathname)) return null;

  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100/70 hover:text-gray-700 transition-colors flex-shrink-0 ${className}`}
    >
      <ArrowLeft size={18} />
    </button>
  );
};

export default BackButton;