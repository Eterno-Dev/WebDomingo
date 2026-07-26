import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { storeActions, groupChallenges, getMultipleRandomMissions, getRandomMission, teamChallenges, secretMissions } from '../data/missions';
import { saveGameState, savePlayerName, saveActiveMissions, saveActiveCurses, listenToGameState, triggerGroupEvent, clearGroupEvent, setGlobalTrap, clearGlobalTrap, setGlobalCheckpoint, setGameOver, castGlobalVote } from '../firebase';

// Helper to format remaining time
const formatTime = (ms) => {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const PhaseManager = ({ gender, playerName, isDebugMode }) => {
  const [gameState, setGameState] = useState(null);
  const [showStore, setShowStore] = useState(false);
  const [showCurses, setShowCurses] = useState(false);
  const [showRace, setShowRace] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Selection modals for store items
  const [storeTargetAction, setStoreTargetAction] = useState(null); // Which action is waiting for a target
  const [trapAlert, setTrapAlert] = useState(null); // Alert to show when stepping on a bomb
  
  // Carousel and Card State
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Timer state for curses
  const [now, setNow] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState('');

  // Target time (00:15 of the next occurrence)
  useEffect(() => {
    const target = new Date();
    target.setHours(0, 15, 0, 0);
    if (new Date() > target) {
      target.setDate(target.getDate() + 1);
    }

    const timer = setInterval(() => {
      const current = new Date();
      const diff = target - current;
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        if (gameState && !gameState.isGameOver) {
          setGameOver(true);
        }
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    // Sync name to global state properly
    savePlayerName(gender, playerName);

    listenToGameState((state) => {
      setGameState(state);
      // Auto-kick if the admin removes our player from the DB
      if (state && state.players && state.players[gender] && !state.players[gender].name && playerName) {
        // We were playing, but our name disappeared from the database (kicked)
        localStorage.clear();
        window.location.reload();
      }
    });

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gender, playerName]);

  const getMyData = () => gameState?.players[gender] || { scores: { monedas: 0, penalizaciones: 0 }, missions: [], curses: [] };

  // Inicializar misiones si no tiene 3
  useEffect(() => {
    if (gameState) {
      const myData = getMyData();
      if (!myData.missions || myData.missions.length < 3) {
        const needed = 3 - (myData.missions?.length || 0);
        const newMissions = getMultipleRandomMissions(needed, myData.missions || []);
        saveActiveMissions(gender, [...(myData.missions || []), ...newMissions]);
      }
    }
  }, [gameState, gender]);

  // Clean up expired curses automatically
  useEffect(() => {
    const myData = getMyData();
    if (myData.curses && myData.curses.length > 0) {
      const activeCurses = myData.curses.filter(c => c.expiresAt > now);
      if (activeCurses.length !== myData.curses.length) {
        saveActiveCurses(gender, activeCurses);
      }
    }
  }, [now, gameState, gender]);

  const replaceCurrentMission = () => {
    const myData = getMyData();
    const currentMissions = [...(myData.missions || [])];
    const newMissions = getMultipleRandomMissions(1, currentMissions);
    
    if (newMissions.length > 0) {
      if (currentMissions.length > 0) {
        currentMissions[currentMissionIndex] = newMissions[0];
      } else {
        currentMissions.push(newMissions[0]);
      }
      saveActiveMissions(gender, currentMissions);
    } else {
      alert("No hay más misiones únicas disponibles en el juego.");
    }
    setIsFlipped(false);
  };

  const checkCheckpoints = (newRetos) => {
    if (!gameState || !gameState.globalCheckpoints) return;
    const checkpoints = [5, 10, 12, 15];
    checkpoints.forEach(cp => {
      if (newRetos >= cp && !gameState.globalCheckpoints[cp.toString()]) {
        setGlobalCheckpoint(cp.toString());
        
        const activePlayers = Object.keys(gameState.players).filter(id => gameState.players[id].name);
        const shuffled = [...activePlayers].sort(() => 0.5 - Math.random());
        const team1 = shuffled.slice(0, Math.ceil(shuffled.length / 2));
        const team2 = shuffled.slice(Math.ceil(shuffled.length / 2));
        
        const randomChallenge = teamChallenges[Math.floor(Math.random() * teamChallenges.length)];
        const rewardRetos = cp === 5 ? 1 : (cp === 10 ? 2 : (cp === 12 ? 2 : 3));
        const rewardCoins = cp === 5 ? 20 : (cp === 10 ? 40 : (cp === 12 ? 50 : 60));

        triggerGroupEvent({
          type: 'Batalla de Equipos 2vs2',
          text: randomChallenge,
          duration: '¡Todos deben votar al acabar!',
          rewardText: `+${rewardRetos} Reto${rewardRetos > 1 ? 's' : ''} y +${rewardCoins}🪙`,
          rewardRetos,
          rewardCoins,
          emoji: '',
          team1,
          team2,
          tieBreaker: Math.random() < 0.5 ? 'team1' : 'team2',
          votes: {},
          resolved: false
        });
      }
    });
  };

  // Monitor total retos to trigger checkpoints properly regardless of source
  const prevRetosRef = useRef(null);
  useEffect(() => {
    if (!gameState) return;
    const currentRetos = gameState.players[gender]?.scores?.retos_completados || 0;
    if (prevRetosRef.current !== null && currentRetos > prevRetosRef.current) {
      checkCheckpoints(currentRetos);
    }
    prevRetosRef.current = currentRetos;
  }, [gameState?.players?.[gender]?.scores?.retos_completados]);

  // Auto-resolve battle votes
  useEffect(() => {
    const globalEvent = gameState?.globalEvent;
    if (globalEvent && globalEvent.type === 'Batalla de Equipos 2vs2' && !globalEvent.resolved) {
      const activePlayersCount = Object.keys(gameState.players).filter(id => gameState.players[id].name).length;
      const votes = globalEvent.votes || {};
      const voteCount = Object.keys(votes).length;
      
      if (voteCount > 0 && voteCount >= activePlayersCount) {
        // Count votes
        let t1Votes = 0; let t2Votes = 0;
        Object.values(votes).forEach(v => {
          if (v === 'team1') t1Votes++;
          if (v === 'team2') t2Votes++;
        });

        if (t1Votes !== t2Votes || (t1Votes === t2Votes)) {
          const isTie = t1Votes === t2Votes;
          const winningTeamId = isTie ? globalEvent.tieBreaker : (t1Votes > t2Votes ? 'team1' : 'team2');
          const winningPlayers = globalEvent[winningTeamId] || [];
          
          // Mark as resolved locally so we don't trigger multiple times
          triggerGroupEvent({ ...globalEvent, resolved: true, winner: winningTeamId, tied: isTie, t1Votes, t2Votes });
          
          // If I am on the winning team, I give myself the reward
          if (winningPlayers.includes(gender)) {
            const myData = gameState.players[gender];
            const isBuyer = globalEvent.buyerBonus === gender;
            const multiplier = isBuyer ? 2 : 1;
            
            saveGameState(gender, {
              retos_completados: (myData.scores.retos_completados || 0) + (globalEvent.rewardRetos * multiplier),
              monedas: (myData.scores.monedas || 0) + (globalEvent.rewardCoins * multiplier)
            });
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 }, colors: ['#FFD700', '#fff'] });
          }
        }
      }
    }
  }, [gameState, gender]);

  // Auto-clear resolved events
  useEffect(() => {
    if (gameState?.globalEvent?.resolved) {
      const timer = setTimeout(() => {
        clearGroupEvent();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.globalEvent?.resolved]);

  const handleComplete = () => {
    const myData = getMyData();
    const currentMission = myData.missions[currentMissionIndex];
    if (!currentMission) return;

    // Check for Secret Bomb
    if (gameState && gameState.globalTrap && gameState.globalTrap.type === 'secret_bomb') {
      const penaltyRetos = 2;
      saveGameState(gender, {
        retos_completados: Math.max(0, (myData.scores.retos_completados || 0) - penaltyRetos)
      });
      clearGlobalTrap();
      setTrapAlert(`💥 ¡BOOM! Has pisado una bomba secreta de ${gameState.players[gameState.globalTrap.setter]?.name || 'alguien'}. Pierdes ${penaltyRetos} retos.`);
      replaceCurrentMission();
      return; // Stop normal reward
    }

    const reward = currentMission.points || 15;
    const newRetos = (myData.scores.retos_completados || 0) + 1;
    
    saveGameState(gender, {
      monedas: (myData.scores.monedas || 0) + reward,
      retos_completados: newRetos
    });

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#ffeb3b', '#fff']
    });

    replaceCurrentMission();
  };

  const handleCaught = () => {
    const myData = getMyData();
    const currentMission = myData.missions[currentMissionIndex];
    if (!currentMission) return;

    const penalty = 10;
    saveGameState(gender, {
      monedas: Math.max(0, (myData.scores.monedas || 0) - penalty),
      penalizaciones: (myData.scores.penalizaciones || 0) + 1
    });

    // Parse duration string into ms (e.g. "10 minutos" -> 10 * 60 * 1000)
    let durationMs = 30 * 60 * 1000; // default 30 mins
    if (currentMission.duration) {
      if (currentMission.duration.includes('minutos')) {
        const mins = parseInt(currentMission.duration.replace(/\D/g, '')) || 30;
        durationMs = mins * 60 * 1000;
      } else if (currentMission.duration.includes('hora')) {
        durationMs = 60 * 60 * 1000;
      } else {
        // "Toda la noche" -> 4 hours
        durationMs = 4 * 60 * 60 * 1000;
      }
    }

    const newCurse = {
      id: Date.now().toString(),
      text: currentMission.penalty || 'Maldición desconocida',
      expiresAt: Date.now() + durationMs,
      fromMission: currentMission.text
    };
    saveActiveCurses(gender, [...(myData.curses || []), newCurse]);

    replaceCurrentMission();
  };

  const buyAction = (action) => {
    const myData = getMyData();
    if ((myData.scores.monedas || 0) >= action.price) {
      
      // Actions requiring Target Selection
      if (['skip_penalty', 'steal_coins', 'steal_reto', 'swap_retos', 'curse_player'].includes(action.type)) {
        if (action.type === 'skip_penalty' && (!myData.curses || myData.curses.length === 0)) {
          alert('¡No tienes penalizaciones activas para saltar!');
          return;
        }
        setStoreTargetAction(action);
        return; // Wait for target selection
      }

      // Immediate Actions
      if (action.type === 'change_mission') {
        replaceCurrentMission();
      } else if (action.type === 'buy_mission') {
        const currentMissions = [...(myData.missions || [])];
        const newMissions = getMultipleRandomMissions(1, currentMissions);
        if (newMissions.length > 0) {
          currentMissions.push(newMissions[0]);
          saveActiveMissions(gender, currentMissions);
        } else {
          alert('¡No quedan misiones nuevas disponibles para comprar!');
          return; // cancel purchase
        }
      } else if (action.type === 'double_reward') {
        const currentMissions = [...(myData.missions || [])];
        const activeIndex = Math.min(Math.max(0, currentMissionIndex), Math.max(0, currentMissions.length - 1));
        if (currentMissions.length > 0) {
          // Double points of active mission
          currentMissions[activeIndex].points = (currentMissions[activeIndex].points || 15) * 2;
          currentMissions[activeIndex].isDoubled = true;
          saveActiveMissions(gender, currentMissions);
        } else {
          alert('No tienes misión actual para duplicar.');
          return;
        }
      } else if (action.type === 'secret_bomb') {
        setGlobalTrap({ type: 'secret_bomb', setter: gender });
      } else if (action.type === 'buy_reto') {
        const newRetos = (myData.scores.retos_completados || 0) + 1;
        saveGameState(gender, { retos_completados: newRetos });
      } else if (action.type === 'trigger_event') {
        const activePlayers = Object.keys(gameState.players).filter(id => gameState.players[id].name);
        const shuffled = [...activePlayers].sort(() => 0.5 - Math.random());
        const team1 = shuffled.slice(0, Math.ceil(shuffled.length / 2));
        const team2 = shuffled.slice(Math.ceil(shuffled.length / 2));
        
        const randomChallenge = teamChallenges[Math.floor(Math.random() * teamChallenges.length)];
        const rewardRetos = 1;
        const rewardCoins = 20;

        triggerGroupEvent({
          type: 'Batalla de Equipos 2vs2',
          text: randomChallenge,
          duration: '¡Todos deben votar al acabar!',
          rewardText: `+${rewardRetos} Reto${rewardRetos > 1 ? 's' : ''} y +${rewardCoins}🪙`,
          rewardRetos,
          rewardCoins,
          emoji: '⚔️',
          team1,
          team2,
          tieBreaker: Math.random() < 0.5 ? 'team1' : 'team2',
          votes: {},
          resolved: false,
          buyerBonus: gender // The buyer gets double reward if they win
        });
      }
      
      saveGameState(gender, { monedas: myData.scores.monedas - action.price });
      showPurchaseSuccess(action.text);
    } else {
      showError('No tienes suficientes monedas');
    }
  };

  const executeTargetedAction = (action, targetId, targetItem) => {
    const myData = getMyData();
    const otherPlayers = gameState.players;
    const targetData = otherPlayers[targetId];

    if (action.type === 'skip_penalty') {
      const newCurses = myData.curses.filter(c => c.id !== targetItem.id);
      saveActiveCurses(gender, newCurses);
      saveGameState(gender, { monedas: myData.scores.monedas - action.price });
    } else if (action.type === 'steal_coins') {
      const stolen = Math.min(10, targetData.scores?.monedas || 0);
      saveGameState(targetId, { monedas: (targetData.scores?.monedas || 0) - stolen });
      saveGameState(gender, { monedas: (myData.scores?.monedas || 0) + stolen - action.price });
      showPurchaseSuccess(`Robaste ${stolen}🪙 a ${targetData.name}`);
      setStoreTargetAction(null);
      return; 
    } else if (action.type === 'steal_reto') {
      if ((targetData.scores?.retos_completados || 0) > 0) {
        saveGameState(targetId, { retos_completados: (targetData.scores?.retos_completados || 0) - 1 });
        saveGameState(gender, { 
          retos_completados: (myData.scores?.retos_completados || 0) + 1,
          monedas: myData.scores.monedas - action.price
        });
      } else {
        alert(`${targetData.name} no tiene retos para robar.`);
        return;
      }
    } else if (action.type === 'swap_retos') {
      const myRetos = myData.scores?.retos_completados || 0;
      const theirRetos = targetData.scores?.retos_completados || 0;
      saveGameState(targetId, { retos_completados: myRetos });
      saveGameState(gender, { 
        retos_completados: theirRetos,
        monedas: myData.scores.monedas - action.price
      });
    } else if (action.type === 'curse_player') {
      const randomMission = secretMissions[Math.floor(Math.random() * secretMissions.length)];
      
      let durationMs = 30 * 60 * 1000;
      if (randomMission.duration) {
        if (randomMission.duration.includes('minutos')) {
          const mins = parseInt(randomMission.duration.replace(/\D/g, '')) || 30;
          durationMs = mins * 60 * 1000;
        } else if (randomMission.duration.includes('hora')) {
          durationMs = 60 * 60 * 1000;
        } else {
          durationMs = 4 * 60 * 60 * 1000;
        }
      }

      const newCurse = {
        id: Date.now().toString(),
        text: randomMission.penalty || 'Castigo aleatorio.',
        expiresAt: Date.now() + durationMs,
        fromMission: 'Lanzado por otro jugador'
      };
      saveActiveCurses(targetId, [...(targetData.curses || []), newCurse]);
      saveGameState(gender, { monedas: myData.scores.monedas - action.price });
      showPurchaseSuccess(`Castigaste a ${targetData.name}`);
      setStoreTargetAction(null);
      return;
    }

    showPurchaseSuccess(action.text);
    setStoreTargetAction(null);
  };

  const showPurchaseSuccess = (text) => {
    // Vibrate and sound if supported
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#26890c', '#fff', '#d89e00']
    });

    setPurchaseMessage(`¡Comprado: ${text}!`);
    setTimeout(() => {
      setPurchaseMessage(null);
      setShowStore(false);
    }, 2000);
  };

  const showError = (text) => {
    if (navigator.vibrate) navigator.vibrate(300);
    setErrorMessage(text);
    setTimeout(() => {
      setErrorMessage(null);
    }, 2000);
  };

  if (!gameState) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Cargando...</div>;

  const myData = getMyData();
  const missions = myData.missions || [];
  const curses = myData.curses || [];
  const globalEvent = gameState.globalEvent;
  const allPlayers = Object.entries(gameState.players).filter(([id, data]) => data.name);

  const activeIndex = Math.min(Math.max(0, currentMissionIndex), Math.max(0, missions.length - 1));
  const activeMission = missions[activeIndex];

  const getPlayerColor = (id) => {
    switch (id) {
      case 'cuni1': return '#e21b3c';
      case 'cuni2': return '#1368ce';
      case 'cuni3': return '#d89e00';
      case 'cuni4': return '#26890c';
      default: return '#333';
    }
  };

  const playerColor = getPlayerColor(gender);

  if (gameState.isGameOver) {
    const sortedPlayers = [...allPlayers].sort((a,b) => (b[1].scores?.retos_completados || 0) - (a[1].scores?.retos_completados || 0));
    const winner = sortedPlayers[0];
    
    // Check if there is a winner (if nobody played, winner is undefined)
    if (!winner) {
      return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Juego Terminado. No hay jugadores.</div>;
    }

    return (
      <div className="screen-container" style={{ background: '#222', color: '#fff', textAlign: 'center', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '3rem', color: '#ffd700', marginBottom: '20px', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>¡FIN DEL JUEGO!</h1>
        <div style={{ fontSize: '6rem', margin: '20px 0' }}>🏆</div>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>El ganador absoluto es:</h2>
        
        <div style={{ 
          background: getPlayerColor(winner[0]), 
          color: '#fff', 
          fontSize: '3rem', 
          fontWeight: '900', 
          padding: '20px', 
          borderRadius: '12px', 
          margin: '20px auto', 
          maxWidth: '400px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          textTransform: 'uppercase'
        }}>
          {winner[1].name}
        </div>
        
        <div style={{ fontSize: '1.5rem', marginTop: '20px', fontWeight: 'bold' }}>
          Con <span style={{ color: '#ffd700', fontSize: '2rem' }}>{winner[1].scores?.retos_completados || 0}</span> retos completados.
        </div>
      </div>
    );
  }

  const nextMission = () => {
    setIsFlipped(false);
    setCurrentMissionIndex((prev) => (prev + 1) % Math.max(1, missions.length));
  };

  const prevMission = () => {
    setIsFlipped(false);
    setCurrentMissionIndex((prev) => (prev - 1 + missions.length) % Math.max(1, missions.length));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f7fa', color: '#333', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      
      {/* TRAP ALERT OVERLAY */}
      {trapAlert && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 300, padding: '20px' }}>
          <div style={{ background: '#e21b3c', color: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '15px' }}>💣</div>
            <h2 style={{ fontWeight: '900', fontSize: '2rem', marginBottom: '15px' }}>¡TRAMPA!</h2>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>{trapAlert}</p>
            <button onClick={() => setTrapAlert(null)} style={{ background: '#fff', color: '#e21b3c', padding: '12px 24px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}>Entendido</button>
          </div>
        </div>
      )}

      {/* GLOBAL HEADER (Flat Kahoot Style) */}
      <div style={{ padding: '10px', background: '#fff', borderBottom: '2px solid #eaeaea', display: 'flex', gap: '10px', overflowX: 'auto', whiteSpace: 'nowrap', alignItems: 'center' }}>
        {allPlayers.map(([id, pData]) => (
          <div key={id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', background: '#fafafa', color: '#333', padding: '8px 12px', borderRadius: '4px', borderBottom: `4px solid ${id === gender ? playerColor : '#ddd'}`, flexShrink: 0 }}>
            <span style={{ fontSize: '1rem', fontWeight: '900', color: getPlayerColor(id), textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100px' }}>
              {pData.name || 'Esperando...'}
            </span>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              <span>🪙 {pData.scores?.monedas || 0}</span>
              {(pData.curses && pData.curses.length > 0) && <span style={{ color: '#e21b3c' }}>❌ {pData.curses.length}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* MY STATUS BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#fff', borderBottom: '2px solid #eaeaea' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* RACE ICON */}
          <div onClick={() => setShowRace(true)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: '#333', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontWeight: '900', fontSize: '1.2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            🏁
          </div>
          <div style={{ fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>HOLA, <span style={{ color: playerColor }}>{playerName}</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          <div onClick={() => setShowCurses(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: curses.length > 0 ? '#e21b3c' : '#eee', color: curses.length > 0 ? '#fff' : '#333', padding: '5px 10px', borderRadius: '4px' }}>
            <span style={{ fontSize: '1.2rem' }}>❌</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{curses.length}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#eee', padding: '5px 10px', borderRadius: '4px' }}>
            <span style={{ fontSize: '1.2rem' }}>🪙</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{myData.scores.monedas || 0}</span>
          </div>
          
          {/* TIENDA ICON */}
          <div onClick={() => setShowStore(true)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: '#d89e00', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontWeight: '900', fontSize: '1.2rem' }}>
            🛒
          </div>
        </div>
      </div>

      {/* MAIN MISSION AREA (Carousel + Flip Card) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative' }}>
        {activeMission ? (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '400px', gap: '10px' }}>
            
            {/* Left Arrow */}
            <button onClick={prevMission} style={{ background: '#333', border: 'none', color: '#fff', fontSize: '1.5rem', width: '40px', height: '40px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>◀</button>
            
            {/* Card Container */}
            <div style={{ flex: 1, perspective: '1000px' }}>
              <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1rem', fontWeight: 'bold', color: '#333', textTransform: 'uppercase' }}>
                Misión {activeIndex + 1} de {missions.length}
              </div>

              {/* Flip Card Wrapper */}
              <div style={{ width: '100%', height: '350px', position: 'relative', transition: 'transform 0.4s', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                
                {/* Front of Card */}
                <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: '#fff', color: '#333', borderRadius: '20px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ background: playerColor, padding: '15px', color: '#fff', textAlign: 'center', fontWeight: '900', fontSize: '1.2rem' }}>
                    MISIÓN SECRETA
                  </div>
                  <div style={{ flex: 1, padding: '15px 15px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', overflowY: 'auto' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 'bold' }}>{activeMission.category}</span>
                    <p style={{ fontSize: activeMission.text.length > 70 ? '1.1rem' : '1.4rem', fontWeight: '900', margin: '0 0 15px 0', lineHeight: '1.3' }}>{activeMission.text}</p>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      color: playerColor, 
                      fontWeight: '900', 
                      padding: '5px 10px', 
                      borderRadius: '8px'
                    }}>
                      Recompensa: <span style={{ color: activeMission.isDoubled ? '#333' : 'inherit' }}>+{activeMission.points} 🪙</span>
                    </div>
                  </div>
                  <div 
                    onClick={() => setIsFlipped(true)}
                    style={{ background: '#eee', padding: '15px', textAlign: 'center', cursor: 'pointer', color: '#333', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    <span>Ver castigo ▼</span>
                  </div>
                </div>

                {/* Back of Card (Risk) */}
                <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: '#333', color: '#fff', borderRadius: '20px', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ background: '#e21b3c', padding: '15px', color: '#fff', textAlign: 'center', fontWeight: '900', fontSize: '1.2rem' }}>
                    ❌ RIESGO DE LA MISIÓN
                  </div>
                  <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 20px 0' }}>{activeMission.penalty}</p>
                    <div style={{ fontSize: '1rem', color: '#fff', background: '#e21b3c', padding: '8px 15px', borderRadius: '4px', fontWeight: 'bold' }}>
                      ⏳ Duración: {activeMission.duration}
                    </div>
                  </div>
                  <div 
                    onClick={() => setIsFlipped(false)}
                    style={{ background: '#222', padding: '15px', textAlign: 'center', cursor: 'pointer', color: '#fff', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    <span>Volver a la Misión ▲</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                <button 
                  onClick={handleComplete}
                  style={{ width: '100%', background: '#26890c', color: '#fff', border: 'none', padding: '15px', borderRadius: '4px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', borderBottom: '6px solid #1f7309' }}
                >
                  Completada
                </button>
                <button 
                  onClick={handleCaught}
                  style={{ width: '100%', background: '#fff', color: '#e21b3c', border: '2px solid #e21b3c', padding: '12px', borderRadius: '4px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', borderBottom: '4px solid #e21b3c' }}
                >
                  ¡Me pillaron!
                </button>
              </div>

            </div>

            {/* Right Arrow */}
            <button onClick={nextMission} style={{ background: '#333', border: 'none', color: '#fff', fontSize: '1.5rem', width: '40px', height: '40px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>▶</button>
          
          </div>
        ) : (
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Generando misiones...</div>
        )}
      </div>

      {/* FOOTER BUTTONS REMOVED */}

      {/* CURSES MODAL */}
      {showCurses && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ background: '#e21b3c', padding: '15px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900' }}>❌ TUS CASTIGOS</h3>
              <button onClick={() => setShowCurses(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.8rem', cursor: 'pointer', lineHeight: '1' }}>×</button>
            </div>
            <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto', color: '#333' }}>
              {curses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  No tienes castigos activos. ¡Bien jugado!
                </div>
              ) : (
                curses.map((curse, idx) => (
                  <div key={curse.id || idx} style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px', marginBottom: '15px', borderLeft: '4px solid #e21b3c' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#e21b3c', marginBottom: '8px' }}>{curse.text}</div>
                    <div style={{ fontSize: '1.2rem', color: '#333', fontWeight: '900', fontFamily: 'monospace', background: '#ddd', display: 'inline-block', padding: '5px 10px', borderRadius: '4px' }}>
                      ⏳ {formatTime(curse.expiresAt - now)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* STORE MODAL */}
      {showStore && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ background: '#333', padding: '15px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: '900' }}>MERCADO NEGRO</h3>
              <button onClick={() => setShowStore(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.8rem', cursor: 'pointer', lineHeight: '1' }}>×</button>
            </div>
            <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: '900', fontSize: '1.4rem', color: '#333' }}>
                Monedas: <span style={{ color: '#d89e00' }}>{myData.scores.monedas || 0}</span> 🪙
              </div>
              {storeActions.map(action => (
                <div key={action.id} style={{ display: 'flex', flexDirection: 'column', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ flex: 1, paddingRight: '15px', color: '#333' }}>
                      <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>{action.emoji}</span>
                      <span style={{ fontWeight: 'bold' }}>{action.text}</span>
                    </div>
                    <button 
                      onClick={() => buyAction(action)}
                      style={{ background: '#d89e00', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '4px', fontWeight: '900', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: '4px solid #b38200' }}
                    >
                      {action.price} 🪙
                    </button>
                  </div>
                  {action.desc && (
                    <div style={{ fontSize: '0.85rem', color: '#666', borderTop: '1px dashed #eee', paddingTop: '8px' }}>
                      {action.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STORE TARGET SELECTION MODAL */}
      {storeTargetAction && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: '#d89e00', padding: '15px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: '900' }}>{storeTargetAction.type === 'skip_penalty' ? 'ELIGE EL CASTIGO A QUITAR' : 'ELIGE UNA VÍCTIMA'}</h3>
              <button onClick={() => setStoreTargetAction(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.8rem', cursor: 'pointer', lineHeight: '1' }}>×</button>
            </div>
            <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
              
              {storeTargetAction.type === 'skip_penalty' && curses.map(curse => (
                <button 
                  key={curse.id} 
                  onClick={() => executeTargetedAction(storeTargetAction, null, curse)}
                  style={{ display: 'block', width: '100%', background: '#f5f5f5', border: '2px solid #ddd', padding: '15px', borderRadius: '4px', marginBottom: '10px', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {curse.text}
                </button>
              ))}

              {['steal_coins', 'steal_reto', 'swap_retos', 'curse_player'].includes(storeTargetAction.type) && allPlayers.filter(p => p[0] !== gender).map(([id, pData]) => (
                <button 
                  key={id} 
                  onClick={() => executeTargetedAction(storeTargetAction, id, null)}
                  style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: getPlayerColor(id), color: '#fff', border: 'none', padding: '15px', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}
                >
                  <span>{pData.name}</span>
                  <span>{storeTargetAction.type === 'steal_coins' ? `🪙 ${pData.scores?.monedas||0}` : storeTargetAction.type === 'curse_player' ? '⚡' : `🏁 ${pData.scores?.retos_completados||0}`}</span>
                </button>
              ))}

              {['steal_coins', 'steal_reto', 'swap_retos', 'curse_player'].includes(storeTargetAction.type) && allPlayers.filter(p => p[0] !== gender).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', fontWeight: 'bold', color: '#666' }}>No hay otros jugadores en la partida.</div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* PURCHASE MESSAGE OVERLAY */}
      {purchaseMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 300 }}>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', textAlign: 'center', background: '#26890c', padding: '25px', borderRadius: '12px', fontWeight: '900', boxShadow: '0 10px 30px rgba(38,137,12,0.4)', maxWidth: '80%' }}>
            {purchaseMessage}
          </h2>
        </div>
      )}

      {/* ERROR MESSAGE OVERLAY */}
      {errorMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 300 }}>
          <h2 style={{ color: '#fff', fontSize: '1.3rem', textAlign: 'center', background: '#e21b3c', padding: '15px 25px', borderRadius: '12px', fontWeight: '900', boxShadow: '0 10px 30px rgba(226,27,60,0.4)', maxWidth: '80%' }}>
            {errorMessage}
          </h2>
        </div>
      )}

      {/* GLOBAL EVENT MODAL */}
      {globalEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#f5f7fa', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '20px', textAlign: 'center', overflowY: 'auto' }}>
          
          {globalEvent.type === 'Batalla de Equipos 2vs2' ? (
            <div style={{ width: '100%', maxWidth: '500px' }}>
              {globalEvent.resolved ? (
                <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #ddd', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%' }}>
                  <div style={{ background: '#888', padding: '15px', color: '#fff', textAlign: 'center', fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>
                    RESULTADO
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {globalEvent.tied && (
                      <div style={{ background: '#eee', color: '#333', padding: '10px 20px', borderRadius: '8px', marginBottom: '15px', width: '100%' }}>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: '900' }}>EMPATE</h3>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Se ha seleccionado un ganador al azar.</p>
                      </div>
                    )}
                    
                    <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '2.5rem', color: '#26890c', margin: '0 0 10px 0', fontWeight: '900', textTransform: 'uppercase' }}>
                      {globalEvent.tied ? 'GANADORES: EQUIPO ' : '¡GANADORES EQUIPO '} 
                      {globalEvent.winner === 'team1' ? '1!' : '2!'}
                    </h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
                      {globalEvent[globalEvent.winner]?.map(id => (
                        <span key={id} style={{ background: getPlayerColor(id), color: '#fff', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                          {gameState.players[id]?.name}
                        </span>
                      ))}
                    </div>
                    <p style={{ color: '#666', marginTop: '20px', fontWeight: 'bold' }}>Volviendo a la carrera automáticamente...</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                  
                  {/* RETO CARD */}
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #ddd', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ color: '#333', fontSize: '1.4rem', margin: '0 0 10px 0', fontWeight: 'bold', textAlign: 'center' }}>
                        {globalEvent.text}
                      </p>
                      <div style={{ fontSize: '1.1rem', color: '#666', fontWeight: 'bold', textAlign: 'center' }}>
                        {globalEvent.rewardText}
                      </div>
                    </div>
                  </div>

                  {/* TEAM 1 CARD */}
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #ddd', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div style={{ background: '#888', padding: '15px', color: '#fff', textAlign: 'center', fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>
                      EQUIPO 1
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {globalEvent.team1?.map(id => (
                          <span key={id} style={{ background: getPlayerColor(id), color: '#fff', padding: '8px 16px', borderRadius: '20px', fontWeight: '900', fontSize: '1.2rem', border: '2px solid rgba(255,255,255,0.5)' }}>
                            {gameState.players[id]?.name || '???'}
                          </span>
                        ))}
                      </div>
                      <button 
                        onClick={() => castGlobalVote(gender, 'team1')}
                        style={{ 
                          width: '100%',
                          background: globalEvent.votes?.[gender] === 'team1' ? '#333' : '#eee', 
                          color: globalEvent.votes?.[gender] === 'team1' ? '#fff' : '#333', 
                          border: 'none', 
                          padding: '15px', 
                          borderRadius: '8px', 
                          fontWeight: '900', 
                          fontSize: '1.2rem', 
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {globalEvent.votes?.[gender] === 'team1' ? '✓ TU VOTO' : 'VOTAR EQUIPO 1'}
                      </button>
                      <span style={{ color: '#888', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        Votos recibidos: {Object.values(globalEvent.votes || {}).filter(v => v === 'team1').length}
                      </span>
                    </div>
                  </div>

                  {/* TEAM 2 CARD */}
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #ddd', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div style={{ background: '#888', padding: '15px', color: '#fff', textAlign: 'center', fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>
                      EQUIPO 2
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {globalEvent.team2?.map(id => (
                          <span key={id} style={{ background: getPlayerColor(id), color: '#fff', padding: '8px 16px', borderRadius: '20px', fontWeight: '900', fontSize: '1.2rem', border: '2px solid rgba(255,255,255,0.5)' }}>
                            {gameState.players[id]?.name || '???'}
                          </span>
                        ))}
                      </div>
                      <button 
                        onClick={() => castGlobalVote(gender, 'team2')}
                        style={{ 
                          width: '100%',
                          background: globalEvent.votes?.[gender] === 'team2' ? '#333' : '#eee', 
                          color: globalEvent.votes?.[gender] === 'team2' ? '#fff' : '#333', 
                          border: 'none', 
                          padding: '15px', 
                          borderRadius: '8px', 
                          fontWeight: '900', 
                          fontSize: '1.2rem', 
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {globalEvent.votes?.[gender] === 'team2' ? '✓ TU VOTO' : 'VOTAR EQUIPO 2'}
                      </button>
                      <span style={{ color: '#888', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        Votos recibidos: {Object.values(globalEvent.votes || {}).filter(v => v === 'team2').length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div style={{ fontSize: '5rem', marginBottom: '20px' }}>{globalEvent.emoji}</div>
              <h2 style={{ color: '#fff', fontSize: '3rem', marginBottom: '15px', textTransform: 'uppercase', fontWeight: '900' }}>{globalEvent.type}</h2>
              <p style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '30px', maxWidth: '80%', fontWeight: 'bold' }}>{globalEvent.text}</p>
              <div style={{ background: '#000', padding: '15px 30px', borderRadius: '4px', color: '#fff', fontSize: '1.5rem', marginBottom: '40px', fontWeight: '900' }}>
                ⏳ Tiempo: {globalEvent.duration}
              </div>
              <div style={{ fontSize: '2rem', color: '#FFD700', fontWeight: '900', marginBottom: '40px' }}>
                +{globalEvent.reward} 🪙
              </div>
            </>
          )}

          {isDebugMode && (
             <button onClick={() => clearGroupEvent()} style={{ background: '#fff', color: '#e21b3c', border: 'none', padding: '15px 30px', borderRadius: '4px', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer', marginTop: '20px' }}>
               Cerrar Evento (Admin)
             </button>
          )}
        </div>
      )}

      {/* RACE TRACK MODAL */}
      {showRace && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#222', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
          {/* Header */}
          <div style={{ background: '#111', padding: '15px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #333' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.2rem', fontFamily: "'Fredoka', sans-serif" }}>CARRERA</h3>
              <div style={{ background: '#e21b3c', padding: '3px 8px', borderRadius: '4px', fontWeight: '900', fontSize: '1rem', fontFamily: 'monospace' }}>
                {timeLeft}
              </div>
            </div>
            <button onClick={() => setShowRace(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>×</button>
          </div>
          
          {/* Track Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-end', padding: '40px 10px', position: 'relative', overflow: 'hidden' }}>
            
            {/* Meta Line (Finish Line) & Checkpoints */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', bottom: '90%', width: '100%', borderTop: '4px dashed #FFD700', opacity: 0.8 }}><span style={{ position: 'absolute', top: '-25px', left: '10px', color: '#FFD700', fontWeight: 'bold', textShadow: '0 0 4px #000' }}>META</span></div>
              <div style={{ position: 'absolute', bottom: '72%', width: '100%', borderTop: '2px dashed #fff', opacity: 0.5 }}><span style={{ position: 'absolute', top: '-20px', left: '10px', color: '#fff', fontWeight: 'bold', textShadow: '0 0 4px #000' }}>12</span></div>
              <div style={{ position: 'absolute', bottom: '60%', width: '100%', borderTop: '2px dashed #fff', opacity: 0.5 }}><span style={{ position: 'absolute', top: '-20px', left: '10px', color: '#fff', fontWeight: 'bold', textShadow: '0 0 4px #000' }}>10</span></div>
              <div style={{ position: 'absolute', bottom: '40%', width: '100%', borderTop: '2px dashed #fff', opacity: 0.5 }}><span style={{ position: 'absolute', top: '-20px', left: '10px', color: '#fff', fontWeight: 'bold', textShadow: '0 0 4px #000' }}>5</span></div>
            </div>
            
            {/* Render each player as a vertical track */}
            {allPlayers.map(([id, pData], index) => {
              const retos = pData.scores?.retos_completados || 0;
              // Cap progress at 15 for max height (90% so it doesn't cross the finish line visually)
              const progressPercentage = Math.min((retos / 15) * 90, 90); 
              
              return (
                <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', width: '22%', zIndex: 2 }}>
                  
                  {/* Track container */}
                  <div style={{ flex: 1, width: '100%', maxWidth: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '30px', position: 'relative' }}>
                    
                    {/* Filled progress */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${progressPercentage}%`, background: getPlayerColor(id), borderRadius: '30px', transition: 'height 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}></div>
                    
                    {/* Player Avatar */}
                    <div style={{ 
                      position: 'absolute', 
                      bottom: `max(0%, calc(${progressPercentage}% - 25px))`, // Keep avatar inside track bounds
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '60px',
                      background: getPlayerColor(id),
                      borderRadius: '50%',
                      border: '4px solid #fff',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#fff',
                      fontWeight: '900',
                      fontSize: '1.5rem',
                      zIndex: 3,
                      transition: 'bottom 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                      {retos}
                    </div>
                  </div>

                  {/* Player Name Tag */}
                  <div style={{ 
                    marginTop: '20px',
                    color: '#fff', 
                    fontWeight: '900', 
                    fontSize: '0.9rem', 
                    background: getPlayerColor(id),
                    padding: '8px 5px',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    maxWidth: '100%',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    lineHeight: '1.1'
                  }}>
                    {pData.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default PhaseManager;
