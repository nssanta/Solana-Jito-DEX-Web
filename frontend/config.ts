import { Connection, PublicKey, Keypair } from "@solana/web3.js";

import {
    TxVersion,
} from "@raydium-io/raydium-sdk";

import * as bs58 from 'bs58';

// List of Jito block engines
export let jitoList: string[] =
    [
        "mainnet.block-engine.jito.wtf",
        "amsterdam.mainnet.block-engine.jito.wtf",
        "frankfurt.mainnet.block-engine.jito.wtf",
        "ny.mainnet.block-engine.jito.wtf",
        "tokyo.mainnet.block-engine.jito.wtf",
    ];

// Jito block engine URL
export const blockEngineUrl = 'mainnet.block-engine.jito.wtf';

// Jito authentication private key (load from env)
const jito_auth_private_key = process.env.JITO_AUTH_PRIVATE_KEY || "";

// Wallet for paying Jito fees (load from env)
const wallet_2_pay_jito_fees = process.env.JITO_FEE_WALLET_PRIVATE_KEY || "";

// RPC node URL (load from env)
export const rpc_https_url = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";

// Jito auth keypair
export const jito_auth_keypair = jito_auth_private_key
    ? Keypair.fromSecretKey(new Uint8Array(bs58.decode(jito_auth_private_key)))
    : undefined;

// Connection object
export const connection = new Connection(rpc_https_url, "confirmed");
export const lookupTableCache = {}
export const makeTxVersion = TxVersion.V0
export const addLookupTableInfo = undefined

