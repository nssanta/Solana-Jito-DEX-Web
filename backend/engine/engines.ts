import Raydium from "../swap/raydium";
// import{
//     rpc_https_url, // url ноды
    
// }from '../config'

import { build_bundle, onBundleResult } from '../jito/build_bundle';

import { 
    LAMPORTS_PER_SOL 
} from '@solana/web3.js';

/**
 * Функцкия для обмена токенов
 * @param token_1 первый токен
 * @param token_2 второй токен
 * @param amount кол-во на покупку (TOKEN/SOL/USDC/USDT)
 * @useVersionedTransaction версионая транзакция или нет
 */
export async function swap(
    buy_token: string, // токен который берем(приобретаем)
    sell_token: string, // токен который отдаем(продаем)
    amount: number, // кол-во на обмен
    slippage: number, // процент проскальзывания
    //wallet: string, // кошелек для оплаты
    jitoFees: number, // комиссия jito
    rpc_https_url: string, // url rpc адресса
    authUser:string,
    commision:number= 100000, // кол-во лампортов на комиссию транзакции
    useVersionedTransaction: boolean=false // версионая транзакция или нет
) {
    //____ Код который получает данные пользователя, исходя из авторизации.
    // Парсим переменные окружения с пользователями в объект
    const users = JSON.parse(process.env.REACT_APP_USERS || '{}');
    // Получаем данные пользователя по сохранённому паролю
    const user = users[authUser];
    // Проверяем наличие пользователя и кошелька
    if (!user || !user.wallet) {
        console.error('Пользователь не найден или у пользователя отсутствует кошелек.');
        return;
    }
    // Получаем кошел пользователя
    const wallet = user.wallet;
    // console.log('WALLET : ',wallet)
    
    // Иницилизация класса Raydium, для работы с DEX
    const raydium = new Raydium(rpc_https_url, wallet);

    // Выводим время в консоль.
    const currentTime1 = new Date();
    console.log(`Время начала отправки: ${currentTime1.toISOString()}`);

    // Получаем ключи пула.
    const poolInfo = await raydium.findRaydiumPoolInfo(buy_token, sell_token) || null;
    // Если не удалось получить ключи
    if (!poolInfo) {
        throw new Error("Не удалось найти информацию о пуле");
      }
    // Формируем транзакцию на покупку.
    const buyTX =  await raydium.prepareSwapTransactionData(
        buy_token,
        amount,
        poolInfo,
        commision,
        useVersionedTransaction,
        "in",                       // Фиксированное количество отправляемых токенов
        slippage,
    )

    // Создаем Бундле и отправляем его.
    const bundle = await build_bundle(2, buyTX, wallet, wallet, jitoFees )

    // Выводим время в консоль.
    const currentTime = new Date();
    console.log(`Время отправки bundle: ${currentTime.toISOString()}`);

    return bundle

}




// export async function swapLimit(
//     buy_token: string, // токен который берем(приобретаем)
//     sell_token: string, // токен который отдаем(продаем)
//     amount: number, // кол-во на обмен
//     slippage: number, // процент проскальзывания
//     jitoFees: number, // комиссия jito
//     rpc_https_url: string, // url rpc адресса
//     authUser:string,
//     userPrice:number,
//     commision:number= 100000, // кол-во лампортов на комиссию транзакции
//     useVersionedTransaction: boolean=false // версионая транзакция или нет
// ) {

//     //____ Код который получает данные пользователя, исходя из авторизации.
//     // Парсим переменные окружения с пользователями в объект
//     const users = JSON.parse(process.env.REACT_APP_USERS || '{}');
//     // Получаем данные пользователя по сохранённому паролю
//     const user = users[authUser];
//     // Проверяем наличие пользователя и кошелька
//     if (!user || !user.wallet) {
//         console.error('Пользователь не найден или у пользователя отсутствует кошелек.');
//         return;
//     }
//     // Получаем кошел пользователя
//     const wallet = user.wallet;
    
//     // Иницилизация класса Raydium, для работы с DEX
//     const raydium = new Raydium(rpc_https_url, wallet);

//     const monitoringPrice = await raydium.


// }



// /**
//  * Функцкия для покупки токенов
//  * @param token_1 первый токен
//  * @param token_2 второй токен
//  * @param amount кол-во на покупку (TOKEN/SOL/USDC/USDT)
//  * @useVersionedTransaction версионая транзакция или нет
//  */
// export async function buy_tokens(
//     buy_token:string, // токен который берем(приобретаем)
//     sell_token:string, // токен который отдаем(продаем)
//     amount:number, // кол-во на обмен
//     slippage:number, // процент проскальзывания
//     wallet:string, // кошелек для оплаты
//     commision:number= 100000, // кол-во лампортов на комиссию транзакции
//     useVersionedTransaction:boolean=false // версионая транзакция или нет
// ) {
    
//     // Иницилизация класса Raydium, для работы с DEX
//     const raydium = new Raydium(rpc_https_url, wallet);

//     // Выводим время в консоль.
//     const currentTime1 = new Date();
//     console.log(`Время начала отправки: ${currentTime1.toISOString()}`);

//     // Получаем ключи пула.
//     const poolInfo = await raydium.findRaydiumPoolInfo(buy_token, sell_token) || null;
//     // Если не удалось получить ключи
//     if (!poolInfo) {
//         throw new Error("Не удалось найти информацию о пуле");
//       }
//     // Формируем транзакцию на покупку.
//     const buyTX =  await raydium.prepareSwapTransactionData(
//         buy_token,
//         amount,
//         poolInfo,
//         commision,
//         useVersionedTransaction,
//         "in",                       // Фиксированное количество отправляемых токенов
//         slippage,
//     )

//     // Создаем Бундле и отправляем его.
//     const bundle = await build_bundle(2, buyTX)

//     // Выводим время в консоль.
//     const currentTime = new Date();
//     console.log(`Время отправки bundle: ${currentTime.toISOString()}`);

//     return bundle

// }


// export async function sell_tokens(
//     sell_token:string, // токен который отдаем(продаем)
//     buy_token:string, // токен который берем(приобретаем)
//     amount:number, // кол-во на обмен
//     slippage:number, // процент проскальзывания
//     wallet:string, // кошелек для оплаты
//     commision:number= 100000, // кол-во лампортов на комиссию транзакции
//     useVersionedTransaction:boolean=false // версионая транзакция или нет
// ) {
    
//     // Иницилизация класса Raydium, для работы с DEX
//     const raydium = new Raydium(rpc_https_url, wallet);

//     // Выводим время в консоль.
//     const currentTime1 = new Date();
//     console.log(`Время начала отправки: ${currentTime1.toISOString()}`);

//     // Получаем ключи пула.
//     const poolInfo = await raydium.findRaydiumPoolInfo(buy_token, sell_token) || null;
//     // Если не удалось получить ключи
//     if (!poolInfo) {
//         throw new Error("Не удалось найти информацию о пуле");
//       }
//     // Формируем транзакцию на покупку.
//     const buyTX =  await raydium.prepareSwapTransactionData(
//         sell_token,
//         amount,
//         poolInfo,
//         commision,
//         useVersionedTransaction,
//         "in",                       // Фиксированное количество отправляемых токенов
//         slippage,
//     )

//     // Создаем Бундле и отправляем его.
//     const bundle = await build_bundle(2, buyTX)

//     // Выводим время в консоль.
//     const currentTime = new Date();
//     console.log(`Время отправки bundle: ${currentTime.toISOString()}`);

//     return bundle

// }