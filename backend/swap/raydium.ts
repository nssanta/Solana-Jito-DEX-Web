import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  VersionedTransaction,
  TransactionMessage,
  GetProgramAccountsResponse,
  BlockhashWithExpiryBlockHeight,
} from '@solana/web3.js'

import {
  Liquidity,
  LiquidityPoolKeys,
  jsonInfo2PoolKeys,
  LiquidityPoolJsonInfo,
  TokenAccount,
  Token,
  TokenAmount,
  TOKEN_PROGRAM_ID,
  Percent,
  SPL_ACCOUNT_LAYOUT,
  LIQUIDITY_STATE_LAYOUT_V4,
  MARKET_STATE_LAYOUT_V3,
  Market,
} from '@raydium-io/raydium-sdk'

import { Wallet } from '@project-serum/anchor'
import base58 from 'bs58'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'

class Raydium {
  // Идентификатор 4-ой версии программы.
  static RAYDIUM_V4_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
  // Переменная для создания подключения к узлу.
  connection: Connection
  wallet : Wallet

  constructor(RPC_URL: string, WALLET_PRIVATE_KEY : string) {

    this.connection = new Connection(RPC_URL, { commitment: 'confirmed' })
    this.wallet = new Wallet(Keypair.fromSecretKey(base58.decode(WALLET_PRIVATE_KEY)))
  }

  /**
   * Функция получает данные , программы связаные с передаными токенами
   * @param baseMint 
   * @param quoteMint 
   * @returns 
   */
  private async _getProgramAccounts(baseMint: string, quoteMint: string): Promise<GetProgramAccountsResponse> {
    // Макет для декодирования данных
    const layout = LIQUIDITY_STATE_LAYOUT_V4
    // Получаем все уч.записи программы связаные с нашим токеном.
    return this.connection.getProgramAccounts(new PublicKey(Raydium.RAYDIUM_V4_PROGRAM_ID), {
      filters: [
        { dataSize: layout.span },
        {
          memcmp: {
            offset: layout.offsetOf('baseMint'),
            bytes: new PublicKey(baseMint).toBase58(),
          },
        },
        {
          memcmp: {
            offset: layout.offsetOf('quoteMint'),
            bytes: new PublicKey(quoteMint).toBase58(),
          },
        },
      ],
    })
  }

  /**
   * Получаем данные, пулов монет.
   * @param baseMint 
   * @param quoteMint 
   * @returns 
   */
  async getProgramAccounts(baseMint: string, quoteMint: string) {
    // Делаем два запроса одновременно, для обоих монет в обе стороны.
    const response = await Promise.all([
      this._getProgramAccounts(baseMint, quoteMint),
      this._getProgramAccounts(quoteMint, baseMint),
    ])

    // Фильтруем результат, и возвращаем данные пулов монет
    return response.filter((r) => r.length > 0)[0] || []
  }

