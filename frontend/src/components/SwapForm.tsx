import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import SettingsForm from './SettingsForm';
import SwapButton from './SwapButton';
import Cookies from 'js-cookie';

import { Connection, PublicKey } from "@solana/web3.js";

import { fetchBalance, BalancePayload } from '../hooks/useBalance'
import { fetchPrice, PricePayload } from '../hooks/usePrice'

// Компонент формы свопа
const SwapForm: React.FC<{
    showSetting: boolean;
    isToken1InputFirst: boolean;
    handleSwap: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isLoading: boolean;
    token1: string;
    token2: string;
    counttok1: string;
    setToken1: React.Dispatch<React.SetStateAction<string>>;
    setToken2: React.Dispatch<React.SetStateAction<string>>;
    setCountTok1: React.Dispatch<React.SetStateAction<string>>;

    setUrlRpcX: React.Dispatch<React.SetStateAction<string>>;
    setCommissionX: React.Dispatch<React.SetStateAction<number>>;
    setSlippageX: React.Dispatch<React.SetStateAction<number>>;

}> = ({ showSetting, isToken1InputFirst, handleSwap, onSubmit, isLoading,
    token1, token2, counttok1, setToken1, setToken2, setCountTok1, setUrlRpcX, setCommissionX, setSlippageX }) => {

        const [urlRpc, setRpcUrl] = useState(process.env.REACT_APP_RPC_URL || 'https://api.mainnet-beta.solana.com');
        const [slippage, setSlippage] = useState(10);
        const [commission, setCommission] = useState(0.0005);
        const [token1Local, setToken1Local] = useState(token1); // Используем значение token1 из props для инициализации локального состояния
        const [token2Local, setToken2Local] = useState(token2); // Используем значение token2 из props для инициализации локального состояния
        const [counttok1Local, setCountTok1Local] = useState(counttok1); // Используем значение counttok1 из props для инициализации локального состояния
        // Состояние для хранения баланса
        interface BalanceData {
            balance: number;
            uiBalance: number;
            decimal: number; // Количество десятичных разрядов
        }
        const [balance, setBalance] = useState<BalanceData | null>(null);
        // Состояние для хранения цены
        const [price, setPrice] = useState<number | null>(null);
        const [isLoadingPrice, setIsLoadingPrice] = useState(false);

        // Функция для получения баланса
        const getBalance = useCallback(async (token: string) => {
            const userPass = Cookies.get('password_swap_sol') || '';

            const payload: BalancePayload = {
                token: token,
                rpc_https_url: urlRpc,
                id_user: userPass
            };
            try {
                const balance = await fetchBalance(payload);
                setBalance(balance); // Установка полученного баланса в состояние
            } catch (error) {
                console.error('Error during fetch balance:', error);
                setBalance(null); // Сбрасываем баланс в случае ошибки
            }
        }, [urlRpc]);

        // Функция для получения цены
        const getPrice = useCallback(async () => {
            const userPass = Cookies.get('password_swap_sol') || '';

            const payload: PricePayload = {
                base_token: token1Local,
                quote_token: token2Local,
                rpc_https_url: urlRpc,
                id_user: userPass
            };

            try {
                const priceData = await fetchPrice(payload);
                setPrice(priceData); // Предполагается, что в API ответе есть поле price
                // console.log(priceData)
            } catch (error) {
                console.error('Error during fetch price:', error);
                setPrice(null); // Сбрасываем цену в случае ошибки
            }
        }, [token1Local, token2Local, urlRpc]);

        // Вызов getBalance при изменении токенов
        // useEffect(() => {
        //     if (isToken1InputFirst) {
        //         getBalance(token2Local); // Если первый токен input, передаем второй токен
        //     } else {
        //         getBalance(token1Local); // Если первый токен select, передаем первый токен
        //     }
        // }, [token1Local, token2Local, isToken1InputFirst, getBalance]);

        useEffect(() => {
            setUrlRpcX(urlRpc)
            setCommissionX(commission)
            setSlippageX(slippage)

        }, [urlRpc, commission, slippage]);

        useLayoutEffect(() => {
            setUrlRpcX(urlRpc);
            setCommissionX(commission);
            setSlippageX(slippage);
        }, [urlRpc, commission, slippage]);

        // Запрашиваем и обновляем цену.
        useEffect(() => {
            getPrice();
        }, [getPrice]);

        useEffect(() => {
            // При изменении внешнего prop `token1`, обновляем локальное состояние `token1Local`
            setToken1Local(token1);
        }, [token1]);

        useEffect(() => {
            // При изменении внешнего prop `token2`, обновляем локальное состояние `token2Local`
            setToken2Local(token2);
        }, [token2]);

        useEffect(() => {
            // При изменении внешнего prop `counttok1`, обновляем локальное состояние `counttok1Local`
            setCountTok1Local(counttok1);
        }, [counttok1]);

        //Обработчик изменения поля counttok1
        const handleCountTok1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (/^[\d.,]*$/.test(value) || value === '') {
                setCountTok1Local(value);
                setCountTok1(value);
                // updateBalanceFromPercentage(parseFloat(value));
            }
        };


        // Обработчик изменения поля token1
        const handleToken1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setToken1Local(value);
            setToken1(value);
        };

        // Обработчик изменения поля token2
        const handleToken2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            setToken2Local(value); // Устанавливаем локальное значение токена 2
            setToken2(value);      // Устанавливаем значение токена 2 в основном компоненте
        };

        // Вызов getBalance при изменении токенов и обновление ползунка
        useEffect(() => {
            // Функция для обновления баланса и ползунка
            const updateBalanceAndSlider = async () => {
                let tokenToFetchBalance = isToken1InputFirst ? token2Local : token1Local;
                await getBalance(tokenToFetchBalance);
                await getPrice(); // Добавляем вызов для получения цены после обновления баланса
            };

            // Вызываем функцию обновления баланса и ползунка
            updateBalanceAndSlider();
        }, [token1Local, token2Local, isToken1InputFirst, getBalance]);

        // Обработчик изменения ползунка
        const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (balance !== null) {
                const { uiBalance, decimal } = balance;
                const calculatedAmount = (uiBalance * (parseFloat(value) / 100)).toFixed(decimal);
                setCountTok1Local(calculatedAmount);
                setCountTok1(calculatedAmount);
            }
        };

        // const updateBalanceFromPercentage = (percentage: number) => {
        //     if (balance !== null) {
        //         const { uiBalance, decimal } = balance;
        //         const calculatedAmount = (uiBalance * (percentage / 100)).toFixed(decimal);
        //         setCountTok1Local(calculatedAmount);
        //         setCountTok1(calculatedAmount);
        //     }
        // };


        return (
            <form onSubmit={onSubmit}>
                {showSetting && (
                    <SettingsForm
                        urlRpc={urlRpc}
                        setRpcUrl={setRpcUrl}
                        slippage={slippage}
                        setSlippage={setSlippage}
                        commission={commission}
                        setCommission={setCommission}
                        setUrlRpcX={setUrlRpcX}
                        setCommissionX={setCommissionX}
                        setSlippageX={setSlippageX}
                    />
                )}
                <div className="flex-col items-center mb-4">
                    {isToken1InputFirst ? (
                        <>
                            <div className="w-full mb-4">
                                <label htmlFor="token1" className="block text-white text-sm font-bold mb-2">Получаемый токен</label>
                                <input
                                    type="text"
                                    id="token1"
                                    name="token1"
                                    value={token1Local}
                                    onChange={handleToken1Change}
                                    placeholder="Введите токен 1"
                                    required
                                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-700 text-white"
                                />
                            </div>

                            <div className="flex justify-center py-1">
                                <button
                                    type="button"
                                    onClick={handleSwap}
                                    className="rounded-full bg-purple-500 text-white w-32 h-10 p-1 mx-2 hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
                                >
                                    ⇄
                                </button>
                            </div>

                            <div className="w-full mb-4">
                                <label htmlFor="token2" className="block text-white text-sm font-bold mb-2">Продаваемый токен</label>
                                <select
                                    id="token2"
                                    name="token2"
                                    value={token2Local}
                                    onChange={handleToken2Change}
                                    required
                                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-700 text-white"
                                >
                                    <option value="So11111111111111111111111111111111111111112">SOL</option>
                                    <option value="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v">USDC</option>
                                </select>
                                <div className="flex items-center py-2">
                                    <span className="px-2 text-sm font-bold text-yellow-400">Баланс:</span>
                                    <span className="text-sm font-bold  text-green-600">
                                        {balance !== null ? `${balance.uiBalance}` : 'Загрузка...'}
                                    </span>
                                </div>
                                {price !== null && (
                                    <div className="flex items-center py-1">
                                        <span className="px-2 text-sm font-bold text-yellow-400">Цена:</span>
                                        <span className="text-sm font-bold text-green-600">
                                            {price.toFixed(12)} SOL
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center py-1">
                                    <span className="px-2 text-sm font-bold text-yellow-400">Примерное кол-во:</span>
                                    <span className="text-sm font-bold  text-green-600">
                                        {price !== null ? (parseFloat(counttok1Local) / price).toFixed(12) : 'Загрузка...'}

                                    </span>
                                </div>

                                <input
                                    type="text"
                                    id="counttok1"
                                    name="counttok1"
                                    value={counttok1Local}
                                    onChange={handleCountTok1Change}
                                    placeholder="Введите количество токенов"
                                    required
                                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-700 text-white"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={(balance && counttok1Local) ? (parseFloat(counttok1Local) / balance.uiBalance * 100).toString() : '0'}
                                    onChange={handleSliderChange}
                                    className="w-full mt-4 bg-gray-300 rounded-md overflow-hidden appearance-none h-4 focus:outline-none"
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-xs text-gray-500">0%</span>
                                    <div className="flex items-center">
                                        <span className="text-xs text-gray-300 mr-2">
                                            {/* {balance ? (parseFloat(counttok1Local) / balance.uiBalance * 100).toFixed(2) + '%' : '0%'} */}
                                        </span>
                                        <input
                                            type="text"
                                            id="percentageInput"
                                            name="percentageInput"
                                            value={counttok1Local === '' ? '' : (balance ? (parseFloat(counttok1Local) / balance.uiBalance * 100).toFixed(0) : '')}
                                            onChange={(e) => {
                                                const inputValue = e.target.value;
                                                if (inputValue === '' || /^\d+$/.test(inputValue)) { // Проверяем, что вводятся только цифры или пустая строка
                                                    setCountTok1Local(inputValue); // Устанавливаем новое значение в локальное состояние
                                                    if (!isNaN(parseFloat(inputValue)) && balance) {
                                                        const percentageValue = parseFloat(inputValue);
                                                        const calculatedAmount = (balance.uiBalance * (percentageValue / 100)).toFixed(balance.decimal);
                                                        setCountTok1(calculatedAmount);
                                                    }
                                                }
                                            }}
                                            placeholder="Введите проценты"
                                            className="text-xs w-12 h-6 px-3 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-700 text-white"
                                        />

                                    </div>
                                    <span className="text-xs text-gray-500">100%</span>

                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-full mb-4">
                                <label htmlFor="token2" className="block text-white text-sm font-bold mb-2">Получаемый токен</label>
                                <select
                                    id="token2"
                                    name="token2"
                                    value={token2Local}
                                    onChange={handleToken2Change}
                                    required
                                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-700 text-white"
                                >
                                    <option value="So11111111111111111111111111111111111111112">SOL</option>
                                    <option value="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v">USDC</option>
                                </select>
                            </div>
                            <div className="flex justify-center py-1">
                                <button
                                    type="button"
                                    onClick={handleSwap}
                                    className="rounded-full bg-purple-500 text-white w-32 h-10 p-1 mx-2 hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
                                >
                                    ⇄
                                </button>
                            </div>
                            <div className="w-full mb-4">
                                <label htmlFor="token1" className="block text-white text-sm font-bold mb-2">Продаваемый токен</label>
                                <input
                                    type="text"
                                    id="token1"
                                    name="token1"
                                    value={token1Local}
                                    onChange={handleToken1Change}
                                    placeholder="Введите токен 1"
                                    required
                                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-700 text-white"
                                />
                                <div className="flex items-center py-1">
                                    <span className="px-2 text-sm font-bold text-yellow-400">Баланс:</span>
                                    <span className="text-sm font-bold  text-green-600">
                                        {balance !== null ? `${balance.uiBalance}` : 'Загрузка...'}
                                    </span>
                                </div>
                                {price !== null && (
                                    <div className="flex items-center py-1">
                                        <span className="px-2 text-sm font-bold text-yellow-400">Цена:</span>
                                        <span className="text-sm font-bold text-green-600">
                                            {price.toFixed(12)} SOL
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center py-1">
                                    <span className="px-2 text-sm font-bold text-yellow-400">Примерное кол-во:</span>
                                    <span className="text-sm font-bold  text-green-600">
                                        {price !== null ? (parseFloat(counttok1Local) * price).toFixed(12) : 'Загрузка...'}

                                    </span>
                                </div>

                                <input
                                    type="text"
                                    id="counttok1"
                                    name="counttok1"
                                    value={counttok1Local}
                                    onChange={handleCountTok1Change}
                                    placeholder="Введите количество токенов"
                                    required
                                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-700 text-white"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={(balance && counttok1Local) ? (parseFloat(counttok1Local) / balance.uiBalance * 100).toString() : '0'}
                                    onChange={handleSliderChange}
                                    className="w-full mt-4 bg-gray-300 rounded-md overflow-hidden appearance-none h-4 focus:outline-none"
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-xs text-gray-500">0%</span>
                                    <div className="flex items-center">
                                        <span className="text-xs text-gray-300 mr-2">
                                            {/* {balance ? (parseFloat(counttok1Local) / balance.uiBalance * 100).toFixed(2) + '%' : '0%'} */}
                                        </span>
                                        <input
                                            type="text"
                                            id="percentageInput"
                                            name="percentageInput"
                                            value={counttok1Local === '' ? '' : (balance ? (parseFloat(counttok1Local) / balance.uiBalance * 100).toFixed(0) : '')}
                                            onChange={(e) => {
                                                const inputValue = e.target.value;
                                                if (inputValue === '' || /^\d+$/.test(inputValue)) { // Проверяем, что вводятся только цифры или пустая строка
                                                    setCountTok1Local(inputValue); // Устанавливаем новое значение в локальное состояние
                                                    if (!isNaN(parseFloat(inputValue)) && balance) {
                                                        const percentageValue = parseFloat(inputValue);
                                                        const calculatedAmount = (balance.uiBalance * (percentageValue / 100)).toFixed(balance.decimal);
                                                        setCountTok1(calculatedAmount);
                                                    }
                                                }
                                            }}
                                            placeholder="Введите проценты"
                                            className="text-xs w-12 h-6 px-3 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-700 text-white"
                                        />

                                    </div>
                                    <span className="text-xs text-gray-500">100%</span>
                                </div>

                            </div>
                        </>
                    )}
                    <SwapButton isLoading={isLoading} />
                </div>
            </form>
        );
    };

export default SwapForm;
