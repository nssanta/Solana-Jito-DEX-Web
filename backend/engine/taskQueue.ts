// import { parentPort, workerData, threadId } from 'worker_threads'; // Импорт необходимых модулей для работы с worker threads
// import Raydium from '../swap/raydium'; // Импорт класса для работы с Raydium
// import { build_bundle, onBundleResult } from '../jito/build_bundle';
// import { swap } from '../engine/engines';
// import {LAMPORTS_PER_SOL} from '@solana/web3.js'

// // Извлекаем необходимые данные из workerData
// const { buy_token, sell_token, amount, slippage, jito_fees, rpc_https_url, id_user, base_token, quote_token, temp_price } = workerData as {
//     buy_token: string,
//     sell_token: string,
//     amount: number,
//     slippage: number,
//     jito_fees: number,
//     base_token: string;
//     quote_token: string;
//     rpc_https_url: string;
//     id_user: string;
//     temp_price: number;
// };

// // Получаем данные пользователя из переменных окружения
// const users = JSON.parse(process.env.REACT_APP_USERS || '{}');
// const user = users[id_user];

// // Проверяем наличие пользователя и его кошелька
// if (!user || !user.wallet) {
//     console.error('Пользователь не найден или у пользователя отсутствует кошелек.');
//     throw new Error('Пользователь не найден или у пользователя отсутствует кошелек.');
// }

// // Извлекаем кошелек пользователя
// const wallet = user.wallet;

// // Асинхронная функция для выполнения фоновой задачи
// const fetchPrice = async () => {
//     try {
//         const raydium = new Raydium(rpc_https_url, wallet);

//         let price = await raydium.getPriceOfPool(base_token, quote_token); // Получение текущей цены пула
//         console.log(`Первые данные при запросе ${quote_token}/${base_token}: ${price}`); // Вывод в консоль текущей цены

//         // ЕСЛИ МЫ ЖДЕМ ПОКА ЦЕНА ПОДНИМЕТЬСЯ 
//         if (price < temp_price) {
//             const interval = setInterval(async () => {
//                 try {
//                     price = await raydium.getPriceOfPool(base_token, quote_token); // Обновляем цену
//                     console.log(`Текущая цена ${quote_token}/${base_token}: ${price}`); // Выводим текущую цену

//                     if (price >= temp_price) {
//                         clearInterval(interval); // Останавливаем интервал
//                         console.log(`Цена достигла ${temp_price} текущих монет ${quote_token}/${base_token}`);

//                         let result = await swap(buy_token, sell_token, amount, slippage, jito_fees*LAMPORTS_PER_SOL, rpc_https_url, id_user);
//                         let confTrans = await raydium.confirm(result.trans_hash[0]);

//                         if (confTrans?.confirmed == false) {
//                             console.log(`ТРАНЗАКЦИЯ НЕ ПОДТВЕРДИЛАСЬ`);
//                             let tempFees = 0.0001;

//                             for (let i = 0; i < 20; i++) { // Повторяем 20 итераций
//                                 console.log(`ИТЕРАЦИЯ НОМЕР ${i}`);
//                                 result = await swap(buy_token, sell_token, amount, slippage, (jito_fees + tempFees)* LAMPORTS_PER_SOL, rpc_https_url, id_user);
//                                 confTrans = await raydium.confirm(result.trans_hash[0]);
//                                 tempFees += 0.0001;

//                                 if (confTrans?.confirmed == true) {
//                                     parentPort?.postMessage('Поток завершается');
//                                     return { confirmed: true };
//                                 }
//                                 console.log(`РЕЗУЛЬТАТ ТРАНЗАКЦИИ В ИТЕРАЦИИ ${i} = ${confTrans} commis = ${jito_fees + tempFees}`);
//                             }
//                         }
//                         parentPort?.postMessage('Поток завершается');
//                         return { confirmed: false };
//                     }
//                 } catch (error) {
//                     // Обработка ошибок при получении цены
//                     console.error(`Ошибка при выполнение в условие ${quote_token}/${base_token}:`, error);
//                     clearInterval(interval); // Останавливаем интервал при ошибке
//                     parentPort?.postMessage('ОШИБКА ПОТОКА!!!'); // Отправляем сообщение о неудачном завершении задачи родительскому потоку
//                 }
//             }, 1000); // Интервал проверки цены (1000 мс = 1 секунда)

//         } else if (price > temp_price) { // ЕСЛИ МЫ ЖДЕМ ПОКА ЦЕНА ОПУСТИТЬСЯ
//             const interval = setInterval(async () => {
//                 try {
//                     price = await raydium.getPriceOfPool(base_token, quote_token); // Обновляем цену
//                     console.log(`Текущая цена ${quote_token}/${base_token}: ${price}`); // Выводим текущую цену

//                     if (price <= temp_price) {
//                         clearInterval(interval); // Останавливаем интервал
//                         console.log(`Цена достигла ${temp_price} текущих монет ${quote_token}/${base_token}`);

