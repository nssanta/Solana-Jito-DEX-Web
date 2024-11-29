import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import localImage from '../asserts/sol3.webp';
import Cookies from 'js-cookie';



// Определение компонента Login с пропсом setAuthenticated
const Login: React.FC<{ setAuthenticated: (value: boolean) => void }> = ({ setAuthenticated }) => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Функция для обработки отправки формы
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Предотвращение стандартного поведения формы (перезагрузка страницы)
    const users = JSON.parse(process.env.REACT_APP_USERS || '{}');

    if (users[password]) { // Проверка правильности пароля
      Cookies.set('password_swap_sol', password, ); // Установка куки для аутентификации { secure: true }
      setAuthenticated(true); // Установка isAuthenticated в true через переданный пропс
      navigate('/swap'); // Перенаправление на главную страницу
    } else {
      alert('Неправильный пароль. Пожалуйста, проверьте данные и попробуйте еще раз.'); // Вывод сообщения об ошибке при неправильном пароле
    }
  };

  return (
    <div className="h-screen font-sans login bg-cover" style={{ backgroundImage: `url(${localImage})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="container mx-auto h-full flex flex-1 justify-center items-center">
        <div className="w-full max-w-lg">
          <div className="leading-loose">
            <form className="max-w-sm m-4 p-10 bg-slate-600 bg-opacity-70 rounded shadow-xl" onSubmit={handleLogin}>
              <p className="text-white text-center text-lg font-bold">LOGIN</p>
              <div className="mt-2">
                <label className="block text-sm text-white font-bold py-2">Авторизуйтесь</label>
                <input className="w-full px-5 py-1 text-gray-700 bg-gray-300 rounded focus:outline-none focus:bg-white"
                  type="password"
                  id="password"
                  placeholder="Введите пароль"
                  arial-label="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required />
              </div>
              <div className="mt-4 items-center flex justify-between">
                <button className="px-4 py-1 text-white font-light tracking-wider bg-gray-900 hover:bg-gray-800 rounded" type="submit">Вход</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
