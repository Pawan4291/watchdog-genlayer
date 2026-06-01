// pages/index.js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import WatchForm from '../components/WatchForm';
import TriggerCard from '../components/TriggerCard';

export default function Home() {
  const [account, setAccount] = useState(null);
  const [feed, setFeed] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use WATCHDOG');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (err) {
      console.error('Wallet connection failed:', err);
    }
  };

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/get-feed');
      const data = await res.json();
      if (data.triggers) {
        setFeed(data.triggers);
        setLiveCount(data.total);
      }
    } catch (err) {
      console.error('Feed fetch error:', err);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchFeed, 30000);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  useEffect(() => {
    // Auto-connect if already approved
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => { if (accounts[0]) setAccount(accounts[0]); });
    }
  }, []);

  return (
    <>
      <Head>
        <title>WATCHDOG — AI Monitoring on GenLayer</title>
        <meta name="description" content="Monitor any website condition in plain English. Get alerted with blockchain proof when it happens." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
        <meta property="og:title" content="WATCHDOG — AI Monitoring on GenLayer" />
        <meta property="og:description" content="Type a condition in plain English. Get alerted with on-chain proof when it happens." />
      </Head>

      <Navbar account={account} onConnect={connectWallet} />

      <main className="page-container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: 20,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--accent)',
            marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Live on GenLayer Bradbury Testnet
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: 20,
            background: 'linear-gradient(135deg, #ffffff 0%, #e8e8f0 40%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Monitor Anything.<br />Prove Everything.
          </h1>

          <p style={{
            fontSize: 18,
            color: 'var(--text-muted)',
            maxWidth: 520,
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}>
            Type a condition in plain English. AI validators on GenLayer judge it on-chain every 30 minutes. Get Discord alerts with tamper-proof proof.
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            flexWrap: 'wrap',
          }}>
            {[
              { label: 'Total Triggers', value: liveCount },
{ label: 'Active Watches', value: feed.length > 0 ? 'Live' : '0' },
{ label: 'Check Interval', value: '30m' },
{ label: 'Network', value: 'Bradbury' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          alignItems: 'start',
        }}>
          {/* Left: Create Form */}
          <div>
            <WatchForm account={account} onWatchCreated={fetchFeed} />

            {/* How it works */}
            <div style={{ marginTop: 24, padding: 20, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                How It Works
              </h3>
              {[
                { n: '01', title: 'Type in plain English', desc: 'No code. No APIs. Just describe what you want to track.' },
                { n: '02', title: 'Stored on GenLayer', desc: 'Your condition is saved permanently in an Intelligent Contract.' },
                { n: '03', title: '5 AI validators check it', desc: 'Every 30 min, validators read the URL and reach consensus.' },
                { n: '04', title: 'Get Discord alert + proof', desc: 'When triggered, you receive an alert with a shareable proof link.' },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 28, height: 28,
                    background: 'var(--accent-dim)',
                    border: '1px solid rgba(0,255,136,0.2)',
                    borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--accent)',
                    flexShrink: 0,
                  }}>
                    {step.n}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{step.title}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Feed */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  animation: 'pulse 2s infinite',
                }} />
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Live Trigger Feed
                </h2>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                {liveCount} total
              </span>
            </div>

            {feedLoading ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  animation: 'pulse 1s infinite',
                }}>
                  ⟳ Loading on-chain data...
                </div>
              </div>
            ) : feed.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 60,
                background: 'var(--bg-2)',
                border: '1px dashed var(--border)',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🐕</div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                  No triggers yet. Create the first watch!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {feed.slice(0, 10).map((trigger, i) => (
                  <TriggerCard key={trigger.id} trigger={trigger} index={i} />
                ))}
                {feed.length > 10 && (
                  <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', paddingTop: 8 }}>
                    + {feed.length - 10} more triggers on-chain
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-dim)',
      }}>
        WATCHDOG · Built on{' '}
        <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
          GenLayer
        </a>
        {' '}· Powered by Optimistic Democracy · 0$ investment
      </footer>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
