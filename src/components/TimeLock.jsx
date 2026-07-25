import React, { useState, useEffect } from 'react';

// SET YOUR PARTY START TIME HERE
// By default, it sets to today at 18:00 (6:00 PM)
const getPartyTime = () => {
  const t = new Date();
  t.setHours(18, 0, 0, 0);
  return t;
};
const PARTY_START_TIME = getPartyTime();

function TimeLock({ onUnlock }) {
  const [timeLeft, setTimeLeft] = useState(PARTY_START_TIME - new Date());
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = PARTY_START_TIME - new Date();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        onUnlock();
      }
    }, 1000);

    // Initial check
    if (PARTY_START_TIME - new Date() <= 0) {
      onUnlock();
    }

    return () => clearInterval(timer);
  }, [onUnlock]);

  const formatTime = (ms) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSecretUnlock = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 4) {
      onUnlock(); // Unlock on 5th click (hidden bypass)
    }
  };

  return (
    <div className="screen-container" style={{ background: '#46178f', color: '#fff' }}>
      <div style={{ textAlign: 'center', background: '#fff', color: '#333', padding: '40px', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.3)', maxWidth: '400px', width: '100%' }}>
        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '20px', cursor: 'pointer' }} onClick={handleSecretUnlock} title="Click me 5 times to bypass">⏳</span>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#e21b3c', marginBottom: '10px' }}>¡LA FIESTA AÚN NO HA EMPEZADO!</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', fontWeight: 'bold' }}>
          La página está bloqueada.<br/>
          Se abrirá automáticamente en:
        </p>
        <div style={{ background: '#333', color: '#fff', fontSize: '3rem', fontWeight: '900', padding: '15px', borderRadius: '4px', letterSpacing: '5px' }}>
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
}

export default TimeLock;
