// components/Navbar.jsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar({ account, onConnect }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shortAddr = account 
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: scrolled ? 'rgba(6,6,8,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div className="page-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--accent)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}>
            🐕
          </div>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            fontSize: 20,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}>
            WATCHDOG
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--accent)',
            background: 'var(--accent-dim)',
            padding: '2px 6px',
            borderRadius: 3,
            border: '1px solid rgba(0,255,136,0.2)',
          }}>
            BETA
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { href: '/', label: 'Monitor' },
            { href: '/dashboard', label: 'Dashboard' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: '6px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: router.pathname === href ? 'var(--accent)' : 'var(--text-muted)',
                textDecoration: 'none',
                borderRadius: 4,
                background: router.pathname === href ? 'var(--accent-dim)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </Link>
          ))}

          {/* Wallet Button */}
          <button
            onClick={onConnect}
            style={{
              marginLeft: 8,
              padding: '7px 16px',
              background: account ? 'var(--accent-dim)' : 'var(--accent)',
              color: account ? 'var(--accent)' : 'var(--bg)',
              border: account ? '1px solid rgba(0,255,136,0.3)' : 'none',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
          >
            {account ? `⬡ ${shortAddr}` : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </nav>
  );
}
