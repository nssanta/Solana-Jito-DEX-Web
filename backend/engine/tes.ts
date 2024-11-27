import { Connection, PublicKey, Keypair } from "@solana/web3.js";

import {
    TxVersion, Token, Currency,
    TOKEN_PROGRAM_ID,
    SOL,
} from "@raydium-io/raydium-sdk";

import * as bs58 from 'bs58';

import { swap } from '../swap/r2'

import { build_bundle, onBundleResult } from '../jito/build_bundle';

import {
    LAMPORTS_PER_SOL
} from '@solana/web3.js';

/**
 * Swap tokens using Raydium DEX with Jito bundles
 * @param token_1 first token
 * @param token_2 second token
 * @param amount amount to swap (TOKEN/SOL/USDC/USDT)
 * @useVersionedTransaction use versioned transaction or legacy
 */
export async function swappp(
    // buy_token: string, // token to acquire
    // sell_token: string, // token to sell
    // amount: number, // swap amount
    // slippage: number, // slippage percentage
    // wallet: string, // wallet address for payment

) {
    const swap_wallet_private_key = process.env.SWAP_WALLET_PRIVATE_KEY || "";
    if (!swap_wallet_private_key) {
        throw new Error("SWAP_WALLET_PRIVATE_KEY not set in environment");
    }

    const wallet = Keypair.fromSecretKey(new Uint8Array(bs58.decode(swap_wallet_private_key)));
    const jitoFees = 5000
    const buyTX = await swap()

    // Create and send Jito bundle
    const bundle = await build_bundle(2, buyTX, swap_wallet_private_key, swap_wallet_private_key, jitoFees)

    // Log bundle send time
    const currentTime = new Date();
    console.log(`Bundle sent at: ${currentTime.toISOString()}`);

    return bundle

}
swappp()