   /**
    * Функция принимает ключи пула монет, и возвращает нужные ключи для обмена.
    * @param baseMint 
    * @param quoteMint 
    * @returns 
    */
   async findRaydiumPoolInfo(baseMint: string, quoteMint: string): Promise<LiquidityPoolKeys | undefined> {
    // Объявлем ид программы
    const RAYDIUM_V4_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'
    // Переменная хранящая макет
    const layout = LIQUIDITY_STATE_LAYOUT_V4
    // Загружаем данные аккаунтов, которые переданы как параметры.
    const programData = await this.getProgramAccounts(baseMint, quoteMint)
    // Формируем данные, и собираем их в один массив.
    const collectedPoolResults = programData
      .map((info) => ({
        id: new PublicKey(info.pubkey),
        version: 4,
        programId: new PublicKey(RAYDIUM_V4_PROGRAM_ID),
        ...layout.decode(info.account.data),
      }))
      .flat()
    // Берем первый аргумент хранящий данные из массива.
    const pool = collectedPoolResults[0]
    // Если информации нету , возвращаем undefined
    if (!pool) return undefined
    // Запрашиваем информацию о пуле(рынке) через id пула, получаем и декодируем ее.
    const market = await this.connection.getAccountInfo(pool.marketId).then((item) => {
        if (item) {
          return {
            programId: item.owner,
            ...MARKET_STATE_LAYOUT_V3.decode(item.data),
          };
        } else {
          throw new Error('Account information could not be retrieved');
        }
      });
    // Получаем ключ авторизации, для работы с пулом (ликвидностью). Для сделок
    const authority = Liquidity.getAssociatedAuthority({
      programId: new PublicKey(RAYDIUM_V4_PROGRAM_ID),
    }).publicKey
    // Ид программы для рынка
    const marketProgramId = market.programId
    // Собираем и создаем всю информацию, о рынке. И возвращаем ее, для осуществления сделок.
    const poolKeys = {
      id: pool.id,
      baseMint: pool.baseMint,
      quoteMint: pool.quoteMint,
      lpMint: pool.lpMint,
      baseDecimals: Number.parseInt(pool.baseDecimal.toString()),
      quoteDecimals: Number.parseInt(pool.quoteDecimal.toString()),
      lpDecimals: Number.parseInt(pool.baseDecimal.toString()),
      version: pool.version,
      programId: pool.programId,
      openOrders: pool.openOrders,
      targetOrders: pool.targetOrders,
      baseVault: pool.baseVault,
      quoteVault: pool.quoteVault,
      marketVersion: 3,
      authority: authority,
      marketProgramId,
      marketId: market.ownAddress,
      marketAuthority: Market.getAssociatedAuthority({
        programId: marketProgramId,
        marketId: market.ownAddress,
      }).publicKey,
      marketBaseVault: market.baseVault,
      marketQuoteVault: market.quoteVault,
      marketBids: market.bids,
      marketAsks: market.asks,
      marketEventQueue: market.eventQueue,
      withdrawQueue: pool.withdrawQueue,
      lpVault: pool.lpVault,
      lookupTableAccount: PublicKey.default,
    } as LiquidityPoolKeys

    // Возвращаем ключи в форме объекта << LiquidityPoolKeys >>
    // console.log(poolKeys)
    return poolKeys
}
/**
 * Функция подгатавливает транзакцию для обмена.
 * @param toToken токен который мы получим
 * @param amount кол-во которое мы хотим обменять
 * @param poolKeys ключи пула для обмена
 * @param maxLamports это коммиссия для свопа
 * @param useVersionedTransaction версия транзакции
 * @param fixedSide Фиксированная сторона обмена
 * @param slippage проскальзывание
 * @returns 
 */
async prepareSwapTransactionData(
  toToken: string,
  amount: number,
  poolKeys: LiquidityPoolKeys,
  maxLamports: number = 100000,
  useVersionedTransaction = true,
  fixedSide: 'in' | 'out' = 'in',
  slippage: number = 5
) {
  // Определяем направление свопа, котируемый токен или базовый.
  const directionIn = poolKeys.quoteMint.toString() == toToken
  // Функция вычисляет минимальное выходное кол-во токена и входное.
  const { minAmountOut, amountIn } = await this.calcAmountOut(poolKeys, amount, slippage, directionIn)
  // Получаем счета для токенов
  const userTokenAccounts = await this.getOwnerTokenAccounts()
  // Создаем инструкцию для обмена
  const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
      connection: this.connection,
      makeTxVersion: useVersionedTransaction ? 0 : 1,
      poolKeys: {
        ...poolKeys,
      },
      userKeys: {
        tokenAccounts: userTokenAccounts,
        owner: this.wallet.publicKey,
      },
      amountIn: amountIn,
      amountOut: minAmountOut,
      fixedSide: fixedSide,
      config: {
        bypassAssociatedCheck: false,
      },
      computeBudgetConfig: {
        microLamports: maxLamports,
      },
    })
    
    // Или преобразуйте объект в строку JSON
   // console.log(`Inner = ${JSON.stringify(innerTransactions)} `);

  return innerTransactions
}

/**
 * Получаем счета токенов аккаунта.
 * @returns 
 */
async getOwnerTokenAccounts() {
  // Запрашиваем все данные с кошелька, фильтруя их по программе создания токенов.
  const walletTokenAccount = await this.connection.getTokenAccountsByOwner(this.wallet.publicKey, {
    programId: TOKEN_PROGRAM_ID,
  })
  // Возврааем отфильтрованный объект по токенам.
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }))
}

/**
 * вычисляет количество токенов, которое пользователь получит в обмен на заданное количество входных токенов, 
 * учитывая проскальзывание и направление обмена.
 * @param poolKeys ключи пула
 * @param rawAmountIn кол-во входных токенов
 * @param slippage допустимый уровень проскальзывония 
 * @param swapInDirection направление обмена, true - если токен базовый
 * @returns 
 */
