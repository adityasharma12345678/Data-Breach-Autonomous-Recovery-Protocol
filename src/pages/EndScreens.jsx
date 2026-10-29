/**
 * WinScreen – Mission Complete screen
 * LoseScreen – Recovery Failure screen
 */

export function WinScreen({ state, onRestart }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at center, rgba(0,30,20,0.97) 0%, rgba(2,8,16,0.98) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 500,
      animation: 'fadeIn 0.8s ease',
    }}>
      {/* Rings */}
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        border: '1px solid rgba(0,255,157,0.15)',
        borderRadius: '50%',
        animation: 'rotateRing 8s linear infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: 300, height: 300,
        border: '1px solid rgba(0,255,157,0.25)',
        borderRadius: '50%',
        animation: 'rotateRing 5s linear infinite reverse',
      }} />

      <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-green)',
          fontSize: 12,
          letterSpacing: '0.3em',
          marginBottom: 16,
          animation: 'slideInDown 0.4s ease',
        }}>
          ✓ RECOVERY SUCCESSFUL
        </div>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(36px, 6vw, 72px)',
          color: 'var(--color-green)',
          textShadow: 'var(--glow-green)',
          letterSpacing: '-0.02em',
          marginBottom: 8,
          animation: 'slideInDown 0.5s ease',
        }}>
          MISSION COMPLETE
        </div>

        <div style={{
          fontFamily: 'var(--font-ui)',
          color: 'var(--color-text-secondary)',
          fontSize: 16,
          letterSpacing: '0.2em',
          marginBottom: 40,
          animation: 'fadeIn 0.8s ease',
        }}>
          DATA FACILITY RECOVERED
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 40,
          animation: 'slideInUp 0.6s ease',
        }}>
          {[
            { label: 'FINAL SCORE',       value: state.score.toLocaleString(), color: 'var(--color-cyan)' },
            { label: 'CRYSTALS',          value: `${state.crystalsCollected} / 5`, color: 'var(--color-cyan)' },
            { label: 'NODES RESTORED',    value: `${state.nodesRestored} / 3`,    color: 'var(--color-green)' },
            { label: 'TIME SURVIVED',     value: formatTime(state.elapsedTime),   color: 'var(--color-blue)' },
            { label: 'HEALTH REMAINING',  value: `${state.health}%`,              color: 'var(--color-green)' },
            { label: 'RECOVERY PROGRESS', value: '100%',                          color: 'var(--color-cyan)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="hud-panel" style={{ padding: '12px 16px' }}>
              <div style={{ color: 'var(--color-text-dim)', fontSize: 10, marginBottom: 4 }}>{label}</div>
              <div style={{ color, fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        <button onClick={onRestart} style={btnStyle('#00ff9d', 'rgba(0,255,157,0.15)')}>
          REINITIALIZE PROTOCOL
        </button>
      </div>
    </div>
  );
}

export function LoseScreen({ state, onRestart }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at center, rgba(30,0,10,0.97) 0%, rgba(2,8,16,0.98) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 500,
      animation: 'fadeIn 0.8s ease',
    }}>
      {/* Rings */}
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        border: '1px solid rgba(255,45,74,0.15)',
        borderRadius: '50%',
        animation: 'rotateRing 6s linear infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: 280, height: 280,
        border: '1px solid rgba(255,45,74,0.25)',
        borderRadius: '50%',
        animation: 'rotateRing 4s linear infinite reverse',
      }} />

      <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-red)',
          fontSize: 12,
          letterSpacing: '0.3em',
          marginBottom: 16,
          animation: 'pulse 1s infinite',
        }}>
          ✕ UNIT TERMINATED
        </div>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(36px, 6vw, 72px)',
          color: 'var(--color-red)',
          textShadow: 'var(--glow-red)',
          letterSpacing: '-0.02em',
          marginBottom: 8,
          animation: 'slideInDown 0.5s ease',
        }}>
          RECOVERY FAILURE
        </div>

        <div style={{
          fontFamily: 'var(--font-ui)',
          color: 'var(--color-text-secondary)',
          fontSize: 16,
          letterSpacing: '0.2em',
          marginBottom: 40,
          animation: 'fadeIn 0.8s ease',
        }}>
          AUTONOMOUS UNIT TERMINATED
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 40,
          animation: 'slideInUp 0.6s ease',
        }}>
          {[
            { label: 'FINAL SCORE',       value: state.score.toLocaleString(), color: 'var(--color-cyan)' },
            { label: 'CRYSTALS',          value: `${state.crystalsCollected} / 5`, color: 'var(--color-cyan)' },
            { label: 'NODES RESTORED',    value: `${state.nodesRestored} / 3`,    color: 'var(--color-green)' },
            { label: 'TIME SURVIVED',     value: formatTime(state.elapsedTime),   color: 'var(--color-orange)' },
            { label: 'CAUSE OF FAILURE',  value: 'DRONE ATTACK',                  color: 'var(--color-red)' },
            { label: 'RECOVERY PROGRESS', value: `${state.missionProgress}%`,     color: 'var(--color-cyan)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="hud-panel" style={{ padding: '12px 16px' }}>
              <div style={{ color: 'var(--color-text-dim)', fontSize: 10, marginBottom: 4 }}>{label}</div>
              <div style={{ color, fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        <button onClick={onRestart} style={btnStyle('#ff2d4a', 'rgba(255,45,74,0.15)')}>
          REBOOT RECOVERY UNIT
        </button>
      </div>
    </div>
  );
}

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function btnStyle(color, bg) {
  return {
    background: bg,
    border: `1px solid ${color}`,
    color,
    padding: '14px 44px',
    fontSize: 13,
    letterSpacing: '0.2em',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    borderRadius: 6,
    cursor: 'pointer',
    boxShadow: `0 0 16px ${color}66`,
    transition: 'all 0.2s',
  };
}
