import { 
    Connection,   
    PublicKey,
    GetProgramAccountsFilter,
    Keypair,
    LAMPORTS_PER_SOL,
  
  } from "@solana/web3.js";

import { Wallet } from '@project-serum/anchor'

import base58 from 'bs58'

import { TOKEN_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import {

    SPL_ACCOUNT_LAYOUT,
    TokenAccount,
    findProgramAddress,
  } from '@raydium-io/raydium-sdk';


  export async function getTokenAccountBalance(connection: Connection, wallet: string, mint_token: string) {
    const filters:GetProgramAccountsFilter[] = [
        {
          dataSize: 165,    //size of account (bytes)
        },
        {
          memcmp: {
            offset: 32,     //location of our query in the account (bytes)
            bytes: wallet,  //our search criteria, a base58 encoded string
          },            
        },
        //Add this search parameter
        {
            memcmp: {
            offset: 0, //number of bytes
            bytes: mint_token, //base58 encoded string
            },
        }];
    const accounts = await connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID,
      {filters: filters}
    );
  
    for (const account of accounts) {
      const parsedAccountInfo:any = account.account.data;
      const mintAddress:string = parsedAccountInfo["parsed"]["info"]["mint"];
      const tokenBalance: number = parseInt(parsedAccountInfo["parsed"]["info"]["tokenAmount"]["amount"]);
      const uiAmount: number = (parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"]);
      const decimal: number = parseInt(parsedAccountInfo["parsed"]["info"]["tokenAmount"]["decimals"]);

      
      // console.log(`Account: ${account.pubkey.toString()} - Mint: ${mintAddress} - Balance: ${tokenBalance}`);

      // Формируем данные которые будем возвращать.
      const output = {
        "uiBalance": uiAmount,
        "decimal":decimal,
        "balance":tokenBalance
      }

      if (tokenBalance) {
        return output;
      }

    }
  }

export function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
      throw new Error(msg)
    }
  }
  

  export async function getWalletTokenAccount(connection: Connection, wallet: PublicKey): Promise<TokenAccount[]> {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
      programId: TOKEN_PROGRAM_ID,
    });
    return walletTokenAccount.value.map((i) => ({
      pubkey: i.pubkey,
      programId: i.account.owner,
      accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
  }  


  export async function getWalletTokenAccountMint(connection: Connection, wallet: PublicKey, mint: PublicKey): Promise<TokenAccount[]> {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
      mint: mint,
    });
    return walletTokenAccount.value.map((i) => ({
      pubkey: i.pubkey,
      programId: i.account.owner,
      accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
  }  
  

  export function getATAAddress(programId: PublicKey, owner: PublicKey, mint: PublicKey) {
    const { publicKey, nonce } = findProgramAddress(
      [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
      new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
    );
    return { publicKey, nonce };
  }

  

export const getUserCoinBalance = async(conn:string, tokenAdr:string, userID:string )=>{
  const connection = new Connection(conn);
  const mintAddress = new PublicKey(tokenAdr); // Замените на адрес вашего токена

  /* Получаем публичный адресс на основе ид по секретному ключю. */
  // Парсим переменные окружения с пользователями в объект
  const users = JSON.parse(process.env.REACT_APP_USERS || '{}');
  // Получаем данные пользователя по сохранённому паролю
  const user = users[userID];
  // Проверяем наличие пользователя и кошелька
  if (!user || !user.wallet) {
      console.error('Пользователь не найден или у пользователя отсутствует кошелек.');
      return;
  }
  // Получаем кошел пользователя
  const wallet = user.wallet;
  const walletAddress = new Wallet(Keypair.fromSecretKey(base58.decode(wallet)))
  const walletPub = walletAddress.publicKey

  if(tokenAdr == 'So11111111111111111111111111111111111111112'){
    const solBalance = await connection.getBalance(walletPub)
    //console.log(solBalance)
    const output = {
      "balance":solBalance,
      "uiBalance": solBalance / LAMPORTS_PER_SOL,
      "decimal":9, 
    }
    return output
  }

  try {
      const balance = await getTokenAccountBalance(connection, walletPub.toBase58(), mintAddress.toBase58());
      // Если нету монеты
      if (balance?.balance === undefined || balance.balance === 0) {
        const output = {
          "balance":0,
          "uiBalance": 0 ,
          "decimal":balance?.decimal, 
        }
        return output
      }
      return balance
  } catch (error) {
      return 0
  }
}



