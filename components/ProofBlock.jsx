// components/ProofBlock.jsx
// Shows immutable on-chain proof for a trigger

const EXPLORER_URL = 'https://studio.genlayer.com';

export default function ProofBlock({ trigger, watch }) {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const proofItems = [
    { label: 'Trigger ID', value: `#${trigger.id}`, copy: String(trigger.id) },
    { label: 'Watch ID', value: `#${trigger.watch_id}`, copy: String(trigger.watch_id) },
    { label: 'Verdict', value: trigger.verdict ? '✓ TRUE' : '✗ FALSE', color: trigger.verdict ? 'var(--accent)' : 'var(--red)' },
    { label: 'Confidence', value: trigger.confidence?.toUpperCase() || 'UNKNOWN' },
    { label: 'Contract', value: `${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.slice(0, 12)}...`, copy: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS },
    { label: 'Network', value: 'GenLayer Bradbury Testnet' },
  ];

  return (
    <div style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'linear-gradient(90deg, rgba(0,255,136,0.05), transparent)',
      }}>
        <span style={{ fontSize: 16 }}>⛓</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          On-Chain Proof
        </span>
        <div style={{
          marginLeft: 'auto',
          width: 8, height: 8,
          borderRadius: '50%',
          background: 'var(--accent)',
          animation: 'pulse 2s infinite',
        }} />
      </div>

      {/* Proof items */}
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {proofItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                {item.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: item.color || 'var(--text)',
                  fontWeight: item.color ? 700 : 400,
                }}>
                  {item.value}
                </span>
                {item.copy && (
                  <button
                    onClick={() => handleCopy(item.copy)}
                    title="Copy"
                    style={{
                      background: 'var(--bg-3)',
                      border: '1px solid var(--border)',
                      borderRadius: 3,
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      padding: '2px 6px',
                    }}
                  >
                    copy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* URL that was checked */}
        {watch?.url && (
          <div style={{ marginTop: 14 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
              URL Checked
            </p>
            <a
              href={watch.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--accent)',
                wordBreak: 'break-all',
              }}
            >
              {watch.url}
            </a>
          </div>
        )}

        {/* Immutability note */}
        <div style={{
          marginTop: 16,
          padding: '10px 14px',
          background: 'rgba(0,255,136,0.04)',
          border: '1px solid rgba(0,255,136,0.12)',
          borderRadius: 4,
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', lineHeight: 1.6 }}>
            🔒 This proof is permanently stored on the GenLayer blockchain and cannot be altered or deleted.
          </p>
        </div>

        {/* Share link */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          style={{
            marginTop: 14,
            width: '100%',
            padding: '10px',
            background: 'var(--bg-3)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)'; }}
        >
          📋 Copy Proof URL
        </button>
      </div>
    </div>
  );
}