//                         let result = await swap(buy_token, sell_token, amount, slippage, jito_fees*LAMPORTS_PER_SOL, rpc_https_url, id_user);
//                         let confTrans = await raydium.confirm(result.trans_hash[0]);

//                         if (confTrans?.confirmed == false) {
//                             console.log(`ТРАНЗАКЦИЯ НЕ ПОДТВЕРДИЛАСЬ`);
//                             let tempFees = 0.0001;

//                             for (let i = 0; i < 20; i++) { // Повторяем 20 итераций
//                                 console.log(`ИТЕРАЦИЯ НОМЕР ${i}`);
//                                 result = await swap(buy_token, sell_token, amount, slippage, (jito_fees + tempFees)* LAMPORTS_PER_SOL, rpc_https_url, id_user);
//                                 confTrans = await raydium.confirm(result.trans_hash[0]);
//                                 tempFees += 0.0001;

//                                 if (confTrans?.confirmed == true) {
//                                     parentPort?.postMessage('Поток завершается');
//                                     return { confirmed: true };
//                                 }
//                                 console.log(`РЕЗУЛЬТАТ ТРАНЗАКЦИИ В ИТЕРАЦИИ ${i} = ${confTrans} commis = ${jito_fees + tempFees}`);
//                             }
//                         }
//                         parentPort?.postMessage('Поток завершается');
//                         return { confirmed: false };
//                     }
//                 } catch (error) {
//                     // Обработка ошибок при получении цены
//                     console.error(`Ошибка при выполнение в условие ${quote_token}/${base_token}:`, error);
//                     clearInterval(interval); // Останавливаем интервал при ошибке
//                     parentPort?.postMessage('ОШИБКА ПОТОКА!!!'); // Отправляем сообщение о неудачном завершении задачи родительскому потоку
//                 }
//             }, 1000); // Интервал проверки цены (1000 мс = 1 секунда)
//         } else {
//             return { confirmed: false };
//         }
//     } catch (error) {
//         console.error(`Ошибка в главной функции ${quote_token}/${base_token}:`, error); // Выводим ошибку в случае её возникновения
//         parentPort?.postMessage('ОШИБКА ПОТОКА!!!'); // Отправляем сообщение о неудачном завершении задачи родительскому потоку
//     }
// };

// fetchPrice(); // Вызываем функцию для начала выполнения фоновой задачи
import { parentPort, workerData, threadId } from 'worker_threads'; // Импорт необходимых модулей для работы с worker threads
import Raydium from '../swap/raydium'; // Импорт класса для работы с Raydium
import { build_bundle, onBundleResult } from '../jito/build_bundle';
import { swap } from '../engine/engines';
import {LAMPORTS_PER_SOL} from '@solana/web3.js'

// Извлекаем необходимые данные из workerData
const { buy_token, sell_token, amount, slippage, jito_fees, rpc_https_url, id_user, base_token, quote_token, temp_price } = workerData as {
    buy_token: string,
    sell_token: string,
    amount: number,
    slippage: number,
    jito_fees: number,
    base_token: string;
    quote_token: string;
    rpc_https_url: string;
    id_user: string;
    temp_price: number;
};

// Получаем данные пользователя из переменных окружения
const users = JSON.parse(process.env.REACT_APP_USERS || '{}');
const user = users[id_user];

// Проверяем наличие пользователя и его кошелька
if (!user || !user.wallet) {
    console.error('Пользователь не найден или у пользователя отсутствует кошелек.');
    throw new Error('Пользователь не найден или у пользователя отсутствует кошелек.');
}

// Извлекаем кошелек пользователя
const wallet = user.wallet;

