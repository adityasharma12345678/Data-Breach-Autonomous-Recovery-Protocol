/* eslint-disable react-refresh/only-export-components */

/**
 * useGameStore – Central game state store using React context + useReducer.
 *
 * This is the single source of truth for all runtime game state.
 * Systems and components read from and dispatch to this store.
 */

import { createContext, useContext, useReducer, useMemo } from 'react';

// ── Initial State ─────────────────────────────────────────────────────────────

export const MISSION_STATES = {
  IDLE:       'IDLE',
  PLAYING:    'PLAYING',
  WIN:        'WIN',
  LOSE:       'LOSE',
};

export const REQUIRED_CRYSTALS = 5;
export const REQUIRED_NODES    = 3;
export const MAX_HEALTH        = 100;

const initialState = {
  // Mission
  missionState:      MISSION_STATES.IDLE,
  missionProgress:   0,          // 0–100
  elapsedTime:       0,

  // Player stats
  health:            MAX_HEALTH,
  score:             0,
  crystalsCollected: 0,
  nodesRestored:     0,
  threatLevel:       0,          // 0–100

  // Objectives
  extractionUnlocked: false,

  // Notifications / context actions
  contextAction:     null,       // { label, key } | null
  notification:      null,       // { message, type } | null

  // Terminal overlay
  terminalOpen:      false,
  terminalData:      null,
};

// ── Actions ───────────────────────────────────────────────────────────────────

export const ACTIONS = {
  START_MISSION:        'START_MISSION',
  COLLECT_CRYSTAL:      'COLLECT_CRYSTAL',
  RESTORE_NODE:         'RESTORE_NODE',
  DAMAGE_PLAYER:        'DAMAGE_PLAYER',
  HEAL_PLAYER:          'HEAL_PLAYER',
  SET_THREAT:           'SET_THREAT',
  TICK_TIME:            'TICK_TIME',
  WIN:                  'WIN',
  LOSE:                 'LOSE',
  RESTART:              'RESTART',
  SET_CONTEXT_ACTION:   'SET_CONTEXT_ACTION',
  CLEAR_CONTEXT_ACTION: 'CLEAR_CONTEXT_ACTION',
  SHOW_NOTIFICATION:    'SHOW_NOTIFICATION',
  CLEAR_NOTIFICATION:   'CLEAR_NOTIFICATION',
  OPEN_TERMINAL:        'OPEN_TERMINAL',
  CLOSE_TERMINAL:       'CLOSE_TERMINAL',
};

// ── Reducer ───────────────────────────────────────────────────────────────────

function computeProgress(state) {
  const crystalPct  = (state.crystalsCollected / REQUIRED_CRYSTALS) * 50;
  const nodePct     = (state.nodesRestored     / REQUIRED_NODES)    * 30;
  const extractPct  = state.extractionUnlocked ? 20 : 0;
  return Math.min(100, Math.round(crystalPct + nodePct + extractPct));
}

