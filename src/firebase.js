import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, update, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC5-zczlrpKkoWnF5REE5D-2CRhzkwJpC0",
  authDomain: "webdomingo-463e4.firebaseapp.com",
  databaseURL: "https://webdomingo-463e4-default-rtdb.firebaseio.com",
  projectId: "webdomingo-463e4",
  storageBucket: "webdomingo-463e4.firebasestorage.app",
  messagingSenderId: "755007423671",
  appId: "1:755007423671:web:acef646b59d2f3429c3932"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Use a new root "v2" to avoid conflicts with the old HeavenAndHell game
let usingLocalFallback = false;

const getLocalState = () => {
  const state = { players: {}, globalEvent: null };
  ['cuni1', 'cuni2', 'cuni3', 'cuni4'].forEach(id => {
    state.players[id] = {
      scores: JSON.parse(localStorage.getItem(`hh_scores_${id}`) || '{"monedas": 0, "penalizaciones": 0}'),
      missions: JSON.parse(localStorage.getItem(`hh_missions_${id}`) || '[]'),
      curses: JSON.parse(localStorage.getItem(`hh_curses_${id}`) || '[]')
    };
  });
  state.globalEvent = JSON.parse(localStorage.getItem('hh_global_event') || 'null');
  return state;
};

export const saveGameState = (cuniId, stateUpdates) => {
  if (!usingLocalFallback) {
    update(ref(database, `v2/players/${cuniId}/scores`), stateUpdates).catch(() => {});
  }
  // Siempre guardamos en local por si acaso
  const currentScores = JSON.parse(localStorage.getItem(`hh_scores_${cuniId}`) || '{"monedas": 0, "penalizaciones": 0}');
  localStorage.setItem(`hh_scores_${cuniId}`, JSON.stringify({ ...currentScores, ...stateUpdates }));
  window.dispatchEvent(new Event('storage'));
};

export const saveActiveMissions = (cuniId, missions) => {
  if (!usingLocalFallback) {
    set(ref(database, `v2/players/${cuniId}/missions`), missions).catch(() => {});
  }
  localStorage.setItem(`hh_missions_${cuniId}`, JSON.stringify(missions));
  window.dispatchEvent(new Event('storage'));
};

export const saveActiveCurses = (cuniId, curses) => {
  if (!usingLocalFallback) {
    set(ref(database, `v2/players/${cuniId}/curses`), curses).catch(() => {});
  }
  localStorage.setItem(`hh_curses_${cuniId}`, JSON.stringify(curses));
  window.dispatchEvent(new Event('storage'));
};

export const triggerGroupEvent = (event) => {
  if (!usingLocalFallback) {
    set(ref(database, 'v2/globalEvent'), event).catch(() => {});
  }
  localStorage.setItem('hh_global_event', JSON.stringify(event));
  window.dispatchEvent(new Event('storage'));
};

export const clearGroupEvent = () => {
  if (!usingLocalFallback) {
    set(ref(database, 'v2/globalEvent'), null).catch(() => {});
  }
  localStorage.removeItem('hh_global_event');
  window.dispatchEvent(new Event('storage'));
};

export const listenToGameState = (callback) => {
  let hasTriggered = false;

  const handleLocalState = () => {
    if (!hasTriggered) {
      hasTriggered = true;
      usingLocalFallback = true;
      callback(getLocalState());
      window.addEventListener('storage', () => callback(getLocalState()));
    }
  };

  // Timeout de seguridad: Si Firebase no responde en 1.5s, usamos LocalStorage
  const timeoutId = setTimeout(() => {
    if (!hasTriggered) {
      console.warn("Firebase no respondió a tiempo. Usando modo LocalStorage.");
      handleLocalState();
    }
  }, 1500);

  onValue(ref(database, 'v2'), (snapshot) => {
    clearTimeout(timeoutId);
    hasTriggered = true;
    usingLocalFallback = false;
    const data = snapshot.val() || {};
    
    const players = data.players || {};
    ['cuni1', 'cuni2', 'cuni3', 'cuni4'].forEach(id => {
      if (!players[id]) {
        players[id] = { scores: { monedas: 0, penalizaciones: 0 }, missions: [], curses: [] };
      } else {
        if (!players[id].scores) players[id].scores = { monedas: 0, penalizaciones: 0 };
        if (!players[id].missions) players[id].missions = [];
        if (!players[id].curses) players[id].curses = [];
      }
    });

    callback({
      players,
      globalEvent: data.globalEvent || null
    });
  }, (error) => {
    console.error("Firebase Error de Permisos o Conexión:", error);
    clearTimeout(timeoutId);
    handleLocalState();
  });
};
