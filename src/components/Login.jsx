import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Single burst on load
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.toUpperCase() === 'PARTY') {
      onLogin(false, false); // onLogin(isDebugMode, isAdmin)
    } else if (password.toUpperCase() === 'PARTY_DEBUG') {
      onLogin(true, false);
    } else if (password.toUpperCase() === 'ADMIN') {
      onLogin(false, true);
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="screen-container" style={{ background: '#46178f', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '4.5rem', color: '#fff', fontWeight: '900', marginBottom: '2rem', textAlign: 'center', textShadow: '2px 4px 10px rgba(0,0,0,0.3)', padding: '0 20px', zIndex: 10 }}>
        Los Cuñis!
      </h1>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '30px', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '350px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={(e) => { setPassword(e.target.value.toUpperCase()); setError(''); }}
          style={{ width: '100%', padding: '15px', fontSize: '1.2rem', textAlign: 'center', border: '2px solid #ccc', borderRadius: '4px', marginBottom: '15px', fontWeight: 'bold' }}
        />
        <button type="submit" style={{ width: '100%', padding: '15px', fontSize: '1.2rem', fontWeight: '900', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 4px 0 #111' }}>
          Entrar
        </button>
        {error && <div style={{ color: '#e21b3c', marginTop: '15px', fontWeight: 'bold' }}>{error}</div>}
      </form>
    </div>
  );
}

export default Login;
