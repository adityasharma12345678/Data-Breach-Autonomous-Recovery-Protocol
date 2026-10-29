/**
 * TerminalOverlay – AI Diagnostic Terminal UI (WOW Feature)
 *
 * Renders a full-screen, DOM-based cyberpunk terminal interface
 * when the player accesses an in-world terminal.
 *
 * Features:
 * - Animated typewriter boot sequence
 * - Live-updating diagnostic metrics (simulated, no real AI needed)
 * - Scrolling log feed
 * - Threat analysis readout
 * - Data integrity scan
 * - Corruption map visualization
 * - "Close" via ESC or button
 *
 * This is the single most memorable feature of the project.
 * It creates the impression of an intelligent, live system.
 */

import { useState, useEffect, useMemo, useRef } from 'react';

// ── Simulated data generators ──────────────────────────────────────────────────

const THREAT_LEVELS = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
const LOG_TEMPLATES = [
  'Unauthorized access attempt detected on subnet 192.168.{a}.{b}',
  'Firewall rule #{n} triggered — packet drop initiated',
  'Memory corruption detected at address 0x{hex}',
  'Recovery daemon restarting service: {svc}',
  'Encryption key rotation completed for sector {n}',
  'Anomaly signature {sig} matched in threat database',
  'Data integrity checksum verified: {hash}',
  'Network traffic spike detected — analyzing payload',
  'Self-healing protocol activated for node #{n}',
  'Rogue process terminated: PID {n}',
  'Backup verification complete — 99.{n}% integrity',
  'AI recovery module loaded — version 4.{n}.{n}',
];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randHex(len) { return Array.from({length: len}, () => rand(0, 15).toString(16)).join('').toUpperCase(); }

function generateLog() {
  const tpl = LOG_TEMPLATES[rand(0, LOG_TEMPLATES.length - 1)];
  return tpl
    .replace('{a}', rand(0, 255))
    .replace('{b}', rand(0, 255))
    .replace(/{n}/g, () => rand(100, 999))
    .replace('{hex}', '0x' + randHex(8))
    .replace('{svc}', ['auth.service', 'net-monitor', 'data-relay', 'integrity-check'][rand(0, 3)])
    .replace('{sig}', 'SIG-' + randHex(4))
    .replace('{hash}', randHex(8) + '...' + randHex(4));
}

function generateMetrics(state) {
  return {
    networkStability:  Math.min(100, state.missionProgress + rand(5, 15)),
    dataIntegrity:     55 + state.crystalsCollected * 8 + rand(-3, 3),
    corruptionLevel:   Math.max(0, 80 - state.missionProgress - rand(0, 10)),
    threatLevel:       THREAT_LEVELS[Math.min(3, Math.floor(state.threatLevel / 25))],
    nodesOnline:       state.nodesRestored,
    nodesTotal:        3,
    activeProcesses:   rand(14, 32),
    memoryUsage:       rand(42, 78),
    encryptionStrength: rand(90, 99),
    aiConfidence:      65 + state.missionProgress * 0.3 + rand(-5, 5),
  };
}

// ── Boot sequence lines ────────────────────────────────────────────────────────

const BOOT_LINES = [
  '> AUTONOMOUS RECOVERY PROTOCOL v4.2.1',
  '> INITIALIZING AI DIAGNOSTIC ENGINE...',
  '> LOADING THREAT ASSESSMENT MODULE......... OK',
  '> CONNECTING TO FACILITY MAINFRAME......... OK',
  '> SCANNING NETWORK TOPOLOGY................',
  '> 47 ACTIVE NODES DETECTED — 12 OFFLINE',
  '> CORRUPTION SIGNATURE: ROGUE-AI-CLASS-IV',
  '> INITIATING RECOVERY SEQUENCE.............',
  '> SYSTEM READY. AWAITING ENGINEER INPUT.',
];

// ── Subcomponents ─────────────────────────────────────────────────────────────

