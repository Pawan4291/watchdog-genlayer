import { createClient, createAccount } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  || '0x9ff9Ff8a9e69065D08d5d97aCD8caeBEc7eB0f24';

const FALLBACK_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || '';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  if (req.method !== 'GET' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const account = createAccount();
    const readClient = createClient({ chain: testnetBradbury, account });

    // Get active watches
    const watchesRaw = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_watches',
      args: [],
    });

    const watches = Array.isArray(watchesRaw) ? watchesRaw : JSON.parse(watchesRaw);
    const activeWatches = watches.filter(w => w.active);

    if (activeWatches.length === 0) {
      return res.status(200).json({ message: 'No active watches', checked: 0 });
    }

    const { privateKeyToAccount } = await import('viem/accounts');
    const signerAccount = privateKeyToAccount(process.env.CRON_PRIVATE_KEY);
    const writeClient = createClient({ chain: testnetBradbury, account: signerAccount });

    const results = [];

    for (const watch of activeWatches) {
      try {
        // Submit run_check — return immediately, don't wait
        const txHash = await writeClient.writeContract({
          address: CONTRACT_ADDRESS,
          functionName: 'run_check',
          args: [watch.id],
          value: BigInt(0),
        });

        console.log(`Watch ${watch.id} submitted: ${txHash}`);
        results.push({ watchId: watch.id, txHash, status: 'submitted' });

      } catch (err) {
        console.error(`Watch ${watch.id} error:`, err.message);
        results.push({ watchId: watch.id, error: err.message });
      }
    }

    return res.status(200).json({
      message: 'Checks submitted — validators processing',
      checked: activeWatches.length,
      results,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}