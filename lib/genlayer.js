// lib/genlayer.js
import { createClient, createAccount } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  || '0x6cb21B2246902D912838D7c7afaE8e0A0d7f2a34';

// ── READ (server + browser safe) ──
function getReadClient() {
  const account = createAccount(); // random, only for reads
  return createClient({
    chain: testnetBradbury,
    account,
  });
}

// ── WRITE (browser only — needs MetaMask) ──
export function getWriteClient(walletAddress) {
  return createClient({
    chain: testnetBradbury,
    account: walletAddress,
  });
}

export async function readContract(method, args = []) {
  const client = getReadClient();
  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: method,
      args,
    });
    if (typeof result === 'string') {
      try { return JSON.parse(result); } catch { return result; }
    }
    return result;
  } catch (error) {
    console.error(`readContract [${method}] error:`, error.message);
    throw error;
  }
}

export async function getAllWatches() {
  try {
    const result = await readContract('get_watches', []);
    return Array.isArray(result) ? result : [];
  } catch { return []; }
}

export async function getFeed() {
  try {
    const result = await readContract('get_feed', []);
    return Array.isArray(result) ? result : [];
  } catch { return []; }
}

export async function getTrigger(triggerId) {
  try {
    const result = await readContract('get_trigger', [triggerId]);
    return result || null;
  } catch { return null; }
}

export const CHAIN_CONFIG = {
  chainId: 4221,
  rpcUrl: 'https://rpc-bradbury.genlayer.com',
  contractAddress: CONTRACT_ADDRESS,
  explorerUrl: 'https://explorer.testnet-chain.genlayer.com',
};