import React from 'react';
import { Link } from 'react-router-dom';

const NavigationBar: React.FC = () => {
  return (
    <nav className="bg-gray-900 p-4">
      <div className="container mx-auto flex justify-around">
        <Link to="/swap" className="text-white">Swap</Link>
        <Link to="/limit" className="text-white">Limit Swap</Link>
        <Link to="/llist" className="text-white">List Limit</Link>
      </div>
    </nav>
  );
};

export default NavigationBar;
