import React, { useState, useEffect } from 'react';
import { listenToGameState, resetPlayer, resetAllPlayers, setGlobalUnlock, saveGameState, setGameOver, saveActiveCurses, clearGroupEvent } from '../firebase';

const AdminPanel = () => {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    listenToGameState((state) => {
      setGameState(state);
    });
  }, []);

  const getPlayerColor = (id) => {
    const colors = { cuni1: '#e21b3c', cuni2: '#1368ce', cuni3: '#d89e00', cuni4: '#26890c' };
    return colors[id] || '#333';
  };

  if (!gameState) return <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>Cargando Panel...</div>;

  const allPlayers = Object.entries(gameState.players);

  const resolveBattleTie = (winningTeamId) => {
    const globalEvent = gameState.globalEvent;
    if (!globalEvent) return;
    
    const winningPlayers = globalEvent[winningTeamId] || [];
    
    winningPlayers.forEach(id => {
      const pData = gameState.players[id];
      if (pData) {
        saveGameState(id, {
          retos_completados: (pData.scores?.retos_completados || 0) + globalEvent.rewardRetos,
          monedas: (pData.scores?.monedas || 0) + globalEvent.rewardCoins
        });
      }
    });

    clearGroupEvent();
    alert(`¡Resuelto a favor del ${winningTeamId === 'team1' ? 'Equipo 1' : 'Equipo 2'}!`);
  };

  return (
    <div className="screen-container" style={{ background: '#222', color: '#fff', overflowY: 'auto' }}>
      <div style={{ maxWidth: '600px', width: '100%', padding: '20px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '2.5rem', color: '#fff', margin: 0 }}>PANEL ADMIN</h1>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ background: '#e21b3c', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Salir
          </button>
        </div>

        <div style={{ background: '#333', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#aaa' }}>Control Global</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                if(window.confirm('¿Desbloquear la página para TODOS?')) {
                  setGlobalUnlock(true);
                }
              }}
              style={{ flex: 1, background: gameState.globalUnlock ? '#555' : '#26890c', color: '#fff', border: 'none', padding: '15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {gameState.globalUnlock ? 'Página Desbloqueada' : 'Fuerza Acceso Anticipado'}
            </button>
            <button 
              onClick={() => {
                if(window.confirm('¿Cerrar el evento global/batalla actual para todos?')) {
                  clearGroupEvent();
                }
              }}
              style={{ flex: 1, background: gameState.globalEvent ? '#e21b3c' : '#555', color: '#fff', border: 'none', padding: '15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', opacity: gameState.globalEvent ? 1 : 0.5 }}>
              Cerrar Evento Activo
            </button>
            <button 
              onClick={() => {
                if(window.confirm('¿Terminar el juego para TODOS y mostrar ganador?')) {
                  setGameOver(true);
                }
              }}
              style={{ flex: 1, background: gameState.isGameOver ? '#555' : '#d89e00', color: '#fff', border: 'none', padding: '15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {gameState.isGameOver ? 'Juego Terminado' : 'Simular Fin de Partida'}
            </button>
            <button 
              onClick={() => {
                if(window.confirm('¿Estás seguro? Se borrará TODO (jugadores, misiones, monedas).')) {
                  resetAllPlayers();
                }
              }}
              style={{ flex: '1 1 100%', background: '#e21b3c', color: '#fff', border: 'none', padding: '15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
              Reiniciar Partida Completa
            </button>
          </div>

          {gameState.globalEvent?.type === 'Batalla de Equipos 2vs2' && (
            <div style={{ marginTop: '20px', background: '#444', padding: '15px', borderRadius: '8px', border: '2px dashed #FFD700' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#FFD700' }}>⚔️ Batalla Activa {gameState.globalEvent.tied ? '(¡EMPATE!)' : ''}</h3>
              <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem' }}>Fuerza un ganador para repartir automáticamente los premios y cerrar el evento.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => resolveBattleTie('team1')}
                  style={{ flex: 1, background: '#1368ce', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Ganar Equipo 1
                </button>
                <button 
                  onClick={() => resolveBattleTie('team2')}
                  style={{ flex: 1, background: '#d89e00', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Ganar Equipo 2
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#333', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#aaa' }}>Jugadores ({allPlayers.filter(p => p[1].name).length}/4)</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {allPlayers.map(([id, pData]) => {
              const isActive = !!pData.name;
              return (
                <div key={id} style={{ background: '#444', padding: '15px', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', opacity: isActive ? 1 : 0.5 }}>
                  <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: getPlayerColor(id) }}>
                      {pData.name || 'Esperando...'}
                    </div>
                    {isActive && (
                      <button 
                        onClick={() => {
                          if (window.confirm(`¿Echar a ${pData.name}? Perderá todo.`)) {
                            resetPlayer(id);
                          }
                        }}
                        style={{ background: 'transparent', color: '#e21b3c', border: '1px solid #e21b3c', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                        Echar Jugador
                      </button>
                    )}
                  </div>
                  
                  {isActive && (
                    <div style={{ flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#222', padding: '10px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '60px' }}>🪙 {pData.scores?.monedas || 0}</span>
                        <button onClick={() => saveGameState(id, { monedas: (pData.scores?.monedas || 0) - 10 })} style={{ flex: 1, padding: '8px', background: '#e21b3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>- 10</button>
                        <button onClick={() => saveGameState(id, { monedas: (pData.scores?.monedas || 0) + 10 })} style={{ flex: 1, padding: '8px', background: '#26890c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ 10</button>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#222', padding: '10px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '60px' }}>🎯 {pData.scores?.retos_completados || 0}</span>
                        <button onClick={() => saveGameState(id, { retos_completados: Math.max(0, (pData.scores?.retos_completados || 0) - 1) })} style={{ flex: 1, padding: '8px', background: '#e21b3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>- 1</button>
                        <button onClick={() => saveGameState(id, { retos_completados: (pData.scores?.retos_completados || 0) + 1 })} style={{ flex: 1, padding: '8px', background: '#26890c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ 1</button>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#222', padding: '10px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '60px' }}>💀 {pData.scores?.penalizaciones || 0}</span>
                        <button onClick={() => {
                          const currentPenalizaciones = pData.scores?.penalizaciones || 0;
                          if (currentPenalizaciones > 0) {
                            saveGameState(id, { penalizaciones: currentPenalizaciones - 1 });
                            const currentCurses = pData.curses || [];
                            if (currentCurses.length > 0) {
                              saveActiveCurses(id, currentCurses.slice(0, -1));
                            }
                          }
                        }} style={{ flex: 1, padding: '8px', background: '#e21b3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>- 1</button>
                        <button onClick={() => {
                          const currentPenalizaciones = pData.scores?.penalizaciones || 0;
                          saveGameState(id, { penalizaciones: currentPenalizaciones + 1 });
                          const currentCurses = pData.curses || [];
                          saveActiveCurses(id, [...currentCurses, { id: Date.now(), text: "Castigo sorpresa del Admin 💀", expiresAt: Date.now() + 600000 }]);
                        }} style={{ flex: 1, padding: '8px', background: '#26890c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ 1</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;
