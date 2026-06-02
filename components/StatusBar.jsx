// components/StatusBar.jsx
import { useState, useEffect } from 'react';

const CHECK_INTERVAL = 30; // minutes

export default function StatusBar() {
  const [timeUntilNext, setTimeUntilNext] = useState('');
  const [lastChecked, setLastChecked] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const calculateTimes = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Next 30 min mark
      const nextCheck = minutes < 30
        ? 30 - minutes
        : 60 - minutes;
      const secsLeft = nextCheck * 60 - seconds;
      const minsLeft = Math.floor(secsLeft / 60);
      const secs = secsLeft % 60;

      setTimeUntilNext(`${minsLeft}m ${secs}s`);

      // Show "checking" animation when close to check time
      setIsChecking(secsLeft < 10 || (secsLeft > 290 && secsLeft < 310));

      // Last checked
      const lastMin = minutes < 30 ? 0 : 30;
      const diffMin = minutes - lastMin;
      const diffSec = diffMin * 60 + seconds;

      if (diffMin === 0 && diffSec < 60) {
        setLastChecked('just now');
      } else if (diffMin < 2) {
        setLastChecked(`${diffSec}s ago`);
      } else {
        setLastChecked(`${diffMin}m ago`);
      }
    };

    calculateTimes();
    const interval = setInterval(calculateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      padding: '10px 20px',
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      flexWrap: 'wrap',
      marginBottom: 32,
    }}>
      {/* Next Check */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 8, height: 8,
          borderRadius: '50%',
          background: isChecking ? 'var(--yellow)' : 'var(--accent)',
          animation: 'pulse 2s infinite',
          flexShrink: 0,
        }} />
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Next Check
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: isChecking ? 'var(--yellow)' : 'var(--accent)' }}>
            {isChecking ? '⟳ Checking...' : `⏱ ${timeUntilNext}`}
          </div>
        </div>
      </div>

      <div style={{ width: 1, height: 32, background: 'var(--border)' }} />

      {/* Last Checked */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>✅</span>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Last Checked
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            {lastChecked}
          </div>
        </div>
      </div>

      <div style={{ width: 1, height: 32, background: 'var(--border)' }} />

      {/* Check Interval */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>🤖</span>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            AI Validators
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            5 nodes
          </div>
        </div>
      </div>

      <div style={{ width: 1, height: 32, background: 'var(--border)' }} />

      {/* Network */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>⛓</span>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Network
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            Bradbury
          </div>
        </div>
      </div>
    </div>
  );
}