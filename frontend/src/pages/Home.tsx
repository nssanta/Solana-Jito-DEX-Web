import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Cookies from 'js-cookie';

const Home: React.FC = () => {
    // Используем хук useNavigate для навигации между страницами
    const navigate = useNavigate();
    // Используем пользовательский хук для проверки авторизации
    const isAuthenticated = useAuth();
    // Получаем сохранённый пароль из localStorage
    const userPass = Cookies.get('password_swap_sol') || '';
    
    // Парсим переменные окружения с пользователями в объект
    const users = JSON.parse(process.env.REACT_APP_USERS || '{}');
    // Получаем данные пользователя по сохранённому паролю
    const user = users[userPass];
    
    // Используем useEffect для выполнения побочных эффектов
    useEffect(() => {
        
        // Если пользователь не найден по сохранённому паролю, перенаправляем на страницу входа
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Возвращаем JSX для отображения контента на главной странице
    return isAuthenticated ? (
        <div>
            Добро пожаловать домой, {user.name}!
            <br />
            Ваша роль: {user.role}
        </div>
    ) : null;
};

// Экспортируем компонент Home
export default Home;
