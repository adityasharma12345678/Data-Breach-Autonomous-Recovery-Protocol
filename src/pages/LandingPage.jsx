/**
 * LandingPage – Pre-game cinematic intro screen
 *
 * Creates a strong first impression with:
 * - Animated glitch title
 * - Scrolling background grid
 * - Mission briefing text
 * - Animated start button
 * - Tech stack credits
 */

export default function LandingPage({ onStart }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at center, #040e1f 0%, #020810 60%, #010508 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      animation: 'fadeIn 0.5s ease',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'float 8s ease infinite',
      }} />

      {/* Corner decorations */}
      {[
        { top: 20, left: 20, borderTop: '2px solid', borderLeft: '2px solid' },
        { top: 20, right: 20, borderTop: '2px solid', borderRight: '2px solid' },
        { bottom: 20, left: 20, borderBottom: '2px solid', borderLeft: '2px solid' },
        { bottom: 20, right: 20, borderBottom: '2px solid', borderRight: '2px solid' },
      ].map((style, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 40, height: 40,
          borderColor: 'var(--color-cyan)',
          opacity: 0.4,
          ...style,
        }} />
      ))}

      {/* Status bar top */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: 'var(--color-text-dim)',
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.15em',
      }}>
        <span className="status-dot status-dot--active" />
        CLASSIFIED FACILITY NETWORK — RECOVERY PROTOCOL ACTIVE
        <span className="status-dot status-dot--active" />
      </div>

      {/* Main content */}
      <div style={{ position: 'relative', textAlign: 'center', zIndex: 1, maxWidth: 700, padding: '0 20px' }}>
        {/* Sub-label */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-cyan)',
          fontSize: 12,
          letterSpacing: '0.3em',
          marginBottom: 16,
          animation: 'slideInDown 0.6s ease',
        }}>
          AUTONOMOUS RECOVERY PROTOCOL v4.2.1
        </div>

        {/* Main title */}
        <div style={{
          position: 'relative',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          color: 'var(--color-white)',
          lineHeight: 1,
          marginBottom: 8,
          animation: 'slideInDown 0.5s ease',
        }}>
          <div style={{ fontSize: 'clamp(48px, 8vw, 96px)', letterSpacing: '-0.02em' }}>
            DATA BREACH
          </div>
          {/* Glitch overlay */}
          <div aria-hidden style={{
            position: 'absolute',
            inset: 0,
            fontSize: 'clamp(48px, 8vw, 96px)',
            letterSpacing: '-0.02em',
            color: 'var(--color-cyan)',
            opacity: 0.4,
            animation: 'glitch 4s infinite',
            pointerEvents: 'none',
          }}>
            DATA BREACH
          </div>
        </div>

        {/* Divider line */}
        <div style={{
          width: '100%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, var(--color-cyan), transparent)',
          margin: '12px 0',
          opacity: 0.6,
          animation: 'slideInDown 0.7s ease',
        }} />

        {/* Mission brief */}
        <div style={{
          fontFamily: 'var(--font-ui)',
          color: 'var(--color-text-secondary)',
          fontSize: 14,
          lineHeight: 1.8,
          marginBottom: 40,
          maxWidth: 520,
          margin: '0 auto 40px',
          animation: 'fadeIn 1.2s ease',
        }}>
          A rogue artificial intelligence has compromised a classified data facility.
          The automated recovery protocol has been activated.
          <br /><br />
          You are an <span style={{ color: 'var(--color-cyan)' }}>Autonomous AI Recovery Engineer</span>.
          Enter the facility, recover data fragments, restore corrupted infrastructure,
          and survive hostile security drones.
        </div>

        {/* Objectives quick list */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginBottom: 40,
          flexWrap: 'wrap',
          animation: 'fadeIn 1.4s ease',
        }}>
          {[
            { icon: '◈', label: 'Collect 5 Data Crystals', color: 'var(--color-cyan)' },
            { icon: '▣', label: 'Restore 3 Server Nodes',  color: 'var(--color-green)' },
            { icon: '⊕', label: 'Reach Extraction Zone',   color: 'var(--color-blue)' },
          ].map(({ icon, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color, fontSize: 16 }}>{icon}</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(0,200,255,0.15), rgba(26,127,255,0.1))',
            border: '1px solid var(--color-cyan)',
            color: 'var(--color-cyan)',
            padding: '16px 48px',
            fontSize: 14,
            letterSpacing: '0.25em',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            borderRadius: 6,
            cursor: 'pointer',
            boxShadow: 'var(--glow-cyan)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,200,255,0.3), rgba(26,127,255,0.2))';
            e.currentTarget.style.boxShadow  = '0 0 24px rgba(0,200,255,0.8), 0 0 60px rgba(0,200,255,0.3)';
            e.currentTarget.style.transform  = 'scale(1.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,200,255,0.15), rgba(26,127,255,0.1))';
            e.currentTarget.style.boxShadow  = 'var(--glow-cyan)';
            e.currentTarget.style.transform  = '';
          }}
        >
          INITIATE RECOVERY PROTOCOL
        </button>

        {/* Controls hint */}
        <div style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          color: 'var(--color-text-dim)',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          animation: 'fadeIn 2s ease',
        }}>
          {[['WASD', 'MOVE'], ['E', 'INTERACT'], ['ESC', 'TERMINAL']].map(([k, v]) => (
            <span key={k}>
              <span style={{ color: 'var(--color-text-secondary)' }}>[{k}]</span> {v}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom credits */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 24,
        color: 'var(--color-text-dim)',
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.1em',
        whiteSpace: 'nowrap',
      }}>
        <span>REACT + VITE</span>
        <span style={{ color: 'var(--color-border)' }}>|</span>
        <span>THREE.JS + R3F</span>
        <span style={{ color: 'var(--color-border)' }}>|</span>
        <span>Vi3W ASSETS</span>
        <span style={{ color: 'var(--color-border)' }}>|</span>
        <span>PROCEDURAL ENV</span>
      </div>
    </div>
  );
}
