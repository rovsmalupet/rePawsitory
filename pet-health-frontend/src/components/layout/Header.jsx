import React from 'react';

const Header = ({ userRole }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome back, {userRole === 'owner' ? 'John Doe' : 'Dr. Sarah Johnson'}!
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {userRole === 'owner' ? 'JD' : 'SJ'}
        </div>
      </div>
    </header>
  );
};

export default Header;
