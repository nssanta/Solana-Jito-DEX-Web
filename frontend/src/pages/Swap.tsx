import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';



import useAuth from '../hooks/useAuth';
import Cookies from 'js-cookie';
import SwapForm from '../components/SwapForm';
import SwapResult from '../components/SwapResult';
import useSwap from '../hooks/useSwap';




// Основной компонент Swap
const Swap: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = useAuth(); // Проверка аутентификации пользователя
    const userPass = Cookies.get('password_swap_sol') || '';
    const users = JSON.parse(process.env.REACT_APP_USERS || '{}');
    const user = users[userPass]; // Получение пользователя из конфигурации

    // Состояния для различных полей формы
    const [isToken1InputFirst, setIsToken1InputFirst] = useState(true); // Состояние для управления порядком отображения токенов
    const [showSetting, setShowSetting] = useState(true); // Состояние для отображения настроек
    const [swapResult, setSwapResult] = useState<{
        bundleId: string;
        transactionId: string;
        error: string;
        success: boolean;
        confirmed: boolean;
    } | null>(null); // Состояние для хранения результата свопа
    const [isLoading, setIsLoading] = useState(false); // Состояние для индикации загрузки

    const [token1, setToken1] = useState(''); // Состояние для поля token1
    const [token2, setToken2] = useState('So11111111111111111111111111111111111111112'); // Состояние для поля token2
    const [counttok1, setCountTok1] = useState(''); // Состояние для поля counttok1
    const [urlRpc, setUrlRpc] = useState('')
    const [commission, setCommission] = useState(0)
    const [slippage, setSlippage] = useState(0)

    // Перенаправление на страницу логина, если пользователь не аутентифицирован
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

        // Функция-обертка для вызова handleSwap
    const handleSwapWrapper = () => {
        handleSwap(); // Просто вызываем асинхронную функцию handleSwap
        
    };
    // Функция для смены порядка отображения токенов
    const handleSwap =  () => {
        
        setIsToken1InputFirst(!isToken1InputFirst);
        // console.log(swapResult)
    };

    useEffect(() => {
       
        urlRpcRef.current = urlRpc;
        commissionRef.current = commission;
        slippageRef.current = slippage;

    },[urlRpc,commission,slippage]);

    // Используем useRef для актуальных значений
    const urlRpcRef = useRef('');
    const commissionRef = useRef(0);
    const slippageRef = useRef(0);

    // Обработчик отправки формы
    const { onSubmit } = useSwap(
        setIsLoading,
        setSwapResult,
        isToken1InputFirst,
        token1,
        token2,
        counttok1,
        urlRpcRef,
        commissionRef,
        slippageRef,
    );

    // Рендер компонента
    return isAuthenticated ? (
        <div className="flex items-center justify-center min-h-min">
        <div className="w-full max-w-sm mx-auto p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-800 rounded-md shadow-md form-container overflow-hidden">
            <h2 className="font-sans text-center text-2xl font-semibold text-white mb-6">#НАШ SWAP</h2>
                {/* Кнопка для отображения/скрытия настроек */}
                <div className='flex items-center justify-center'>
                    <button onClick={() => setShowSetting(!showSetting)}
                    className="group relative min-h-[20px] w-20 overflow-hidden border border-purple-500 bg-white text-purple-500 shadow-2xl transition-all before:absolute before:left-0 before:top-0 before:h-0 before:w-1/4 before:bg-purple-500 before:duration-500 after:absolute after:bottom-0 after:right-0 after:h-0 after:w-1/4 after:bg-purple-500 after:duration-500 hover:text-white hover:before:h-full hover:after:h-full">
                        <span className="top-0 flex h-full w-full items-center justify-center before:absolute before:bottom-0 before:left-1/4 before:z-0 before:h-0 before:w-1/4 before:bg-purple-500 before:duration-500 after:absolute after:right-1/4 after:top-0 after:z-0 after:h-0 after:w-1/4 after:bg-purple-500 after:duration-500 hover:text-white group-hover:before:h-full group-hover:after:h-full"></span>
                        <span className="absolute bottom-0 left-0 right-0 top-0 z-10 flex h-full w-full items-center justify-center group-hover:text-white">{showSetting ? ' ⇑ ⇑ ⇑ ' : ' ⇓ ⇓ ⇓ '}</span>
                    </button>
                </div>

                <SwapForm
                    showSetting={showSetting}
                    isToken1InputFirst={isToken1InputFirst}
                    handleSwap={handleSwap}
                    onSubmit={onSubmit} // Передаем обновленный обработчик onSubmit
                    isLoading={isLoading}
                    token1={token1}         // Передаем текущее значение token1
                    token2={token2}         // Передаем текущее значение token2
                    counttok1={counttok1}   // Передаем текущее значение counttok1
                    setToken1={setToken1}   // Передаем сеттер для token1
                    setToken2={setToken2}   // Передаем сеттер для token2
                    setCountTok1={setCountTok1} // Передаем сеттер для counttok1
                    setUrlRpcX={setUrlRpc}
                    setCommissionX={setCommission}
                    setSlippageX={setSlippage}
                />
                <SwapResult swapResult={swapResult} />
            </div>
        </div>
    ) : null;
};

export default Swap;