async calcAmountOut(
    poolKeys: LiquidityPoolKeys,
    rawAmountIn: number,
    slippage: number = 5,
    swapInDirection: boolean
  ) {
    // Получаем информацию о ликвидности пула.
    const poolInfo = await Liquidity.fetchInfo({ connection: this.connection, poolKeys })
    // Получаем данные монет и их точность
    let currencyInMint = poolKeys.baseMint
    let currencyInDecimals = poolInfo.baseDecimals
    let currencyOutMint = poolKeys.quoteMint
    let currencyOutDecimals = poolInfo.quoteDecimals
    // Проверяем направление, и если да, то меняем направление.
    if (!swapInDirection) {
      currencyInMint = poolKeys.quoteMint
      currencyInDecimals = poolInfo.quoteDecimals
      currencyOutMint = poolKeys.baseMint
      currencyOutDecimals = poolInfo.baseDecimals
    }
    // Создаем объект , на основе наших данных.
    const currencyIn = new Token(TOKEN_PROGRAM_ID, currencyInMint, currencyInDecimals)
    const amountIn = new TokenAmount(currencyIn, rawAmountIn.toFixed(currencyInDecimals), false)
    const currencyOut = new Token(TOKEN_PROGRAM_ID, currencyOutMint, currencyOutDecimals)
    const slippageX = new Percent(slippage, 100) // 5% slippage
    // Вычисляем данные
    const { amountOut, minAmountOut, currentPrice, executionPrice, priceImpact, fee } = Liquidity.computeAmountOut({
      poolKeys,
      poolInfo,
      amountIn,
      currencyOut,
      slippage: slippageX,
    })
    // Возвращаем данные.
    return {
      amountIn,
      amountOut,
      minAmountOut,
      currentPrice,
      executionPrice,
      priceImpact,
      fee,
    }
  }
/**
 * Функция получает ключи пула, и возвращает Vault аккаунты, которы содержат кол-во токенов в пуле.
 * @param baseMint Базовая монета
 * @param quoteMint котируемая монета
 * @returns 
 */
async getVaultKeys(baseMint: string, quoteMint: string) {
  // Объявлем ид программы
  const RAYDIUM_V4_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'
  // Переменная хранящая макет
  const layout = LIQUIDITY_STATE_LAYOUT_V4

  try{
    // Загружаем данные аккаунтов, которые переданы как параметры.
    const programData = await this.getProgramAccounts(baseMint, quoteMint)
    // Формируем данные, и собираем их в один массив.
    const collectedPoolResults = programData
      .map((info) => ({
        id: new PublicKey(info.pubkey),
        version: 4,
        programId: new PublicKey(RAYDIUM_V4_PROGRAM_ID),
        ...layout.decode(info.account.data),
      }))
      .flat()
    // Берем первый аргумент хранящий данные из массива.
    const pool = collectedPoolResults[0]
    // Получаем нужные ключи и возвращаем их
    const baseVault = pool.baseVault
    const  quoteVault = pool.quoteVault
    const output = {
      "baseVault":baseVault,
      "quoteVault":quoteVault,
    }

    return output

  }catch(error){
    // Если ошибка вернем null
    const output = {
      "baseVault":null,
      "quoteVault":null,
    }

    return output
  }

}
/**
 * Функция для получения цены токена
 * @param baseVault базовая монета
 * @param quoteVault котируемая монета
 */
async getPriceOfPool(base: string, quote: string){
  try {
    // Получаем ключи хранилищь.
    const keysPool = await this.getVaultKeys(base, quote)

    if (keysPool.baseVault != null){
      // Получаем баланс токенов в хранилище.
      const [baseBalance, quoteBalance] = await Promise.all([
      this.connection.getTokenAccountBalance(keysPool.baseVault),
      this.connection.getTokenAccountBalance(keysPool.quoteVault),
    ]);

      if (baseBalance?.value?.uiAmount != null && quoteBalance?.value?.uiAmount != null){
        const pricePool =  quoteBalance.value.uiAmount / baseBalance.value.uiAmount 
        //console.log("Цена токена :", pricePool)
        return pricePool

      }else{
        return 0
      }
    
    }else{
      return 0
    }

  } catch (error) {
    console.error("Ошибка при получении балансов:", error);
    return 0
  }
}

async confirm(signature: string) {
  try {
    const checkInterval = 1000; // Интервал проверки в миллисекундах (1 секунда)
    const maxChecks = 15; // Максимальное количество проверок
    
    for (let i = 0; i < maxChecks; i++) {
      // Запрашиваем транзакцию
      const confirmation = await this.connection.getParsedTransaction(
        signature,
        {
          commitment: 'finalized',
          maxSupportedTransactionVersion: 0,
        }
      );
      // Проверяем есть ли ошибка, если нет, возвращаем подтверждение
      if (confirmation != null){
        if (confirmation?.meta?.err == null) {
         // console.log('Transaction confirmed:', confirmation);
          return { confirmed: true, };//confirmation };
        }
      }
      // Если достигли максимального количества проверок, возвращаем ошибку
      if (i === maxChecks - 1) {
        console.log('Timeout reached, transaction not confirmed.');
        return { confirmed: false, error: 'Транзакция не подтверждена из-за времени ожидания.' };
      }
      // Ждем 1 секунду перед следующей проверкой
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
  } catch (error) {
    console.error('Error confirming transaction:', error);
    return { confirmed: false, error}
    //throw new Error('Failed to confirm transaction');
  }
}


}

export default Raydium