// pages/api/cron/run-checks.js
import { createClient, createAccount } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  || '0x6cb21B2246902D912838D7c7afaE8e0A0d7f2a34';

const FALLBACK_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || '';

console.log('Using contract:', CONTRACT_ADDRESS);



export const config = {
  maxDuration: 300, // 5 minutes
};

export default async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  if (req.method !== 'GET' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Cron: Starting watch checks...');

    const account = createAccount();
    const readClient = createClient({ chain: testnetBradbury, account });

    const watchesRaw = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_watches',
      args: [],
    });

    const watches = Array.isArray(watchesRaw) ? watchesRaw : JSON.parse(watchesRaw);
    const activeWatches = watches.filter(w => w.active);

    console.log(`Cron: Found ${activeWatches.length} active watches`);

    if (activeWatches.length === 0) {
      return res.status(200).json({ message: 'No active watches', checked: 0 });
    }

    const CRON_PRIVATE_KEY = process.env.CRON_PRIVATE_KEY;
    if (!CRON_PRIVATE_KEY) {
      return res.status(500).json({
        error: 'CRON_PRIVATE_KEY not set in .env.local.',
      });
    }

    const { privateKeyToAccount } = await import('viem/accounts');
    const signerAccount = privateKeyToAccount(CRON_PRIVATE_KEY);
    const writeClient = createClient({ chain: testnetBradbury, account: signerAccount });

    const results = [];

    for (const watch of activeWatches) {
      try {
        console.log(`Cron: Checking watch ${watch.id}: "${watch.condition}"`);

        // Retry logic
        let txHash;
        let attempts = 0;
        while (attempts < 3) {
          try {
            txHash = await writeClient.writeContract({
              address: CONTRACT_ADDRESS,
              functionName: 'run_check',
              args: [watch.id],
              value: BigInt(0),
            });
            break;
          } catch (err) {
            attempts++;
            console.log(`Cron: Attempt ${attempts} failed: ${err.message}`);
            if (attempts === 3) throw err;
            await new Promise(r => setTimeout(r, 15000));
          }
        }

        console.log(`Cron: Watch ${watch.id} tx submitted: ${txHash}`);

        // Wait for AI validators
        // Line 79 - change this
await new Promise(r => setTimeout(r, 120000));

        // Read feed to check if triggered
        const feedRaw = await readClient.readContract({
          address: CONTRACT_ADDRESS,
          functionName: 'get_feed',
          args: [],
        });

        const feed = Array.isArray(feedRaw) ? feedRaw : JSON.parse(feedRaw);
        const latestTrigger = feed.filter(t => String(t.watch_id) === String(watch.id)).pop();

const webhookUrl = watch.discord_webhook || FALLBACK_WEBHOOK;

// Only alert if this trigger is new (created after this cron run started)
const cronStartTime = Date.now();
const isNewTrigger = latestTrigger && 
  latestTrigger.verdict === true &&
  String(latestTrigger.watch_id) === String(watch.id);

// Check we haven't already sent this exact trigger
const alreadySent = results.some(r => r.lastTriggerId === latestTrigger?.id);

if (isNewTrigger && webhookUrl && !alreadySent) {
          console.log(`Cron: Watch ${watch.id} TRIGGERED! Sending Discord...`);
          await sendDiscordAlert(watch, latestTrigger, webhookUrl);
        }

        results.push({
  watchId: watch.id,
  triggered: latestTrigger?.verdict || false,
  lastTriggerId: latestTrigger?.id,
  txHash,
});

      } catch (err) {
        console.error(`Cron: Watch ${watch.id} error:`, err.message);
        results.push({ watchId: watch.id, error: err.message });
      }
    }

    return res.status(200).json({
      message: 'Checks complete',
      checked: activeWatches.length,
      results,
    });

  } catch (err) {
    console.error('Cron fatal error:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function sendDiscordAlert(watch, trigger, webhookUrl) {
  const confidenceEmoji = { high: '🟢', medium: '🟡', low: '🔴' }[trigger.confidence] || '⚪';

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: '🐕 WATCHDOG Alert Triggered!',
        color: 0x00ff88,
        fields: [
          { name: '📋 Condition', value: watch.condition, inline: false },
          { name: '🌐 URL', value: watch.url, inline: false },
          { name: `${confidenceEmoji} Confidence`, value: trigger.confidence?.toUpperCase(), inline: true },
          { name: '🔍 Evidence', value: trigger.evidence || 'N/A', inline: false },
          { name: '🧠 AI Reasoning', value: trigger.reasoning || 'N/A', inline: false },
        ],
        footer: { text: 'WATCHDOG • GenLayer Bradbury Testnet' },
        timestamp: new Date().toISOString(),
      }]
    }),
  });
}