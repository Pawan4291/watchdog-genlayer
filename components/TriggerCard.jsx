// components/TriggerCard.jsx
import Link from 'next/link';

const confidenceConfig = {
  high: { color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'rgba(0,255,136,0.2)', label: 'HIGH' },
  medium: { color: 'var(--yellow)', bg: 'var(--yellow-dim)', border: 'rgba(255,204,0,0.2)', label: 'MED' },
  low: { color: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(255,51,85,0.2)', label: 'LOW' },
};

export default function TriggerCard({ trigger, index }) {
  const conf = confidenceConfig[trigger.confidence] || confidenceConfig.low;
  const watch = trigger.watch;

  return (
    <div
      className="card animate-slide-up"
      style={{
        animationDelay: `${index * 60}ms`,
        borderLeft: `3px solid ${conf.color}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 1,
        background: `linear-gradient(90deg, ${conf.color}40, transparent)`,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Condition */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--text)',
            marginBottom: 4,
            lineHeight: 1.4,
          }}>
            {watch?.condition || 'Unknown condition'}
          </p>
          
          {/* URL */}
          <a
            href={watch?.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {watch?.url || 'URL not available'}
          </a>
        </div>

        {/* Confidence badge */}
        <div style={{
          padding: '4px 10px',
          background: conf.bg,
          border: `1px solid ${conf.border}`,
          borderRadius: 20,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 700,
          color: conf.color,
          flexShrink: 0,
          letterSpacing: '0.08em',
        }}>
          {conf.label}
        </div>
      </div>

      {/* Reasoning */}
      {trigger.reasoning && (
        <div style={{
          background: 'var(--bg-3)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '8px 12px',
          marginBottom: 12,
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
            AI Reasoning
          </p>
          <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>
            {trigger.reasoning}
          </p>
        </div>
      )}

      {/* Evidence snippet */}
      {trigger.evidence && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          marginBottom: 12,
          padding: '6px 10px',
          background: 'rgba(0,255,136,0.03)',
          borderLeft: '2px solid var(--accent)',
          borderRadius: '0 4px 4px 0',
        }}>
          "{trigger.evidence.slice(0, 120)}{trigger.evidence.length > 120 ? '...' : ''}"
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
          TRIGGER #{trigger.id} · WATCH #{trigger.watch_id}
        </span>
        
        <Link
          href={`/proof/${trigger.id}`}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--accent)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          View Proof →
        </Link>
      </div>
    </div>
  );
}
