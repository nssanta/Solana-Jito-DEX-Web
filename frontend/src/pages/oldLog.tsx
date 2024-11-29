// export default Login; // Экспортируем компонент
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



const Login2: React.FC = () => {

    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    
    useEffect(() => {
        // Временный вывод переменной окружения в консоль
        //localStorage.removeItem('user');

        console.log(localStorage.getItem('user')); // Проверяем, был ли успешно удален элемент 'user'

        console.log("REACT_APP_USERS:", process.env.REACT_APP_USERS);
    }, []);

    const handleLogin = (event: React.FormEvent) => {
        event.preventDefault();
        // Получаем словарь пользователей из переменных окружения
        const users = JSON.parse(process.env.REACT_APP_USERS || '{}');
        // Проверяем наличие введённого пароля в словаре
        if (users[password]) {
            // Сохраняем данные пользователя в localStorage
            localStorage.setItem('password_swap', password);
            //localStorage.setItem('user', JSON.stringify(users[password]));
            navigate('/'); // Перенаправляем на главную страницу
        } else {
            alert('Неверный пароль, проверьте правильность ввода!!!');
        }
    };

    return (
        <form onSubmit={handleLogin}>
        <div>
            <label>Password:</label>
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
        </div>
        <button type="submit">Login</button>
        </form>
       
    );
};

export default Login2;
