import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { storeActions, groupChallenges, getMultipleRandomMissions, getRandomMission } from '../data/missions';
import { saveGameState, savePlayerName, saveActiveMissions, saveActiveCurses, listenToGameState, triggerGroupEvent, clearGroupEvent, setGlobalTrap, clearGlobalTrap } from '../firebase';

// Helper to format remaining time
const formatTime = (ms) => {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const PhaseManager = ({ gender, playerName, isDebugMode }) => {
  const [gameState, setGameState] = useState(null);
  const [showStore, setShowStore] = useState(false);
  const [showCurses, setShowCurses] = useState(false);
  const [showRace, setShowRace] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState(null);
  
  // Selection modals for store items
  const [storeTargetAction, setStoreTargetAction] = useState(null); // Which action is waiting for a target
  const [trapAlert, setTrapAlert] = useState(null); // Alert to show when stepping on a bomb
  
  // Carousel and Card State
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Timer state for curses
  const [now, setNow] = useState(Date.now());

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
    
    saveGameState(gender, {
      monedas: (myData.scores.monedas || 0) + reward,
      retos_completados: (myData.scores.retos_completados || 0) + 1
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
      if (['skip_penalty', 'steal_coins', 'steal_reto', 'swap_retos'].includes(action.type)) {
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
        if (currentMissions.length > 0) {
          // Double points of active mission
          currentMissions[currentMissionIndex].points = (currentMissions[currentMissionIndex].points || 15) * 2;
          saveActiveMissions(gender, currentMissions);
        } else {
          alert('No tienes misión actual para duplicar.');
          return;
        }
      } else if (action.type === 'secret_bomb') {
        setGlobalTrap({ type: 'secret_bomb', setter: gender });
      }
      
      saveGameState(gender, { monedas: myData.scores.monedas - action.price });
      showPurchaseSuccess(action.text);
    } else {
      alert('No tienes suficientes monedas.');
    }
  };

  const executeTargetedAction = (action, targetId, targetItem) => {
    const myData = getMyData();
    const otherPlayers = gameState.players;
    const targetData = otherPlayers[targetId];

    if (action.type === 'skip_penalty') {
      const newCurses = myData.curses.filter(c => c.id !== targetItem.id);
      saveActiveCurses(gender, newCurses);
    } else if (action.type === 'steal_coins') {
      const stolen = Math.min(10, targetData.scores?.monedas || 0);
      saveGameState(targetId, { monedas: (targetData.scores?.monedas || 0) - stolen });
      saveGameState(gender, { monedas: (myData.scores?.monedas || 0) + stolen - action.price });
      showPurchaseSuccess(`Robaste ${stolen}🪙 a ${targetData.name}`);
      setStoreTargetAction(null);
      return; // Handled cost here due to stolen amount logic
    } else if (action.type === 'steal_reto') {
      if ((targetData.scores?.retos_completados || 0) > 0) {
        saveGameState(targetId, { retos_completados: (targetData.scores?.retos_completados || 0) - 1 });
        saveGameState(gender, { retos_completados: (myData.scores?.retos_completados || 0) + 1 });
      } else {
        alert(`${targetData.name} no tiene retos para robar.`);
        return;
      }
    } else if (action.type === 'swap_retos') {
      const myRetos = myData.scores?.retos_completados || 0;
      const theirRetos = targetData.scores?.retos_completados || 0;
      saveGameState(targetId, { retos_completados: myRetos });
      saveGameState(gender, { retos_completados: theirRetos });
    }

    // Pay for the item (if not already handled)
    saveGameState(gender, { monedas: myData.scores.monedas - action.price });
    showPurchaseSuccess(action.text);
    setStoreTargetAction(null);
  };

  const showPurchaseSuccess = (text) => {
    setPurchaseMessage(`¡Hecho: ${text}!`);
    setTimeout(() => {
      setPurchaseMessage(null);
      setShowStore(false);
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
                  <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 'bold' }}>{activeMission.category}</span>
                    <p style={{ fontSize: '1.4rem', fontWeight: '900', margin: '0 0 20px 0' }}>{activeMission.text}</p>
                    <div style={{ fontSize: '1.2rem', color: playerColor, fontWeight: '900' }}>
                      Recompensa: +{activeMission.points} 🪙
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
                <div key={action.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px', background: '#fff' }}>
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

              {['steal_coins', 'steal_reto', 'swap_retos'].includes(storeTargetAction.type) && allPlayers.filter(p => p[0] !== gender).map(([id, pData]) => (
                <button 
                  key={id} 
                  onClick={() => executeTargetedAction(storeTargetAction, id, null)}
                  style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: getPlayerColor(id), color: '#fff', border: 'none', padding: '15px', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}
                >
                  <span>{pData.name}</span>
                  <span>{storeTargetAction.type === 'steal_coins' ? `🪙 ${pData.scores?.monedas||0}` : `🏁 ${pData.scores?.retos_completados||0}`}</span>
                </button>
              ))}

              {['steal_coins', 'steal_reto', 'swap_retos'].includes(storeTargetAction.type) && allPlayers.filter(p => p[0] !== gender).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', fontWeight: 'bold', color: '#666' }}>No hay otros jugadores en la partida.</div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* PURCHASE MESSAGE OVERLAY */}
      {purchaseMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110 }}>
          <h2 style={{ color: '#fff', fontSize: '2rem', textAlign: 'center', background: '#e21b3c', padding: '20px', borderRadius: '4px', fontWeight: '900' }}>
            {purchaseMessage}
          </h2>
        </div>
      )}

      {/* GLOBAL EVENT MODAL */}
      {globalEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#e21b3c', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>{globalEvent.emoji}</div>
          <h2 style={{ color: '#fff', fontSize: '3rem', marginBottom: '15px', textTransform: 'uppercase', fontWeight: '900' }}>{globalEvent.type}</h2>
          <p style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '30px', maxWidth: '80%', fontWeight: 'bold' }}>{globalEvent.text}</p>
          <div style={{ background: '#000', padding: '15px 30px', borderRadius: '4px', color: '#fff', fontSize: '1.5rem', marginBottom: '40px', fontWeight: '900' }}>
            ⏳ Tiempo: {globalEvent.duration}
          </div>
          <div style={{ fontSize: '2rem', color: '#FFD700', fontWeight: '900', marginBottom: '40px' }}>
            +{globalEvent.reward} 🪙
          </div>
          {isDebugMode && (
             <button onClick={() => clearGroupEvent()} style={{ background: '#fff', color: '#e21b3c', border: 'none', padding: '15px 30px', borderRadius: '4px', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer' }}>
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
            <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.8rem', fontFamily: "'Fredoka', sans-serif" }}>🏁 CARRERA DE RETOS</h3>
            <button onClick={() => setShowRace(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>×</button>
          </div>
          
          {/* Track Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-end', padding: '40px 10px', position: 'relative', overflow: 'hidden' }}>
            
            {/* Meta Line (Finish Line) */}
            <div style={{ position: 'absolute', top: '15px', left: 0, width: '100%', height: '15px', background: 'transparent', borderTop: '15px dashed #fff', zIndex: 1 }}></div>
            
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
