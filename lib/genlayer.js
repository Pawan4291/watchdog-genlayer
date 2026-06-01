import { createClient, createAccount } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

function getReadClient() {
  const account = createAccount();
  return createClient({ chain: testnetBradbury, account });
}

export async function readContract(method, args = []) {
  const client = getReadClient();
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: method,
    args,
  });
  if (typeof result === 'string') {
    try { return JSON.parse(result); } catch { return result; }
  }
  return result;
}

export async function getAllWatches() {
  try {
    const result = await readContract('get_all_watches', []);
    if (Array.isArray(result)) return result;
    if (typeof result === 'object') return Object.values(result);
    return [];
  } catch (e) {
    console.error('getAllWatches error:', e);
    return [];
  }
}

export async function getFeed() {
  try {
    const result = await readContract('get_trigger_log', []);
    return Array.isArray(result) ? result : [];
  } catch { return []; }
}

export async function getStats() {
  try {
    return await readContract('get_stats', []);
  } catch { return {}; }
}