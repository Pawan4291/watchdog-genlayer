// pages/dashboard.js

import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { getAllWatches } from '../lib/genlayer';

export default function Dashboard() {
  const [account, setAccount] = useState(null);
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ REPLACE WITH THIS
const fetchMyWatches = useCallback(async (addr) => {
  if (!addr) return;
  setLoading(true);
  setError('');
  try {
    const all = await getAllWatches(); // ← actually call it!
    const mine = (all || []).filter(w =>
      w.owner && w.owner.toLowerCase() === addr.toLowerCase()
    );
    setWatches(mine); // ← actually save it to state!
  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts[0]) {
            setAccount(accounts[0]);
            fetchMyWatches(accounts[0]);
          }
        });
    }
  }, [fetchMyWatches]);

  

 // ✅ REPLACE WITH THIS
const handleDeactivate = async (watchId) => {
  if (!account) return;
  try {
    const client = createClient({
      chain: testnetBradbury,
      account: account,
    });

    await client.writeContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      functionName: 'deactivate_watch',
      args: [BigInt(watchId)],
    });

    // Wait 3 seconds then refresh from chain
    setTimeout(() => fetchMyWatches(account), 3000);

  } catch (err) {
    if (!err.message?.includes('user rejected')) {
      alert('Error: ' + err.message);
    }
  }
};

  const activeWatches = watches.filter(w => w.active);
  const inactiveWatches = watches.filter(w => !w.active);

  return (
    <>
      <Head>
        <title>Dashboard — WATCHDOG</title>
      </Head>

      <Navbar account={account} onConnect={connectWallet} />

      <main className="page-container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div>
    <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
      Your Watches
    </h1>
    <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      {account ? `${account.slice(0,10)}... · ${watches.length} total` : 'Connect wallet to see your watches'}
    </p>
  </div>
  {account && (
    <button
      onClick={() => fetchMyWatches(account)}
      style={{
        padding: '8px 16px',
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 4,
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        cursor: 'pointer',
      }}
    >
      ↻ Refresh
    </button>
  )}
</div>

        {!account ? (
          <div style={{
            textAlign: 'center',
            padding: 80,
            background: 'var(--bg-2)',
            border: '1px dashed var(--border)',
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <h2 style={{ marginBottom: 12 }}>Connect Your Wallet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Sign in with MetaMask to view your active watches
            </p>
            <button
              onClick={connectWallet}
              style={{
                padding: '12px 32px',
                background: 'var(--accent)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Connect MetaMask
            </button>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: 60, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', animation: 'pulse 1s infinite' }}>
            ⟳ Loading your watches from the blockchain...
          </div>
        ) : error ? (
          <div style={{ padding: 20, background: 'var(--red-dim)', border: '1px solid rgba(255,51,85,0.2)', borderRadius: 8, color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            Error: {error}
          </div>
        ) : watches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, background: 'var(--bg-2)', border: '1px dashed var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🐕</div>
            <h2 style={{ marginBottom: 12 }}>No watches yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Create your first watch to start monitoring
            </p>
            <Link
              href="/"
              style={{
                padding: '12px 32px',
                background: 'var(--accent)',
                color: 'var(--bg)',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              + Create First Watch
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
              {[
                { label: 'Active', value: activeWatches.length, color: 'var(--accent)' },
                { label: 'Paused', value: inactiveWatches.length, color: 'var(--text-muted)' },
                { label: 'Total Triggers', value: watches.reduce((s, w) => s + (w.trigger_count || 0), 0), color: 'var(--yellow)' },
              ].map(stat => (
                <div key={stat.label} style={{
                  padding: '16px 24px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  flex: 1,
                  minWidth: 140,
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Active Watches */}
            {activeWatches.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                  🟢 Active Watches
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeWatches.map(watch => (
                    <WatchRow key={watch.id} watch={watch} onDeactivate={handleDeactivate} />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Watches */}
            {inactiveWatches.length > 0 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                  ⏸ Paused Watches
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.6 }}>
                  {inactiveWatches.map(watch => (
                    <WatchRow key={watch.id} watch={watch} onDeactivate={handleDeactivate} paused />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

function WatchRow({ watch, onDeactivate, paused }) {
  return (
    <div className="card" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
      borderLeft: `3px solid ${paused ? 'var(--border)' : 'var(--accent)'}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, lineHeight: 1.4 }}>
          {watch.condition}
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {watch.url}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>ID #{watch.id}</span>
  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--yellow)' }}>{watch.trigger_count || 0} triggers</span>
  {watch.trigger_count > 0 && (
    <Link
      href={`/proof/${watch.id}`}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--accent)',
        textDecoration: 'none',
      }}
    >
      View Proof →
    </Link>
  )}
</div>
      </div>

      {paused ? (
  <span style={{
    padding: '6px 14px',
    background: 'rgba(255,200,0,0.1)',
    border: '1px solid rgba(255,200,0,0.3)',
    borderRadius: 4,
    color: '#ffc800',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
  }}>
    ⏸ Paused
  </span>
) : (
  <button
    onClick={() => {
      if (confirm(`Stop watching: "${watch.condition.slice(0, 60)}..."?`)) {
        onDeactivate(watch.id);
      }
    }}
    style={{
      padding: '6px 14px',
      background: 'var(--red-dim)',
      border: '1px solid rgba(255,51,85,0.2)',
      borderRadius: 4,
      color: 'var(--red)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      cursor: 'pointer',
      flexShrink: 0,
    }}
  >
    Deactivate
  </button>
)}
    </div>
  );
}