// Асинхронная функция для выполнения фоновой задачи
const fetchPrice = async () => {
    let transactionSent = false;  // Переменная для отслеживания состояния отправки транзакции

    try {
        const raydium = new Raydium(rpc_https_url, wallet);

        let price = await raydium.getPriceOfPool(base_token, quote_token); // Получение текущей цены пула
        // console.log(`Первые данные при запросе ${quote_token}/${base_token}: ${price}`); // Вывод в консоль текущей цены

        // ЕСЛИ МЫ ЖДЕМ ПОКА ЦЕНА ПОДНИМЕТЬСЯ 
        if (price < temp_price) {
            const interval = setInterval(async () => {
                if (transactionSent) { // Проверка состояния отправки транзакции
                    clearInterval(interval);
                    return;
                }

                try {
                    price = await raydium.getPriceOfPool(base_token, quote_token); // Обновляем цену
                    // console.log(`Текущая цена ${quote_token}/${base_token}: ${price}`); // Выводим текущую цену

                    if (price >= temp_price && price != 0 && !transactionSent) { // Дополнительная проверка перед отправкой
                        transactionSent = true; // Устанавливаем состояние отправки транзакции
                        clearInterval(interval); // Останавливаем интервал
                        // console.log(`Цена достигла ${temp_price} текущих монет ${quote_token}/${base_token}`);

                        let result = await swap(buy_token, sell_token, amount, slippage, jito_fees * LAMPORTS_PER_SOL, rpc_https_url, id_user);
                        let confTrans = await raydium.confirm(result.trans_hash[0]);

                        if (confTrans?.confirmed == false) {
                            // console.log(`ТРАНЗАКЦИЯ НЕ ПОДТВЕРДИЛАСЬ`);
                            let tempFees = 0.0001;

                            for (let i = 0; i < 20; i++) { // Повторяем 20 итераций
                                // console.log(`ИТЕРАЦИЯ НОМЕР ${i}`);
                                result = await swap(buy_token, sell_token, amount, slippage, (jito_fees + tempFees) * LAMPORTS_PER_SOL, rpc_https_url, id_user);
                                confTrans = await raydium.confirm(result.trans_hash[0]);
                                tempFees += 0.0001;

                                if (confTrans?.confirmed == true) {
                                    parentPort?.postMessage('Поток завершается');
                                    return { confirmed: true };
                                }
                                // console.log(`РЕЗУЛЬТАТ ТРАНЗАКЦИИ В ИТЕРАЦИИ ${i} = ${confTrans} commis = ${jito_fees + tempFees}`);
                            }
                        }
                        parentPort?.postMessage('Поток завершается');
                        return { confirmed: false };
                    }
                } catch (error) {
                    // Обработка ошибок при получении цены
                    // console.error(`Ошибка при выполнение в условие ${quote_token}/${base_token}:`, error);
                    clearInterval(interval); // Останавливаем интервал при ошибке
                    parentPort?.postMessage('ОШИБКА ПОТОКА!!!'); // Отправляем сообщение о неудачном завершении задачи родительскому потоку
                }
            }, 1500); // Интервал проверки цены (1000 мс = 1 секунда)

        } else if (price > temp_price) { // ЕСЛИ МЫ ЖДЕМ ПОКА ЦЕНА ОПУСТИТЬСЯ
            const interval = setInterval(async () => {
                if (transactionSent) { // Проверка состояния отправки транзакции
                    clearInterval(interval);
                    return;
                }

                try {
                    price = await raydium.getPriceOfPool(base_token, quote_token); // Обновляем цену
                    // console.log(`Текущая цена ${quote_token}/${base_token}: ${price}`); // Выводим текущую цену

                    if (price <= temp_price && price != 0 && !transactionSent) { // Дополнительная проверка перед отправкой
                        transactionSent = true; // Устанавливаем состояние отправки транзакции
                        clearInterval(interval); // Останавливаем интервал
                        // console.log(`Цена достигла ${temp_price} текущих монет ${quote_token}/${base_token}`);

                        let result = await swap(buy_token, sell_token, amount, slippage, jito_fees * LAMPORTS_PER_SOL, rpc_https_url, id_user);
                        let confTrans = await raydium.confirm(result.trans_hash[0]);

                        if (confTrans?.confirmed == false) {
                            // console.log(`ТРАНЗАКЦИЯ НЕ ПОДТВЕРДИЛАСЬ`);
                            let tempFees = 0.0001;

                            for (let i = 0; i < 20; i++) { // Повторяем 20 итераций
                                // console.log(`ИТЕРАЦИЯ НОМЕР ${i}`);
                                result = await swap(buy_token, sell_token, amount, slippage, (jito_fees + tempFees) * LAMPORTS_PER_SOL, rpc_https_url, id_user);
                                confTrans = await raydium.confirm(result.trans_hash[0]);
                                tempFees += 0.0001;

                                if (confTrans?.confirmed == true) {
                                    parentPort?.postMessage('Поток завершается');
                                    return { confirmed: true };
                                }
                                // console.log(`РЕЗУЛЬТАТ ТРАНЗАКЦИИ В ИТЕРАЦИИ ${i} = ${confTrans} commis = ${jito_fees + tempFees}`);
                            }
                        }
                        parentPort?.postMessage('Поток завершается');
                        return { confirmed: false };
                    }
                } catch (error) {
                    // Обработка ошибок при получении цены
                    // console.error(`Ошибка при выполнение в условие ${quote_token}/${base_token}:`, error);
                    clearInterval(interval); // Останавливаем интервал при ошибке
                    parentPort?.postMessage('ОШИБКА ПОТОКА!!!'); // Отправляем сообщение о неудачном завершении задачи родительскому потоку
                }
            }, 1500); // Интервал проверки цены (1000 мс = 1 секунда)
        } else {
            return { confirmed: false };
        }
    } catch (error) {
        // console.error(`Ошибка в главной функции ${quote_token}/${base_token}:`, error); // Выводим ошибку в случае её возникновения
        parentPort?.postMessage('ОШИБКА ПОТОКА!!!'); // Отправляем сообщение о неудачном завершении задачи родительскому потоку
    }
};

fetchPrice(); // Вызываем функцию для начала выполнения фоновой задачи
