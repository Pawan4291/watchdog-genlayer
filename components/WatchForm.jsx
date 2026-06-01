// components/WatchForm.jsx
import { useState, useEffect } from 'react';
import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

const WORKING_SITES = [
  { name: 'GitHub', url: 'https://github.com', icon: '🐙', tag: 'Code', example: 'The repository has more than 1000 stars' },
  { name: 'GenLayer', url: 'https://genlayer.com', icon: '⛓', tag: 'Crypto', example: 'The page mentions a new testnet launch' },
  { name: 'CoinMarketCap', url: 'https://coinmarketcap.com/currencies/bitcoin/', icon: '📊', tag: 'Crypto', example: 'Bitcoin price is above $50,000' },
  { name: 'CoinGecko', url: 'https://coingecko.com', icon: '🦎', tag: 'Crypto', example: 'Bitcoin market cap is above $2 trillion' },
  { name: 'BTC Price', url: 'https://rate.sx/btc', icon: '₿', tag: 'Crypto', example: 'The Bitcoin price is above $100,000' },
  { name: 'ETH Price', url: 'https://rate.sx/eth', icon: 'Ξ', tag: 'Crypto', example: 'The Ethereum price is above $4,000' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', icon: '🔶', tag: 'News', example: 'There is a post about AI agents on the front page' },
  { name: 'Dev.to', url: 'https://dev.to', icon: '👩‍💻', tag: 'Dev', example: 'There is an article about GenLayer' },
  { name: 'Example.com', url: 'https://example.com', icon: '🌐', tag: 'Test', example: 'The word Example appears on the page' },
];

const BLOCKED_DOMAINS = [
  'twitter.com', 'x.com', 'instagram.com', 'facebook.com',
  'coinmarketcap.com', 'amazon.com', 'reddit.com', 'linkedin.com',
  'tiktok.com', 'youtube.com', 'netflix.com',
];

function checkIfBlocked(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return BLOCKED_DOMAINS.some(d => hostname.includes(d));
  } catch { return false; }
}

