import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { listenToGameState } from '../firebase';

function Welcome({ onSelectGender }) {
  const [showWarning, setShowWarning] = useState(true);
  const [name, setName] = useState('');
  const [step, setStep] = useState(1); // 1 = Rules, 2 = Name, 3 = Color
  const [gameState, setGameState] = useState(null);

  // Continuous Confetti effect
  useEffect(() => {
    const duration = 15 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
      });

      if (Date.now() < end && step === 1) {
        requestAnimationFrame(frame);
      }
    };

    if (step === 1) {
      frame();
    }
  }, [step]);

  useEffect(() => {
    listenToGameState((state) => {
      setGameState(state);
    });
  }, []);

  const handleGenderSelect = (gender) => {
    localStorage.setItem('hh_gender', gender);
    localStorage.setItem('hh_name', name);
    onSelectGender(gender, name);
  };

  return (
    <div className="screen-container" style={{ background: '#46178f', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '3.5rem', marginBottom: '1rem', textAlign: 'center', fontWeight: '900', textShadow: '2px 4px 10px rgba(0,0,0,0.3)', zIndex: 10 }}>
        Los Cuñis!
      </h2>

      {/* Warning Modal (Step 1) */}
      {step === 1 && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ background: '#fff', color: '#333', border: 'none', borderRadius: '8px', zIndex: 20 }}>
            <h3 style={{ fontFamily: "'Fredoka', sans-serif", color: '#e21b3c', fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem' }}>REGLAS DE LA FIESTA</h3>
            <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
              <p style={{ fontSize: '1.4rem', color: '#333', fontWeight: 'bold' }}>
                Realiza los retos y recibe castigos o premios.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)} style={{ width: '100%', padding: '15px', fontFamily: "'Montserrat', sans-serif", fontSize: '1.2rem', fontWeight: 'bold' }}>
              ¡A JUGAR!
            </button>
          </div>
        </div>
      )}

      {/* Name Input (Step 2) */}
      {step === 2 && (
        <div style={{ width: '100%', maxWidth: '350px', background: '#fff', padding: '30px', borderRadius: '8px', color: '#333', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', zIndex: 20 }}>
          <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '2rem', fontWeight: '900', marginBottom: '20px' }}>¿Cómo te llamas?</h3>
          <input 
            type="text" 
            placeholder="Escribe tu nombre..." 
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            style={{ width: '100%', padding: '15px', fontSize: '1.2rem', textAlign: 'center', border: '2px solid #ccc', borderRadius: '4px', marginBottom: '20px', fontWeight: 'bold' }}
          />
          <button 
            disabled={!name.trim()}
            onClick={() => {
              if (!gameState) {
                alert("Conectando al servidor, espera un segundo...");
                return;
              }
              const allColors = ['cuni1', 'cuni2', 'cuni3', 'cuni4'];
              const availableColors = allColors.filter(c => !gameState.players[c]?.name);
              
              if (availableColors.length === 0) {
                alert("¡La sala está llena! Ya hay 4 jugadores conectados.");
                return;
              }

              const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
              handleGenderSelect(randomColor);
            }} 
            style={{ width: '100%', padding: '15px', fontFamily: "'Montserrat', sans-serif", fontSize: '1.2rem', fontWeight: 'bold', background: name.trim() ? '#e21b3c' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: name.trim() ? 'pointer' : 'not-allowed', boxShadow: name.trim() ? '0 4px 0 #b0102b' : 'none' }}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default Welcome;
