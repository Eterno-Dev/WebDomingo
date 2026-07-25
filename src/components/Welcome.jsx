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
            <h3 style={{ fontFamily: "'Fredoka', sans-serif", color: '#e21b3c', fontSize: '1.8rem', fontWeight: '900', marginBottom: '1rem' }}>REGLAS DE LA FIESTA</h3>
            <div style={{ margin: '1.5rem 0', textAlign: 'left' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                <strong style={{ color: '#1368ce', display: 'block' }}>1. ACTITUD</strong>
                Queda totalmente prohibido el aburrimiento. El que pierda un reto, PAGA.
              </p>
              <p style={{ fontSize: '1.1rem' }}>
                <strong style={{ color: '#26890c', display: 'block' }}>2. COMPAÑERISMO</strong>
                Todo lo que pasa en Los Cuñis, se queda en Los Cuñis.
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
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '15px', fontSize: '1.2rem', textAlign: 'center', border: '2px solid #ccc', borderRadius: '4px', marginBottom: '20px', fontWeight: 'bold' }}
          />
          <button 
            disabled={!name.trim()}
            onClick={() => setStep(3)} 
            style={{ width: '100%', padding: '15px', fontSize: '1.2rem', fontWeight: 'bold', background: name.trim() ? '#e21b3c' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: name.trim() ? 'pointer' : 'not-allowed', boxShadow: name.trim() ? '0 4px 0 #b0102b' : 'none' }}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Color Selection (Step 3) */}
      {step === 3 && (
        <>
          <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Hola, {name}. ¡Elige tu color!
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', width: '100%', maxWidth: '400px' }}>
            <div onClick={() => handleGenderSelect('cuni1')} style={{ background: '#e21b3c', height: '150px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 0 #b0102b', transition: 'transform 0.1s' }}>
              <strong style={{ fontSize: '1.5rem' }}>Perfil 1</strong>
            </div>
            <div onClick={() => handleGenderSelect('cuni2')} style={{ background: '#1368ce', height: '150px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 0 #0d4a99', transition: 'transform 0.1s' }}>
              <strong style={{ fontSize: '1.5rem' }}>Perfil 2</strong>
            </div>
            <div onClick={() => handleGenderSelect('cuni3')} style={{ background: '#d89e00', height: '150px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 0 #b38200', transition: 'transform 0.1s' }}>
              <strong style={{ fontSize: '1.5rem' }}>Perfil 3</strong>
            </div>
            <div onClick={() => handleGenderSelect('cuni4')} style={{ background: '#26890c', height: '150px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 0 #1f7309', transition: 'transform 0.1s' }}>
              <strong style={{ fontSize: '1.5rem' }}>Perfil 4</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Welcome;
