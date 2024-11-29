import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; 
import Cookies from 'js-cookie';
import Login from './pages/AuthLogin';
import Swap from './pages/Swap';
import NavigationBar from './components/NavigationBar'; // Импортируйте компонент NavigationBar
import LimitSwap from './pages/LimitSwap'; // Импортируйте компонент Page2
import ListLimit from './pages/ListLimitPage'; // Импортируйте компонент Page3

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('password_swap_sol'));

  return (
    <Router>
      {isAuthenticated && <NavigationBar />} {/* Отображение панели навигации если пользователь аутентифицирован */}
      <Routes>
        <Route path="/login" element={<Login setAuthenticated={setIsAuthenticated} />} />
        <Route path="/swap" element={isAuthenticated ? <Swap /> : <Navigate to="/login" />} />
        <Route path="/limit" element={isAuthenticated ? <LimitSwap /> : <Navigate to="/login" />} />
        <Route path="/llist" element={isAuthenticated ? <ListLimit /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
