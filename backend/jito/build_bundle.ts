import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import { searcherClient } from 'jito-ts/dist/sdk/block-engine/searcher';
import { SearcherClient } from "jito-ts/dist/sdk/block-engine/searcher";
import { Bundle } from "jito-ts/dist/sdk/block-engine/types";
import { isError } from "jito-ts/dist/sdk/block-engine/utils";
import { ClientReadableStream } from "@grpc/grpc-js";
import { buildSimpleTransaction } from "@raydium-io/raydium-sdk";

import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

import {
  jito_auth_keypair,
  //LP_wallet_keypair,
  // swap_wallet_keypair,
  // wallet_2_pay_jito_fees_keypair,
  connection,
  addLookupTableInfo,
  makeTxVersion,
  blockEngineUrl,
  // feesJito,
} from "../config";

import { BundleResult } from "jito-ts/dist/gen/block-engine/bundle";


// Публичный ключ, программы мемо на Солане.
const MEMO_PROGRAM_ID = "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo";

/**
* Функция создает и отправляет пакет
* @param search джито клиент
* @param bundleTransactionLimit лимит транзакций в яшике
* @param swap_ix инструкции транзакции
* @param conn клиекнт узла рпк
* @returns 
*/
export async function build_bundle(
  bundleTransactionLimit: number, // лимит транзакций на пакет
  swap_ix: any[], // инструкция для транзакции
  swap_wallet_keypair_key: string, // кошелек для обмена
  wallet_2_pay_jito_fees_keypair_key: string, // кошелек для оплаты комиссии jito
  feesJito: number, // коммисия jito
  search: SearcherClient= searcherClient(blockEngineUrl, jito_auth_keypair),// клиент джито
) {

  // Делаем из строки ключи
  const swap_wallet_keypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(swap_wallet_keypair_key)))
  const wallet_2_pay_jito_fees_keypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(wallet_2_pay_jito_fees_keypair_key)))

  // Получаем список чаевых, и выбираем первый. Создаем ключ, для чаевых.
  const _tipAccount = (await search.getTipAccounts())[0];
  //console.log("tip account:", _tipAccount);
  const tipAccount = new PublicKey(_tipAccount);

  // Создаем ящик бундле
  const bund = new Bundle([], bundleTransactionLimit);
  // Получаем последний хешблок
  const resp = await connection.getLatestBlockhash("processed");
  // Создаем транзакцию
  const willSendTx1 = await buildSimpleTransaction({
    connection, // объект соединения с сетью
    makeTxVersion, // версия транзакции
    payer: swap_wallet_keypair.publicKey, // кошелек для оплаты транзакции 
    innerTransactions: swap_ix, // массив инструкций
    addLookupTableInfo: addLookupTableInfo, // таблица адрессов.
  });
  // Проверяем тип транзакции и подписываем если версионая.
  if (willSendTx1[0] instanceof VersionedTransaction) {
    willSendTx1[0].sign([swap_wallet_keypair]);
    // txids.push(await connection.sendTransaction(iTx, options));
              bund.addTransactions(willSendTx1[0]);
  }
  
  // Добавляем чаевые в блок, с ключ оплаты чаевых.
  let maybeBundle = bund.addTipTx(
    wallet_2_pay_jito_fees_keypair,
    feesJito,
    tipAccount,
    resp.blockhash
  );
  // Проверяем чтобы не было ошибки в чаевых
  if (isError(maybeBundle)) {
    throw maybeBundle;
  }
  console.log();
  
  // Отправляем ящик бундле
  let response_bund = "";
  try {
    response_bund = await search.sendBundle(maybeBundle);
    
  } catch (e) {
    response_bund= `error sending bundle:${e}` ;
  }

  // Получаем хещ транзакции свопа.
  const transactionSignature = willSendTx1[0].signatures;
  const transactionHashes = transactionSignature.map(signature => {
    const uint8ArraySignature = signature as Uint8Array;
    return bs58.encode(uint8ArraySignature);
  });

  // Формируем результат возврата.
  const output:any={
    "bund_hash":response_bund,
    "trans_hash":transactionHashes
  }
  //console.log(output);
  // Возвращаем хеши.
  return output;
  
}

/**
 * Функция для проверки результата выполнения пакета.
 * @param client клиент
 * @returns 
 */
export const onBundleResult = (client: SearcherClient): Promise<number> => {
  // Хранит число принятых пакетов
  let first = 0;
  // Булевая переменная на проверку было ли выполнено обещание
  let isResolved = false; 
  
  // Промайс выполняется если: 1: Пакет был принят. 2: Если прошло 30 секунд.(отмена значит)
  return new Promise((resolve) => {
    // Set a timeout to reject the promise if no bundle is accepted within 5 seconds
    setTimeout(() => {
      resolve(first);
      isResolved = true
    }, 30000);

    // Обрабатываем рузультат
    client.onBundleResult(

      (result) => {
        // Проверяем был ли выполнен промайс
        if (isResolved) return first;
        
        const bundleId = result.bundleId; // извлекаем ид пакета
        const isAccepted = result.accepted; // был ли пакет принят
        const isRejected = result.rejected; // был ли пакет откланен
        
        // Повторная проверка был ли выполнин промайс
        if (isResolved == false){
          // Если пакет был принят
          if (isAccepted) {
            console.log("bundle accepted, ID:",
              result.bundleId," Slot: ",
              result.accepted?.slot // Используем опциональную цепочку для безопасного доступа к свойству slot
            );
            first +=1; // увеличиваем счетчик принятия пакетов
            isResolved = true; // предотвращаем дальнейшую обработку
            resolve(first); // разрешения промайс с текущим значением
          }
          // если пакет был отклонен
          if (isRejected) {
            console.log("bundle is Rejected:", result);
            // Do not resolve or reject the promise here
          }
        }
      },
      // в случае ошибки
      (e) => {
        console.error(e);
      }
    );
  });
};




export const buildMemoTransaction = (
  keypair: Keypair,
  recentBlockhash: string,
  message: string
): VersionedTransaction => {
  const ix = new TransactionInstruction({
    keys: [
      {
        pubkey: keypair.publicKey,
        isSigner: true,
        isWritable: true,
      },
    ],
    programId: new PublicKey(MEMO_PROGRAM_ID),
    data: Buffer.from(message),
  });

  const instructions = [ix];

  const messageV0 = new TransactionMessage({
    payerKey: keypair.publicKey,
    recentBlockhash: recentBlockhash,
    instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(messageV0);

  tx.sign([keypair]);

  return tx;
};