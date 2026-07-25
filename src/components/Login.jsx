import React, { useState } from 'react';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'PARTY') {
      onLogin(false);
    } else if (password === 'PARTY_DEBUG') {
      onLogin(true);
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="screen-container" style={{ background: '#46178f' }}>
      <h1 style={{ fontSize: '4rem', color: '#fff', fontWeight: '900', marginBottom: '2rem', letterSpacing: '-2px' }}>
        LOS CUÑIS!
      </h1>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '30px', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '350px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
        <input 
          type="password" 
          placeholder="Game PIN" 
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          style={{ width: '100%', padding: '15px', fontSize: '1.2rem', textAlign: 'center', border: '2px solid #ccc', borderRadius: '4px', marginBottom: '15px', fontWeight: 'bold' }}
        />
        <button type="submit" style={{ width: '100%', padding: '15px', fontSize: '1.2rem', fontWeight: 'bold', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 4px 0 #111' }}>
          Enter
        </button>
        {error && <div style={{ color: '#e21b3c', marginTop: '15px', fontWeight: 'bold' }}>{error}</div>}
      </form>
    </div>
  );
}

export default Login;
