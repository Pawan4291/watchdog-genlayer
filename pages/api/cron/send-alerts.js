import { createClient, createAccount } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  || '0x9ff9Ff8a9e69065D08d5d97aCD8caeBEc7eB0f24';

const FALLBACK_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || '';

export const config = { maxDuration: 60 };

// Track sent alerts in memory (resets per cold start — good enough)
const sentAlertIds = new Set();

export default async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  if (req.method !== 'GET' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const account = createAccount();
    const readClient = createClient({ chain: testnetBradbury, account });

    const watchesRaw = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_watches',
      args: [],
    });
    const watches = Array.isArray(watchesRaw) ? watchesRaw : JSON.parse(watchesRaw);

    const feedRaw = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_feed',
      args: [],
    });
    const feed = Array.isArray(feedRaw) ? feedRaw : JSON.parse(feedRaw);

    if (feed.length === 0) {
      return res.status(200).json({ message: 'No triggers found', alerts: 0 });
    }

    // Build watch map
    const watchMap = {};
    for (const w of watches) watchMap[w.id] = w;

    // Only check last 2 triggers
    const recentTriggers = feed.slice(Math.max(0, feed.length - 2));

    let alertsSent = 0;

    for (const trigger of recentTriggers) {
      // Skip if not triggered
      if (!trigger.verdict) continue;

      // Skip if already sent this exact trigger
      const alertKey = `${trigger.watch_id}-${trigger.id}`;
      if (sentAlertIds.has(alertKey)) continue;

      const watch = watchMap[trigger.watch_id];
      if (!watch) continue;

      // ✅ Skip paused/inactive watches
      if (!watch.active) continue;

      const webhookUrl = watch.discord_webhook || FALLBACK_WEBHOOK;
      if (!webhookUrl) continue;

      try {
        await sendDiscordAlert(watch, trigger, webhookUrl);
        sentAlertIds.add(alertKey); // mark as sent
        alertsSent++;
        console.log(`Alert sent for watch ${watch.id} trigger ${trigger.id}`);
      } catch (err) {
        console.error(`Discord failed for watch ${watch.id}:`, err.message);
      }
    }

    return res.status(200).json({
      message: 'Alerts processed',
      triggersFound: recentTriggers.filter(t => t.verdict).length,
      alertsSent,
    });

  } catch (err) {
    console.error('send-alerts error:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function sendDiscordAlert(watch, trigger, webhookUrl) {
  const confidenceEmoji = { high: '🟢', medium: '🟡', low: '🔴' }[trigger.confidence] || '⚪';

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: '🐕 WATCHDOG Alert Triggered!',
        color: 0x00ff88,
        fields: [
          { name: '📋 Condition', value: watch.condition, inline: false },
          { name: '🌐 URL', value: watch.url, inline: false },
          { name: `${confidenceEmoji} Confidence`, value: (trigger.confidence || 'unknown').toUpperCase(), inline: true },
          { name: '🔍 Evidence', value: trigger.evidence || 'N/A', inline: false },
          { name: '🧠 AI Reasoning', value: trigger.reasoning || 'N/A', inline: false },
        ],
        footer: { text: 'WATCHDOG • GenLayer Bradbury Testnet' },
        timestamp: new Date().toISOString(),
      }]
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord returned ${response.status}`);
  }
}