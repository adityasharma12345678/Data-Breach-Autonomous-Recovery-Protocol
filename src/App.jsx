/**
 * App.jsx – Application root
 *
 * Provides the GameStore context and routes between:
 * - LandingPage  (IDLE)
 * - Game         (PLAYING)
 * - WinScreen    (WIN)
 * - LoseScreen   (LOSE)
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { useGameStore, GameStoreProvider, MISSION_STATES } from './systems/useGameStore';
import LandingPage from './pages/LandingPage';
import { WinScreen, LoseScreen } from './pages/EndScreens';

const loadGame = () => import('./Game');
const Game = lazy(loadGame);
const LAUNCH_STAGES = [
  'AUTONOMOUS RECOVERY PROTOCOL ACTIVATED',
  'CONNECTING RECOVERY SYSTEMS',
  'LOADING NAVIGATION GRID',
  'INITIALIZING THREAT ANALYSIS',
  'SYNCHRONIZING RECOVERY UNIT',
  'RECOVERY UNIT ONLINE',
];

function AppRouter() {
  const { state, actions } = useGameStore();
  const [launch, setLaunch] = useState(null);

  useEffect(() => {
    if (launch?.status !== 'loading') return undefined;

    let cancelled = false;
    const timeouts = [];
    const progressSequence = async () => {
      for (let stage = 1; stage < LAUNCH_STAGES.length; stage += 1) {
        await new Promise((resolve) => {
          timeouts.push(setTimeout(resolve, 380));
        });
        if (cancelled) return;
        setLaunch((current) =>
          current?.status === 'loading' ? { ...current, stage } : current
        );
      }
    };

    Promise.all([loadGame(), progressSequence()])
      .then(() => {
        if (cancelled) return;
        setLaunch(null);
        actions.startMission();
      })
      .catch((error) => {
        console.error('Unable to initialize the recovery mission.', error);
        if (!cancelled) {
          setLaunch({ status: 'error', stage: 0 });
        }
      });

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [launch?.status, actions]);

  return (
    <>
      {/* The 3D game canvas is always mounted when playing */}
      {state.missionState === MISSION_STATES.PLAYING && (
        <Suspense
          fallback={
            <div className="game-loading" role="status">
              <span>INITIALIZING RECOVERY SIMULATION</span>
              <span className="game-loading__detail">Preparing the facility renderer…</span>
            </div>
          }
        >
          <Game />
        </Suspense>
      )}

      {/* Background scene on landing */}
      {state.missionState === MISSION_STATES.IDLE && (
        <>
          <LandingPage onStart={() => setLaunch({ status: 'loading', stage: 0 })} />
          {launch && (
            <div className="launch-sequence" role="status" aria-live="polite">
              <div className="launch-sequence__panel">
                <span className="launch-sequence__eyebrow">RECOVERY SYSTEM BOOT</span>
                <h1 className="launch-sequence__title">SYSTEM INITIALIZATION</h1>
                <div className="launch-sequence__status">
                  <span className={`status-dot ${launch.status === 'error' ? 'status-dot--danger' : 'status-dot--active'}`} />
                  {launch.status === 'error'
                    ? 'INITIALIZATION INTERRUPTED'
                    : LAUNCH_STAGES[launch.stage]}
                </div>
                <div className="launch-sequence__track" aria-hidden="true">
                  <div
                    className="launch-sequence__progress"
                    style={{
                      width: launch.status === 'error'
                        ? '100%'
                        : `${((launch.stage + 1) / LAUNCH_STAGES.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="launch-sequence__steps" aria-hidden="true">
                  {LAUNCH_STAGES.slice(1).map((stage, index) => (
                    <span
                      key={stage}
                      className={index < launch.stage ? 'launch-sequence__step is-complete' : ''}
                    />
                  ))}
                </div>
                {launch.status === 'error' && (
                  <button
                    className="launch-sequence__retry"
                    onClick={() => setLaunch({ status: 'loading', stage: 0 })}
                  >
                    RETRY INITIALIZATION
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* End screens */}
      {state.missionState === MISSION_STATES.WIN && (
        <WinScreen state={state} onRestart={actions.restart} />
      )}
      {state.missionState === MISSION_STATES.LOSE && (
        <LoseScreen state={state} onRestart={actions.restart} />
      )}
    </>
  );
}

export default function App() {
  return (
    <GameStoreProvider>
      <AppRouter />
    </GameStoreProvider>
  );
}