function reducer(state, action) {
  switch (action.type) {

    case ACTIONS.START_MISSION:
      return {
        ...initialState,
        missionState: MISSION_STATES.PLAYING,
      };

    case ACTIONS.COLLECT_CRYSTAL: {
      if (state.missionState !== MISSION_STATES.PLAYING ||
          state.crystalsCollected >= REQUIRED_CRYSTALS) return state;
      const crystalsCollected = Math.min(
        state.crystalsCollected + 1,
        REQUIRED_CRYSTALS
      );
      const score = state.score + 150;
      const next = { ...state, crystalsCollected, score };
      const missionProgress = computeProgress(next);
      const extractionUnlocked =
        crystalsCollected >= REQUIRED_CRYSTALS &&
        next.nodesRestored >= REQUIRED_NODES;
      return {
        ...next,
        missionProgress,
        extractionUnlocked,
        notification: { message: '+150 DATA FRAGMENT ACQUIRED', type: 'cyan' },
      };
    }

    case ACTIONS.RESTORE_NODE: {
      if (state.missionState !== MISSION_STATES.PLAYING ||
          state.nodesRestored >= REQUIRED_NODES) return state;
      const nodesRestored = Math.min(
        state.nodesRestored + 1,
        REQUIRED_NODES
      );
      const score = state.score + 300;
      const next = { ...state, nodesRestored, score };
      const missionProgress = computeProgress(next);
      const extractionUnlocked =
        next.crystalsCollected >= REQUIRED_CRYSTALS &&
        nodesRestored >= REQUIRED_NODES;
      return {
        ...next,
        missionProgress,
        extractionUnlocked,
        notification: { message: 'NODE RESTORED — NETWORK STABILITY +12%', type: 'green' },
      };
    }

    case ACTIONS.DAMAGE_PLAYER: {
      if (state.missionState !== MISSION_STATES.PLAYING) return state;
      const health = Math.max(0, state.health - action.amount);
      if (health <= 0) {
        return { ...state, health: 0, missionState: MISSION_STATES.LOSE };
      }
      return { ...state, health };
    }

    case ACTIONS.HEAL_PLAYER: {
      const health = Math.min(MAX_HEALTH, state.health + action.amount);
      return { ...state, health };
    }

    case ACTIONS.SET_THREAT:
      if (state.threatLevel === action.level) return state;
      return { ...state, threatLevel: action.level };

    case ACTIONS.TICK_TIME:
      return state.missionState === MISSION_STATES.PLAYING
        ? { ...state, elapsedTime: state.elapsedTime + 1 }
        : state;

    case ACTIONS.WIN:
      if (state.missionState !== MISSION_STATES.PLAYING || !state.extractionUnlocked) return state;
      return {
        ...state,
        missionState:    MISSION_STATES.WIN,
        missionProgress: 100,
        extractionUnlocked: true,
        score: state.score + 1000,
      };

    case ACTIONS.LOSE:
      return { ...state, missionState: MISSION_STATES.LOSE };

    case ACTIONS.RESTART:
      return { ...initialState };

    case ACTIONS.SET_CONTEXT_ACTION:
      return { ...state, contextAction: action.payload };

    case ACTIONS.CLEAR_CONTEXT_ACTION:
      return { ...state, contextAction: null };

    case ACTIONS.SHOW_NOTIFICATION:
      return { ...state, notification: action.payload };

    case ACTIONS.CLEAR_NOTIFICATION:
      return { ...state, notification: null };

    case ACTIONS.OPEN_TERMINAL:
      return { ...state, terminalOpen: true, terminalData: action.payload };

    case ACTIONS.CLOSE_TERMINAL:
      return { ...state, terminalOpen: false, terminalData: null };

    default:
      return state;
  }
}

// ── Context + Provider ────────────────────────────────────────────────────────

const GameStoreContext = createContext(null);

export function GameStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(() => ({
    startMission:      () => dispatch({ type: ACTIONS.START_MISSION }),
    collectCrystal:    () => dispatch({ type: ACTIONS.COLLECT_CRYSTAL }),
    restoreNode:       () => dispatch({ type: ACTIONS.RESTORE_NODE }),
    damagePlayer:      (amount) => dispatch({ type: ACTIONS.DAMAGE_PLAYER, amount }),
    healPlayer:        (amount) => dispatch({ type: ACTIONS.HEAL_PLAYER, amount }),
    setThreat:         (level) => dispatch({ type: ACTIONS.SET_THREAT, level }),
    tickTime:          () => dispatch({ type: ACTIONS.TICK_TIME }),
    win:               () => dispatch({ type: ACTIONS.WIN }),
    lose:              () => dispatch({ type: ACTIONS.LOSE }),
    restart:           () => dispatch({ type: ACTIONS.RESTART }),
    setContextAction:  (payload) => dispatch({ type: ACTIONS.SET_CONTEXT_ACTION, payload }),
    clearContextAction:() => dispatch({ type: ACTIONS.CLEAR_CONTEXT_ACTION }),
    showNotification:  (payload) => dispatch({ type: ACTIONS.SHOW_NOTIFICATION, payload }),
    clearNotification:() => dispatch({ type: ACTIONS.CLEAR_NOTIFICATION }),
    openTerminal:      (payload) => dispatch({ type: ACTIONS.OPEN_TERMINAL, payload }),
    closeTerminal:     () => dispatch({ type: ACTIONS.CLOSE_TERMINAL }),
  }), [dispatch]);

  return (
    <GameStoreContext.Provider value={{ state, actions }}>
      {children}
    </GameStoreContext.Provider>
  );
}

/** Hook: consume the game store in any component */
export function useGameStore() {
  const ctx = useContext(GameStoreContext);
  if (!ctx) throw new Error('useGameStore must be used inside <GameStoreProvider>');
  return ctx;
}
