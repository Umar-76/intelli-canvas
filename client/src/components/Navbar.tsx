import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          Whiteboard App
        </Link>
        <div className="space-x-4">
          <Link
            to="/auth"
            className="px-4 py-2 text-gray-600 hover:text-blue-600"
          >
            Sign In
          </Link>
          <Link
            to="/board/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            New Board
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;