export default function WatchForm({ account, onWatchCreated }) {
  const [url, setUrl] = useState('');
  const [condition, setCondition] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [urlWarning, setUrlWarning] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [showWebhookHelp, setShowWebhookHelp] = useState(false);

  const tags = ['All', 'Crypto', 'Code', 'News', 'Dev', 'Info', 'Test'];
  const filteredSites = activeTag === 'All' ? WORKING_SITES : WORKING_SITES.filter(s => s.tag === activeTag);

  useEffect(() => {
    if (!url) { setUrlWarning(''); return; }
    setUrlWarning(checkIfBlocked(url) ? 'blocked' : '');
  }, [url]);

  const handleSiteClick = (site) => {
    setUrl(site.url);
    setCondition(site.example);
    setUrlWarning('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!account) { setError('Connect your wallet first'); return; }
    if (!url || !condition) { setError('URL and condition are required'); return; }
    if (urlWarning === 'blocked') { setError('This website blocks AI readers. Choose a supported website.'); return; }
    if (!discordWebhook) { setError('Discord webhook is required — this is how you receive alerts!'); return; }

    setLoading(true);
    try {
      const client = createClient({ chain: testnetBradbury, account });
      await client.connect('testnetBradbury');

      const txHash = await client.writeContract({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        functionName: 'create_watch',
        args: [url, condition, discordWebhook],
        value: BigInt(0),
      });

      setSuccess(`Watch created! TX: ${txHash.slice(0, 18)}...`);

      await client.waitForTransactionReceipt({
        hash: txHash,
        status: TransactionStatus.ACCEPTED,
        interval: 3000,
        retries: 20,
      });

      setUrl('');
      setCondition('');
      setDiscordWebhook('');
      if (onWatchCreated) setTimeout(onWatchCreated, 2000);
    } catch (err) {
      if (err.message?.includes('user rejected')) {
        setError('Transaction rejected in MetaMask.');
      } else if (err.message?.includes('insufficient funds')) {
        setError('Not enough GEN for gas. Get testnet GEN from GenLayer faucet.');
      } else {
        setError(err.message || 'Failed to create watch');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          New Watch
        </span>
      </div>

      <div style={{ padding: 24 }}>

        {/* SUPPORTED WEBSITES */}
        <div style={{ marginBottom: 24, padding: 16, background: 'var(--bg-3)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ✅ Click a website to get started
          </p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)} style={{
                padding: '3px 10px',
                background: activeTag === tag ? 'var(--accent)' : 'var(--bg-2)',
                color: activeTag === tag ? 'var(--bg)' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {tag}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {filteredSites.map((site) => (
              <button key={site.url} onClick={() => handleSiteClick(site)} style={{
                padding: '8px 12px',
                background: url === site.url ? 'rgba(0,255,136,0.1)' : 'var(--bg-2)',
                border: `1px solid ${url === site.url ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: url === site.url ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span>{site.icon}</span>
                <span>{site.name}</span>
                <span style={{ fontSize: 9, padding: '1px 5px', background: 'var(--bg-3)', borderRadius: 3, color: 'var(--text-dim)' }}>
                  {site.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* BLOCKED SITES */}
        <div style={{ marginBottom: 20, padding: '10px 14px', background: 'rgba(255,51,85,0.05)', border: '1px solid rgba(255,51,85,0.15)', borderRadius: 6 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
            ❌ These sites block AI readers and won't work:
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,51,85,0.7)', lineHeight: 1.6 }}>
            Twitter/X · Instagram · Amazon · Reddit · CoinMarketCap · LinkedIn · YouTube · TikTok
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* URL */}
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Website URL to watch
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://github.com/your/repo"
              required
              style={{ borderColor: urlWarning === 'blocked' ? 'rgba(255,51,85,0.5)' : undefined }}
            />
            {urlWarning === 'blocked' && (
              <div style={{ marginTop: 6, padding: '8px 12px', background: 'rgba(255,51,85,0.08)', border: '1px solid rgba(255,51,85,0.2)', borderRadius: 4 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', margin: 0 }}>
                  ⚠️ This website blocks AI readers. Please choose from the supported sites above.
                </p>
              </div>
            )}
          </div>

          {/* Condition */}
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Condition (plain English)
            </label>
            <textarea
              value={condition}
              onChange={e => setCondition(e.target.value)}
              placeholder="Describe what you want to be alerted about..."
              rows={3}
              required
              style={{ resize: 'vertical' }}
            />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
              💡 Be specific. "Bitcoin price is above $100,000" works better than "Bitcoin is high"
            </p>
          </div>

          {/* Discord Webhook - REQUIRED */}
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Discord Webhook URL <span style={{ color: 'var(--red)', fontSize: 10 }}>* required</span>
            </label>
            <input
              type="url"
              value={discordWebhook}
              onChange={e => setDiscordWebhook(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              required
            />

            {/* How to get webhook - toggle */}
            <button
              type="button"
              onClick={() => setShowWebhookHelp(!showWebhookHelp)}
              style={{
                marginTop: 8,
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--accent)',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              {showWebhookHelp ? '▲ Hide instructions' : '▼ How to get a Discord webhook?'}
            </button>

            {showWebhookHelp && (
              <div style={{
                marginTop: 8,
                padding: 14,
                background: 'var(--bg-3)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-muted)',
                lineHeight: 2,
              }}>
                <p style={{ color: 'var(--accent)', marginBottom: 8, fontSize: 12 }}>📬 Get your Discord webhook in 4 steps:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    '1. Open Discord → Go to your server',
                    '2. Click ⚙️ Server Settings (top left)',
                    '3. Click Integrations → Webhooks',
                    '4. Click "New Webhook" → Copy Webhook URL → paste here',
                  ].map((step, i) => (
                    <div key={i} style={{
                      padding: '6px 10px',
                      background: 'var(--bg-2)',
                      borderRadius: 4,
                      borderLeft: '2px solid var(--accent)',
                      color: 'var(--text-muted)',
                      fontSize: 11,
                    }}>
                      {step}
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: 8, fontSize: 10, color: 'var(--text-dim)' }}>
                  💡 Don't have a server? Create a free one at discord.com — takes 30 seconds.
                </p>
              </div>
            )}
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ padding: '10px 14px', background: 'var(--red-dim)', border: '1px solid rgba(255,51,85,0.2)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)' }}>
              ✕ {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '10px 14px', background: 'var(--accent-dim)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>
              ✓ {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !account || urlWarning === 'blocked'}
            style={{
              padding: '12px 24px',
              background: loading || !account || urlWarning === 'blocked' ? 'var(--bg-3)' : 'var(--accent)',
              color: loading || !account || urlWarning === 'blocked' ? 'var(--text-muted)' : 'var(--bg)',
              border: 'none',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              fontWeight: 700,
              cursor: loading || !account || urlWarning === 'blocked' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.04em',
            }}
          >
            {loading ? '⟳ Creating on-chain...' : !account ? 'Connect wallet to create' : urlWarning === 'blocked' ? '⚠️ URL not supported' : '+ Deploy Watch on GenLayer'}
          </button>
        </form>

        <p style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.8 }}>
          ⛓ Stored on Bradbury Testnet · 🤖 AI consensus by 5 validators · ⏱ Checked every 30 min
        </p>
      </div>
    </div>
  );
}