function MetricBar({ label, value, max = 100, color = 'cyan' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>{label}</span>
        <span style={{ color: `var(--color-${color})`, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          {typeof value === 'number' ? value.toFixed(1) : value}%
        </span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-bar__fill progress-bar__fill--${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CorruptionMap({ corruptionLevel }) {
  const rows = 6;
  const cols = 12;
  const cells = Array.from({ length: rows * cols }, (_, i) => {
    const wave = (Math.sin((i + 1) * 1.73 + corruptionLevel * 0.35) + 1) / 2;
    const threshold = corruptionLevel / 100;
    if (wave < threshold * 0.7) return 'corrupt';
    if (wave < threshold * 1.05) return 'warning';
    return 'ok';
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2 }}>
      {cells.map((state, i) => (
        <div
          key={i}
          style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: 1,
            background:
              state === 'corrupt' ? 'rgba(255,45,74,0.7)' :
              state === 'warning' ? 'rgba(255,140,0,0.5)' :
              'rgba(0,200,255,0.2)',
            transition: 'background 0.5s',
          }}
        />
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function TerminalOverlay({ gameState, onClose }) {
  const [bootDone, setBootDone]       = useState(false);
  const [bootLines, setBootLines]     = useState([]);
  const [logs, setLogs]               = useState([]);
  const [tab, setTab]                 = useState('diagnostics');
  const logsRef                       = useRef(null);
  const metrics = useMemo(() => (bootDone ? generateMetrics(gameState) : null), [bootDone, gameState]);
  const sessionCode = useMemo(() => {
    const seed = ((gameState.missionProgress * 17) + (gameState.crystalsCollected * 11) + (gameState.nodesRestored * 7)) % 999;
    return `RECOVERY-${seed.toString(16).toUpperCase().padStart(3, '0')}`;
  }, [gameState.missionProgress, gameState.crystalsCollected, gameState.nodesRestored]);

  // Boot animation
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setBootLines((prev) => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBootDone(true), 400);
      }
    }, 220);
    return () => clearInterval(interval);
  }, []);

  // Live log feed
  useEffect(() => {
    if (!bootDone) return;
    const interval = setInterval(() => {
      const ts = new Date().toISOString().slice(11, 19);
      setLogs((prev) => [
        { ts, msg: generateLog(), level: ['INFO', 'WARN', 'ERROR'][rand(0, 2)] },
        ...prev.slice(0, 29),
      ]);
    }, 800);
    return () => clearInterval(interval);
  }, [bootDone]);

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.code === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const logColor = { INFO: 'var(--color-cyan)', WARN: 'var(--color-orange)', ERROR: 'var(--color-red)' };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
      fontFamily: 'var(--font-mono)',
    }}>
      {/* CRT scanline overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,200,255,0.03) 2px, rgba(0,200,255,0.03) 4px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '92%',
        maxWidth: 1100,
        maxHeight: '90vh',
        background: 'linear-gradient(135deg, rgba(2,8,16,0.98), rgba(3,15,30,0.98))',
        border: '1px solid var(--color-border-bright)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--glow-cyan), 0 40px 80px rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Title bar ──────────────────────────────────────── */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0,200,255,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="status-dot status-dot--active" />
            <span style={{ color: 'var(--color-cyan)', fontSize: 13, letterSpacing: '0.15em' }}>
              FACILITY AI DIAGNOSTIC TERMINAL
            </span>
            <span style={{ color: 'var(--color-text-dim)', fontSize: 11 }}>
              UNIT: RECOVERY-01 | SESSION: {sessionCode}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,45,74,0.15)',
              border: '1px solid rgba(255,45,74,0.4)',
              color: 'var(--color-red)',
              padding: '4px 14px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            [ESC] DISCONNECT
          </button>
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: 1,
          background: 'rgba(0,0,0,0.4)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {['diagnostics', 'threat', 'logs'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '9px 0',
                background: tab === t ? 'rgba(0,200,255,0.08)' : 'transparent',
                border: 'none',
                borderBottom: tab === t ? '2px solid var(--color-cyan)' : '2px solid transparent',
                color: tab === t ? 'var(--color-cyan)' : 'var(--color-text-dim)',
                cursor: 'pointer',
                fontSize: 11,
                letterSpacing: '0.12em',
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.2s',
              }}
            >
              [{t.toUpperCase()}]
            </button>
          ))}
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>

          {/* Boot sequence */}
          {!bootDone && (
            <div>
              {bootLines.map((line, i) => (
                <div key={i} style={{ color: 'var(--color-cyan)', fontSize: 13, lineHeight: 1.8 }}>
                  {line}
                  {i === bootLines.length - 1 && (
                    <span style={{ animation: 'blinkCaret 0.8s infinite' }}>█</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* DIAGNOSTICS TAB */}
          {bootDone && tab === 'diagnostics' && metrics && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Left */}
              <div>
                <div style={{ color: 'var(--color-cyan)', fontSize: 12, letterSpacing: '0.12em', marginBottom: 14 }}>
                  ─── SYSTEM METRICS ───────────────────────
                </div>
                <MetricBar label="NETWORK STABILITY"   value={metrics.networkStability}   color="cyan" />
                <MetricBar label="DATA INTEGRITY"       value={metrics.dataIntegrity}       color="green" />
                <MetricBar label="CORRUPTION LEVEL"     value={metrics.corruptionLevel}     color="red" />
                <MetricBar label="AI CONFIDENCE"        value={metrics.aiConfidence}        color="blue" />
                <MetricBar label="MEMORY USAGE"         value={metrics.memoryUsage}         color="orange" />
                <MetricBar label="ENCRYPTION STRENGTH"  value={metrics.encryptionStrength}  color="cyan" />

                <div style={{ marginTop: 20, color: 'var(--color-cyan)', fontSize: 12, letterSpacing: '0.12em', marginBottom: 14 }}>
                  ─── NODE STATUS ──────────────────────────
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const restored = i < metrics.nodesOnline;
                    const color    = restored ? 'var(--color-green)' : 'var(--color-red)';
                    return (
                      <div key={i} style={{
                        width: 36, height: 36,
                        border: `1px solid ${color}`,
                        borderRadius: 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color, fontSize: 10,
                        background: restored ? 'rgba(0,255,157,0.08)' : 'rgba(255,45,74,0.08)',
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right */}
              <div>
                <div style={{ color: 'var(--color-red)', fontSize: 12, letterSpacing: '0.12em', marginBottom: 14 }}>
                  ─── CORRUPTION MAP ───────────────────────
                </div>
                <CorruptionMap corruptionLevel={metrics.corruptionLevel} />

                <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'THREAT LEVEL',     value: metrics.threatLevel,     color: 'var(--color-red)' },
                    { label: 'ACTIVE PROCS',     value: metrics.activeProcesses, color: 'var(--color-cyan)' },
                    { label: 'NODES RESTORED',   value: `${metrics.nodesOnline}/${metrics.nodesTotal}`, color: 'var(--color-green)' },
                    { label: 'RECOVERY PROG.',   value: `${gameState.missionProgress}%`, color: 'var(--color-blue)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      padding: 12,
                      border: '1px solid var(--color-border)',
                      borderRadius: 6,
                      background: 'rgba(0,0,0,0.3)',
                    }}>
                      <div style={{ color: 'var(--color-text-dim)', fontSize: 10, marginBottom: 6 }}>{label}</div>
                      <div style={{ color, fontSize: 18, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* THREAT TAB */}
          {bootDone && tab === 'threat' && metrics && (
            <div>
              <div style={{ color: 'var(--color-red)', fontSize: 12, letterSpacing: '0.12em', marginBottom: 20 }}>
                ─── THREAT ANALYSIS REPORT ──────────────────────────────────
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  {[
                    { label: 'THREAT CLASSIFICATION', value: 'ROGUE-AI-CLASS-IV', color: 'var(--color-red)' },
                    { label: 'ATTACK VECTOR',         value: 'NETWORK INFILTRATION', color: 'var(--color-orange)' },
                    { label: 'AFFECTED SUBSYSTEMS',   value: '14 / 47', color: 'var(--color-orange)' },
                    { label: 'ESTIMATED ORIGIN',      value: 'SECTOR-7G', color: 'var(--color-cyan)' },
                    { label: 'PROPAGATION RATE',      value: '2.3 NODES/MIN', color: 'var(--color-red)' },
                    { label: 'COUNTERMEASURE ETA',    value: `${Math.max(0, 8 - gameState.nodesRestored * 2)} MINUTES`, color: 'var(--color-green)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(0,200,255,0.08)',
                    }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{label}</span>
                      <span style={{ color, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ color: 'var(--color-orange)', fontSize: 11, marginBottom: 12 }}>ACTIVE SIGNATURES:</div>
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} style={{
                      padding: '6px 10px',
                      marginBottom: 6,
                      background: 'rgba(255,45,74,0.06)',
                      border: '1px solid rgba(255,45,74,0.2)',
                      borderRadius: 4,
                      display: 'flex', justifyContent: 'space-between',
                    }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>
                        SIG-{randHex(4)}
                      </span>
                      <span style={{ color: 'var(--color-red)', fontSize: 11 }}>ACTIVE</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LOGS TAB */}
          {bootDone && tab === 'logs' && (
            <div ref={logsRef}>
              <div style={{ color: 'var(--color-cyan)', fontSize: 12, letterSpacing: '0.12em', marginBottom: 14 }}>
                ─── SYSTEM EVENT LOG (LIVE) ──────────────────────────────────
              </div>
              {logs.map((log, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10,
                  padding: '3px 0',
                  borderBottom: '1px solid rgba(0,200,255,0.04)',
                  animation: i === 0 ? 'slideInDown 0.2s ease' : 'none',
                }}>
                  <span style={{ color: 'var(--color-text-dim)', fontSize: 11, flexShrink: 0 }}>{log.ts}</span>
                  <span style={{ color: logColor[log.level], fontSize: 11, width: 40, flexShrink: 0 }}>[{log.level}]</span>
                  <span style={{ color: 'var(--color-text-primary)', fontSize: 11 }}>{log.msg}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <span style={{ color: 'var(--color-text-dim)', fontSize: 12 }}>
                  AWAITING EVENTS...<span style={{ animation: 'blinkCaret 0.8s infinite' }}>█</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div style={{
          padding: '8px 20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.3)',
        }}>
          <span style={{ color: 'var(--color-text-dim)', fontSize: 10 }}>
            AUTONOMOUS RECOVERY PROTOCOL — CLASSIFIED FACILITY NETWORK
          </span>
          <span style={{ color: 'var(--color-cyan)', fontSize: 10 }}>
            RECOVERY PROGRESS: {gameState.missionProgress}%
          </span>
        </div>
      </div>
    </div>
  );
}
