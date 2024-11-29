import { useCallback } from 'react';
import Cookies from 'js-cookie';
import { errorMonitor } from 'events';
import {ip} from '../CONST'

const useSwapLimit = (
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setSwapResult: React.Dispatch<React.SetStateAction<{
        jobId: string;
    } | null>>,
    isToken1InputFirst: boolean,
    token1: string,    // Здесь передаем значение token1 из компонента SwapForm
    token2: string,    // Здесь передаем значение token2 из компонента SwapForm
    counttok1: string, // Здесь передаем значение counttok1 из компонента SwapForm
    desiredPrice: string,
    urlRpc: React.MutableRefObject<string>,
    commission: React.MutableRefObject<Number>,
    slippage: React.MutableRefObject<Number>,

) => {
    const onSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        
        event.preventDefault(); // Предотвращаем стандартное поведение отправки формы

        setIsLoading(true); // Устанавливаем состояние загрузки в true
       // setSwapResult(null); // Сбрасываем результат свопа

        // Получаем данные формы
        const form = event.currentTarget;
        const formData = new FormData(form);

        // Извлекаем данные из формы
        // const commission = formData.get('commission');
        // const slippage = formData.get('slippage');
        const amount = formData.get('counttok1');
       // const urlRPC = formData.get('urlRpc');
        const limitPrice = formData.get('limitprice'); // для цены

        // Получаем сохранённый пароль из Cookies
        const userPass = Cookies.get('password_swap_sol') || '';

        // Преобразуем полученные данные в числовые значения или строки, если необходимо
       // const commissionNumber = typeof commission === 'string' ? parseFloat(commission) : commission;
       // const slippageNumber = typeof slippage === 'string' ? parseFloat(slippage.current) : slippage;
        const amountNumber = typeof amount === 'string' ? parseFloat(amount.replace(',', '')) : 0;
        const LimitNumber = typeof limitPrice === 'string' ? parseFloat(limitPrice.replace(',', '')) : 0; // для цены

        // Определяем, какой токен использовать первым и какой вторым
        const buyToken = isToken1InputFirst ? token1 : token2;
        const sellToken = isToken1InputFirst ? token2 : token1;
        //console.log(buyToken,sellToken)
        // Формируем тело запроса для отправки на сервер
        const requestBody = {
            buy_token: buyToken,
            sell_token: sellToken,
            amount: amountNumber,
            slippage: slippage.current,
            jito_fees: commission.current,
            rpc_https_url: urlRpc.current,
            id_user: userPass,
            //
            temp_price: LimitNumber,
            base_token: token2,
            quote_token: token1
        };
        // console.log(requestBody)

        try {
            // Отправляем POST запрос на сервер с данными
            const response = await fetch(`${ip}/pricepotok`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody) // Преобразуем тело запроса в формат JSON
            });

            // Получаем JSON ответ от сервера
            const result = await response.json();
            //console.log(result)

            //Проверяем успешность ответа от сервера
            if (response.ok) {
                // Если ответ успешный, устанавливаем результат свопа в состояние с успехом
                setSwapResult({
                    jobId: result.jobId,
                });
            } else {
                // Если ответ неуспешный, устанавливаем результат свопа в состояние с ошибкой
                setSwapResult({
                    jobId: '',
                });
            }
        } catch (error) {
            //В случае ошибки запроса, устанавливаем результат свопа в состояние с ошибкой
            setSwapResult({
                jobId: '',
            });
        } finally {
            setIsLoading(false); // Устанавливаем состояние загрузки в false после выполнения запроса
        }
    }, [setIsLoading, isToken1InputFirst, token1, token2]); //setSwapResult,

    return { onSubmit };
};

export default useSwapLimit;

