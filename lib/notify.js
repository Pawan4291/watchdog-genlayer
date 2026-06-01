// lib/notify.js
// Discord webhook notification sender

/**
 * Sends a Discord alert when a watch condition is triggered.
 * @param {string} webhookUrl - The user's Discord webhook URL
 * @param {object} watch - The watch object
 * @param {object} trigger - The trigger result
 * @param {string} proofUrl - The shareable proof URL
 */
export async function sendDiscordAlert(webhookUrl, watch, trigger, proofUrl) {
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    console.warn('Invalid Discord webhook URL, skipping notification');
    return false;
  }

  const confidenceEmoji = {
    high: '🟢',
    medium: '🟡',
    low: '🔴',
  }[trigger.confidence] || '⚪';

  const embed = {
    title: '🐕 WATCHDOG Alert Triggered!',
    description: `Your condition has been met and verified on-chain by AI consensus.`,
    color: 0x00ff88, // Green
    fields: [
      {
        name: '📋 Condition',
        value: watch.condition.substring(0, 1024),
        inline: false,
      },
      {
        name: '🌐 URL Checked',
        value: watch.url.substring(0, 256),
        inline: true,
      },
      {
        name: `${confidenceEmoji} Confidence`,
        value: trigger.confidence.toUpperCase(),
        inline: true,
      },
      {
        name: '🤖 AI Reasoning',
        value: (trigger.reasoning || 'No reasoning provided').substring(0, 1024),
        inline: false,
      },
      {
        name: '🔍 Evidence Found',
        value: (trigger.evidence || 'See proof page for details').substring(0, 512),
        inline: false,
      },
      {
        name: '⛓️ On-Chain Proof',
        value: `[View Proof →](${proofUrl})`,
        inline: false,
      },
    ],
    footer: {
      text: 'WATCHDOG on GenLayer • Powered by Optimistic Democracy',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'WATCHDOG 🐕',
        avatar_url: 'https://watchdog-genlayer.vercel.app/logo.png',
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord webhook error:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
    return false;
  }
}

/**
 * Validates a Discord webhook URL format.
 */
export function isValidDiscordWebhook(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'discord.com' &&
      parsed.pathname.startsWith('/api/webhooks/')
    );
  } catch {
    return false;
  }
}
