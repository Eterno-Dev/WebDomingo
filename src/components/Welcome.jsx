import React, { useState } from 'react';

function Welcome({ onSelectGender }) {
  const [showWarning, setShowWarning] = useState(true);
  const [name, setName] = useState('');
  const [step, setStep] = useState(1); // 1 = Rules, 2 = Name, 3 = Color

  const handleGenderSelect = (gender) => {
    localStorage.setItem('hh_gender', gender);
    localStorage.setItem('hh_name', name);
    onSelectGender(gender, name);
  };

  return (
    <div className="screen-container" style={{ background: '#46178f', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '3.5rem', marginBottom: '1rem', textAlign: 'center', fontWeight: '900', textShadow: '2px 4px 10px rgba(0,0,0,0.3)' }}>
        🎉 Los Cuñis! 🥂
      </h2>

      {/* Warning Modal (Step 1) */}
      {step === 1 && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ background: '#fff', color: '#333', border: 'none', borderRadius: '8px' }}>
            <h3 style={{ fontFamily: "'Fredoka', sans-serif", color: '#e21b3c', fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem' }}>REGLAS DE LA FIESTA</h3>
            <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
              <p style={{ fontSize: '1.4rem', color: '#333', fontWeight: 'bold' }}>
                Realiza los retos y recibe castigos o premios.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)} style={{ width: '100%', padding: '15px', fontFamily: "'Fredoka', sans-serif", fontSize: '1.2rem' }}>
              ¡A JUGAR!
            </button>
          </div>
        </div>
      )}

      {/* Name Input (Step 2) */}
      {step === 2 && (
        <div style={{ width: '100%', maxWidth: '350px', background: '#fff', padding: '30px', borderRadius: '8px', color: '#333', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
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
              const colors = ['cuni1', 'cuni2', 'cuni3', 'cuni4'];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              handleGenderSelect(randomColor);
            }} 
            style={{ width: '100%', padding: '15px', fontSize: '1.2rem', fontWeight: 'bold', background: name.trim() ? '#e21b3c' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: name.trim() ? 'pointer' : 'not-allowed', boxShadow: name.trim() ? '0 4px 0 #b0102b' : 'none' }}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default Welcome;
