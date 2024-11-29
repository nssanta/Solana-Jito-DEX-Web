// src/hooks/useAuth.ts

import { useEffect, useState } from 'react'; // Импортируем хуки useEffect и useState
import { useNavigate } from 'react-router-dom'; // Импортируем хук useNavigate
import Cookies from 'js-cookie';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('password_swap_sol')); // Проверяем наличие пользователя в localStorage
  
  const navigate = useNavigate(); // Инициализируем useNavigate

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); // Перенаправляем на страницу логина, если пользователь не авторизован
    }
  }, [isAuthenticated, navigate]); // Зависимости эффекта: isAuthenticated и navigate

  return isAuthenticated; // Возвращаем статус авторизации
};

export default useAuth; // Экспортируем хук
