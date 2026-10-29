/**
 * HUD – Heads Up Display
 *
 * Pure DOM overlay rendered above the WebGL canvas.
 * Composed of corner panels as per UI Requirements:
 *
 *   Top-Left    → Mission Status + Objectives
 *   Top-Right   → Health + Threat Level
 *   Bottom-Left → Score + Time
 *   Bottom-Right→ Crystals + Nodes
 *   Center      → Context Action prompt
 *   Notifications → Floating toast messages
 */

import { useEffect, useRef } from 'react';
import { REQUIRED_CRYSTALS, REQUIRED_NODES, MAX_HEALTH, MISSION_STATES } from '../../systems/useGameStore';

// ── Utility ────────────────────────────────────────────────────────────────────
function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Top Left: Mission Panel ────────────────────────────────────────────────────
function MissionPanel({ state }) {
  const { missionProgress, crystalsCollected, nodesRestored, extractionUnlocked } = state;

  const objectives = [
    {
      label: `COLLECT DATA CRYSTALS`,
      sub: `${crystalsCollected} / ${REQUIRED_CRYSTALS}`,
      done: crystalsCollected >= REQUIRED_CRYSTALS,
    },
    {
      label: `RESTORE SERVER NODES`,
      sub: `${nodesRestored} / ${REQUIRED_NODES}`,
      done: nodesRestored >= REQUIRED_NODES,
    },
    {
      label: `REACH EXTRACTION ZONE`,
      sub: extractionUnlocked ? 'UNLOCKED' : 'LOCKED',
      done: extractionUnlocked,
    },
  ];

  return (
    <div
      className="hud-panel hud-panel--cyan hud-panel-mission"
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        width: 260,
        padding: '12px 16px',
        animation: 'slideInLeft 0.4s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span className="status-dot status-dot--active" />
        <span className="font-display" style={{ color: 'var(--color-cyan)', fontSize: 10, letterSpacing: '0.15em' }}>
          MISSION STATUS
        </span>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>RECOVERY PROGRESS</span>
          <span style={{ color: 'var(--color-cyan)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {missionProgress}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill progress-bar__fill--cyan" style={{ width: `${missionProgress}%` }} />
        </div>
      </div>

      <div className="hud-divider" />

      {/* Objectives */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {objectives.map((obj) => (
          <div key={obj.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{
              width: 14, height: 14, marginTop: 1, flexShrink: 0,
              borderRadius: 2,
              background: obj.done ? 'var(--color-green)' : 'transparent',
              border: `1px solid ${obj.done ? 'var(--color-green)' : 'var(--color-border-bright)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: 'var(--color-bg)',
            }}>
              {obj.done ? '✓' : ''}
            </span>
            <div>
              <div style={{ color: obj.done ? 'var(--color-green)' : 'var(--color-text-primary)', fontSize: 11, lineHeight: 1.3 }}>
                {obj.label}
              </div>
              <div style={{ color: obj.done ? 'var(--color-green)' : 'var(--color-text-secondary)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                {obj.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Top Right: Status Panel ────────────────────────────────────────────────────
function StatusPanel({ state }) {
  const { health, threatLevel, elapsedTime } = state;
  const healthPct  = (health / MAX_HEALTH) * 100;
  const healthColor = health > 60 ? 'green' : health > 30 ? 'orange' : 'red';
  const threatColor = threatLevel > 70 ? 'red' : threatLevel > 30 ? 'orange' : 'cyan';

  const threatLabel =
    threatLevel > 70 ? 'CRITICAL' :
    threatLevel > 30 ? 'ELEVATED' :
    'LOW';

  return (
    <div
      className={`hud-panel hud-panel--${healthColor} hud-panel-status`}
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 230,
        padding: '12px 16px',
        animation: 'slideInRight 0.4s ease',
      }}
    >
      {/* Health */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span className={`status-dot status-dot--${healthColor === 'green' ? 'active' : healthColor === 'orange' ? 'warning' : 'danger'}`} />
        <span className="font-display" style={{ color: `var(--color-${healthColor})`, fontSize: 10, letterSpacing: '0.15em' }}>
          UNIT INTEGRITY
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>HEALTH</span>
        <span style={{ color: `var(--color-${healthColor})`, fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          {health}<span style={{ fontSize: 11 }}>/{MAX_HEALTH}</span>
        </span>
      </div>
      <div className="progress-bar" style={{ marginBottom: 12 }}>
        <div className={`progress-bar__fill progress-bar__fill--${healthColor}`} style={{ width: `${healthPct}%` }} />
      </div>

      <div className="hud-divider" />

      {/* Threat */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, marginTop: 8 }}>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>THREAT LEVEL</span>
        <span style={{ color: `var(--color-${threatColor})`, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
          {threatLabel}
        </span>
      </div>
      <div className="progress-bar" style={{ marginBottom: 10 }}>
        <div className={`progress-bar__fill progress-bar__fill--${threatColor}`} style={{ width: `${threatLevel}%` }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--color-text-dim)', fontSize: 10 }}>TIME ELAPSED</span>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          {formatTime(elapsedTime)}
        </span>
      </div>
    </div>
  );
}

// ── Bottom Left: Score Panel ───────────────────────────────────────────────────
function ScorePanel({ state }) {
  const { score } = state;
  return (
    <div
      className="hud-panel hud-panel-score"
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        padding: '10px 16px',
        minWidth: 160,
        animation: 'slideInLeft 0.5s ease',
      }}
    >
      <div style={{ color: 'var(--color-text-dim)', fontSize: 10, letterSpacing: '0.12em', marginBottom: 4 }}>RECOVERY SCORE</div>
      <div style={{ color: 'var(--color-cyan)', fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.05em' }}>
        {score.toLocaleString()}
      </div>
      <div style={{ color: 'var(--color-text-dim)', fontSize: 9, marginTop: 2 }}>PTS</div>
    </div>
  );
}

// ── Bottom Right: Collect Panel ────────────────────────────────────────────────
function CollectPanel({ state }) {
  const { crystalsCollected, nodesRestored } = state;

  return (
    <div
      className="hud-panel hud-panel-collect"
      style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        padding: '10px 16px',
        minWidth: 200,
        animation: 'slideInRight 0.5s ease',
      }}
    >
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Crystals */}
        <div>
          <div style={{ color: 'var(--color-text-dim)', fontSize: 9, letterSpacing: '0.1em', marginBottom: 4 }}>DATA CRYSTALS</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: REQUIRED_CRYSTALS }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 14, height: 14,
                  background: i < crystalsCollected ? 'var(--color-cyan)' : 'transparent',
                  border: `1px solid ${i < crystalsCollected ? 'var(--color-cyan)' : 'var(--color-border-bright)'}`,
                  borderRadius: 2,
                  boxShadow: i < crystalsCollected ? 'var(--glow-cyan)' : 'none',
                  transform: 'rotate(45deg)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
          <div style={{ color: 'var(--color-cyan)', fontSize: 12, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
            {crystalsCollected} / {REQUIRED_CRYSTALS}
          </div>
        </div>

        <div style={{ width: 1, background: 'var(--color-border)', margin: '0 4px' }} />

        {/* Nodes */}
        <div>
          <div style={{ color: 'var(--color-text-dim)', fontSize: 9, letterSpacing: '0.1em', marginBottom: 4 }}>NODES RESTORED</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: REQUIRED_NODES }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 14, height: 14,
                  background: i < nodesRestored ? 'var(--color-green)' : 'transparent',
                  border: `1px solid ${i < nodesRestored ? 'var(--color-green)' : 'var(--color-border-bright)'}`,
                  borderRadius: 2,
                  boxShadow: i < nodesRestored ? 'var(--glow-green)' : 'none',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
          <div style={{ color: 'var(--color-green)', fontSize: 12, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
            {nodesRestored} / {REQUIRED_NODES}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Center: Context Action ─────────────────────────────────────────────────────
function ContextAction({ action }) {
  if (!action) return null;
  return (
    <div className="hud-context-action" style={{
      position: 'absolute',
      bottom: 90,
      left: '50%',
      transform: 'translateX(-50%)',
      animation: 'slideInUp 0.25s ease',
    }}>
      <div className="hud-panel hud-panel--cyan" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          background: 'rgba(0,200,255,0.15)',
          border: '1px solid var(--color-cyan)',
          color: 'var(--color-cyan)',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em',
        }}>
          [E]
        </span>
        <span style={{ color: 'var(--color-text-primary)', fontSize: 13, letterSpacing: '0.08em' }}>
          {action.label}
        </span>
      </div>
    </div>
  );
}

// ── Notification Toast ─────────────────────────────────────────────────────────
function Notification({ notification, onClear }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (notification) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { onClear?.(); }, 2500);
    }
    return () => clearTimeout(timerRef.current);
  }, [notification, onClear]);

  if (!notification) return null;

  const colorMap = {
    cyan:  { bg: 'rgba(0,200,255,0.1)',   border: 'rgba(0,200,255,0.4)',   text: 'var(--color-cyan)' },
    green: { bg: 'rgba(0,255,157,0.1)',   border: 'rgba(0,255,157,0.4)',   text: 'var(--color-green)' },
    red:   { bg: 'rgba(255,45,74,0.1)',   border: 'rgba(255,45,74,0.4)',   text: 'var(--color-red)' },
    orange:{ bg: 'rgba(255,140,0,0.1)',   border: 'rgba(255,140,0,0.4)',   text: 'var(--color-orange)' },
  };
  const c = colorMap[notification.type] || colorMap.cyan;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 6,
      padding: '10px 20px',
      backdropFilter: 'blur(8px)',
      animation: 'slideInDown 0.25s ease',
      pointerEvents: 'none',
    }}>
      <span style={{ color: c.text, fontSize: 13, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
        {notification.message}
      </span>
    </div>
  );
}

// ── Controls Reference ─────────────────────────────────────────────────────────
function Controls() {
  return (
    <div className="hud-controls" style={{
      position: 'absolute',
      bottom: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 16,
      pointerEvents: 'none',
    }}>
      {[
        ['WASD', 'MOVE'],
        ['E', 'INTERACT'],
        ['ESC', 'TERMINAL'],
      ].map(([key, label]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            padding: '2px 8px',
            borderRadius: 3,
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
          }}>{key}</span>
          <span style={{ color: 'var(--color-text-dim)', fontSize: 10 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Root HUD Component ─────────────────────────────────────────────────────────
export default function HUD({ state, actions }) {
  if (state.missionState !== MISSION_STATES.PLAYING) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
      <MissionPanel state={state} />
      <StatusPanel  state={state} />
      <ScorePanel   state={state} />
      <CollectPanel state={state} />
      <ContextAction action={state.contextAction} />
      <Notification notification={state.notification} onClear={actions.clearNotification} />
      <Controls />
    </div>
  );
}
