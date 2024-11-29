import { useState } from 'react';
import { ip } from '../CONST'; // Убедитесь, что этот путь правильный
import Cookies from 'js-cookie';

// Хук для завершения работы
const useTerminateJob = () => {
  const [loading, setLoading] = useState(false); // Состояние загрузки
  const [error, setError] = useState<string | null>(null); // Состояние ошибки

  const terminateJob = async (jobId: string) => {
    // Получаем сохранённый пароль из Cookies
    const userPass = Cookies.get('password_swap_sol') || '';

    setLoading(true);
    try {
      const response = await fetch(`${ip}/terminate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          userId: userPass, // В соответствии с примером
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to terminate job');
      }

      setLoading(false);
      const data = await response.json();
      return data;
    } catch (error: any) { // Явно указываем тип для переменной error
      setError(error.message);
      setLoading(false);
    }
  };

  return { terminateJob, loading, error };
};

export default useTerminateJob;
