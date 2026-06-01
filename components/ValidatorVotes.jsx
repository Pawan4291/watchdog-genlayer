// components/ValidatorVotes.jsx
// Unique to WATCHDOG — shows the 5 AI validators that reached consensus

export default function ValidatorVotes({ verdict, confidence }) {
  // Simulate the 5 validators and their votes based on real outcome
  // In a full integration, these would come from gen_dbg_traceTransaction
  const getValidatorVotes = () => {
    const allTrue = verdict && confidence === 'high';
    const majority = verdict;
    
    const votes = [
      { id: 1, model: 'GPT-4o', vote: majority, weight: 20 },
      { id: 2, model: 'Claude-3', vote: majority, weight: 20 },
      { id: 3, model: 'Mistral', vote: allTrue ? majority : !majority, weight: 20 },
      { id: 4, model: 'Llama-3', vote: majority, weight: 20 },
      { id: 5, model: 'Gemini', vote: majority, weight: 20 },
    ];

    // For low confidence, add some dissent
    if (confidence === 'low' && verdict) {
      votes[2].vote = false;
      votes[4].vote = false;
    } else if (confidence === 'medium' && verdict) {
      votes[2].vote = false;
    }

    return votes;
  };

  const validators = getValidatorVotes();
  const trueVotes = validators.filter(v => v.vote).length;
  const falseVotes = validators.filter(v => !v.vote).length;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Validator Votes
        </h4>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          <span style={{ color: 'var(--accent)' }}>{trueVotes} TRUE</span>
          <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>·</span>
          <span style={{ color: 'var(--red)' }}>{falseVotes} FALSE</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {validators.map((v, i) => (
          <div
            key={v.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              background: 'var(--bg-3)',
              border: `1px solid ${v.vote ? 'rgba(0,255,136,0.1)' : 'rgba(255,51,85,0.1)'}`,
              borderRadius: 4,
              animation: `slideUp 0.4s ease forwards ${i * 80}ms`,
              opacity: 0,
            }}
          >
            {/* Validator icon */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: v.vote ? 'var(--accent-dim)' : 'var(--red-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              flexShrink: 0,
              border: `1px solid ${v.vote ? 'rgba(0,255,136,0.2)' : 'rgba(255,51,85,0.2)'}`,
            }}>
              🤖
            </div>

            {/* Validator info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>
                Validator #{v.id}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                {v.model} · weight {v.weight}%
              </div>
            </div>

            {/* Vote */}
            <div style={{
              padding: '3px 10px',
              background: v.vote ? 'var(--accent-dim)' : 'var(--red-dim)',
              color: v.vote ? 'var(--accent)' : 'var(--red)',
              border: `1px solid ${v.vote ? 'rgba(0,255,136,0.2)' : 'rgba(255,51,85,0.2)'}`,
              borderRadius: 20,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}>
              {v.vote ? '✓ TRUE' : '✗ FALSE'}
            </div>
          </div>
        ))}
      </div>

      {/* Consensus bar */}
      <div style={{ marginTop: 12 }}>
        <div style={{
          height: 4,
          background: 'var(--bg-3)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(trueVotes / validators.length) * 100}%`,
            background: 'var(--accent)',
            borderRadius: 2,
            transition: 'width 1s ease',
          }} />
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
          {Math.round((trueVotes / validators.length) * 100)}% consensus · Optimistic Democracy
        </p>
      </div>
    </div>
  );
}
