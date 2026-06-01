// pages/proof/[id].js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import ValidatorVotes from '../../components/ValidatorVotes';
import ProofBlock from '../../components/ProofBlock';
import { useRouter } from 'next/router';

export default function ProofPage() {
  const router = useRouter();
  const { id } = router.query;

  const [trigger, setTrigger] = useState(null);
  const [watch, setWatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchProof = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/get-feed');
        const data = await res.json();

        const found = data.triggers?.find(t => String(t.id) === String(id));
        if (found) {
          setTrigger(found);
          setWatch(found.watch || null);
        } else {
          setError('Trigger not found. It may not exist on-chain.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProof();
  }, [id]);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      // No need to store for proof page
    }
  };

  return (
    <>
      <Head>
        <title>{trigger ? `Proof #${id} — WATCHDOG` : 'Loading Proof — WATCHDOG'}</title>
        <meta name="description" content={trigger ? `On-chain proof: ${trigger.watch?.condition}` : 'Verifiable on-chain proof from WATCHDOG'} />
        <meta property="og:title" content={`WATCHDOG Proof #${id}`} />
        <meta property="og:description" content={trigger?.watch?.condition || 'On-chain proof from WATCHDOG'} />
      </Head>

      <Navbar account={null} onConnect={connectWallet} />

      <main className="page-container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 800 }}>
        {/* Back */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            marginBottom: 32,
          }}
        >
          ← Back to feed
        </Link>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', animation: 'pulse 1s infinite' }}>
            ⟳ Fetching proof from blockchain...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ marginBottom: 8, color: 'var(--red)' }}>Proof Not Found</h2>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{error}</p>
          </div>
        ) : trigger && (
          <>
            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 12px',
                background: trigger.verdict ? 'var(--accent-dim)' : 'var(--red-dim)',
                border: `1px solid ${trigger.verdict ? 'rgba(0,255,136,0.2)' : 'rgba(255,51,85,0.2)'}`,
                borderRadius: 20,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: trigger.verdict ? 'var(--accent)' : 'var(--red)',
                marginBottom: 16,
              }}>
                {trigger.verdict ? '✓ CONDITION MET' : '✗ CONDITION NOT MET'}
              </div>

              <h1 style={{
                fontSize: 'clamp(22px, 4vw, 32px)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
                marginBottom: 12,
              }}>
                {watch?.condition || 'Condition #' + id}
              </h1>

              <a
                href={watch?.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}
              >
                {watch?.url}
              </a>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* AI Reasoning */}
              {trigger.reasoning && (
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    AI Reasoning
                  </h3>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)' }}>
                    {trigger.reasoning}
                  </p>
                </div>
              )}

              {/* Evidence */}
              {trigger.evidence && (
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    Evidence Found on Page
                  </h3>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--text)',
                    padding: '12px 16px',
                    background: 'var(--bg-3)',
                    border: '1px solid var(--border)',
                    borderLeft: '3px solid var(--accent)',
                    borderRadius: '0 4px 4px 0',
                    lineHeight: 1.6,
                  }}>
                    {trigger.evidence}
                  </div>
                </div>
              )}

              {/* Two column: validators + proof */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="card">
                  <ValidatorVotes verdict={trigger.verdict} confidence={trigger.confidence} />
                </div>
                <ProofBlock trigger={trigger} watch={watch} />
              </div>

              {/* Share */}
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
              }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Share this tamper-proof verification
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
                    alert('Proof URL copied!');
                  }}
                  style={{
                    padding: '10px 24px',
                    background: 'var(--accent)',
                    color: 'var(--bg)',
                    border: 'none',
                    borderRadius: 4,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  📋 Copy Proof URL
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <style jsx>{`
        @media (max-width: 600px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
