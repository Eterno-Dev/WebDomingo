import React, { useState, useEffect } from 'react';
import { listenToGameState } from '../firebase';

// SET YOUR PARTY START TIME HERE
// By default, it sets to today at 18:00 (6:00 PM)
const getPartyTime = () => {
  const t = new Date();
  t.setHours(18, 15, 0, 0);
  // If we are past 18:15 today, set for tomorrow
  if (t < new Date()) {
    t.setDate(t.getDate() + 1);
  }
  return t;
};
const PARTY_START_TIME = getPartyTime();

function TimeLock({ onUnlock }) {
  const [timeLeft, setTimeLeft] = useState(PARTY_START_TIME - new Date());

  useEffect(() => {
    listenToGameState((state) => {
      if (state.globalUnlock) {
        onUnlock();
      }
    });

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

  return (
    <div className="screen-container" style={{ background: '#46178f', color: '#fff', padding: '20px' }}>
      <div style={{ textAlign: 'center', background: '#fff', color: '#333', padding: '30px 20px', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.3)', maxWidth: '400px', width: '100%' }}>
        
        {/* ALARM POPUP NOTICE */}
        <div style={{ background: '#ffd700', color: '#333', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '1.1rem', border: '2px solid #d89e00', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          ⏰ ¡Ponte una alarma para las 18:15h!<br/>
          <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>Vuelve a entrar a la web cuando suene.</span>
        </div>

        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }}>⏳</span>
        <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '2rem', fontWeight: '900', color: '#e21b3c', marginBottom: '10px' }}>¡LA FIESTA AÚN NO HA EMPEZADO!</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: 'bold' }}>
          La página está bloqueada.<br/>
          Se abrirá automáticamente en:
        </p>
        
        {/* REDUCED COUNTDOWN FONT SIZE FOR MOBILE */}
        <div style={{ background: '#333', color: '#fff', fontSize: '2.2rem', fontWeight: '900', padding: '15px 10px', borderRadius: '4px', letterSpacing: '2px', marginBottom: '10px', whiteSpace: 'nowrap' }}>
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
}

export default TimeLock;
