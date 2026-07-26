import React, { useState, useEffect } from 'react';
import TimeLock from './components/TimeLock';
import Login from './components/Login';
import Welcome from './components/Welcome';
import PhaseManager from './components/PhaseManager';
import AdminPanel from './components/AdminPanel';

function App() {
  const [isTimeUnlocked, setIsTimeUnlocked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gender, setGender] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    // Check if user already bypassed time lock or logged in
    const savedUnlock = localStorage.getItem('hh_unlocked') === 'true';
    if (savedUnlock) setIsTimeUnlocked(true);

    const savedGender = localStorage.getItem('hh_gender');
    const savedName = localStorage.getItem('hh_name');
    const savedDebug = localStorage.getItem('hh_debug') === 'true';
    const savedAdmin = localStorage.getItem('hh_admin') === 'true';
    
    if (savedAdmin) {
      setIsLoggedIn(true);
      setIsAdmin(true);
    } else if (savedGender) {
      setIsTimeUnlocked(true);
      setIsLoggedIn(true);
      setGender(savedGender);
      setPlayerName(savedName || 'Jugador');
      setIsDebugMode(savedDebug);
    }
  }, []);

  const handleUnlock = () => {
    setIsTimeUnlocked(true);
    localStorage.setItem('hh_unlocked', 'true');
  };

  const handleLogin = (debugMode, adminMode = false) => {
    setIsLoggedIn(true);
    if (adminMode) {
      setIsAdmin(true);
      localStorage.setItem('hh_admin', 'true');
    } else {
      setIsDebugMode(debugMode);
      localStorage.setItem('hh_debug', debugMode);
    }
  };

  const handleGenderSelect = (selectedGender, name) => {
    setGender(selectedGender);
    setPlayerName(name);
  };

  if (isLoggedIn && isAdmin) {
    return <AdminPanel />;
  }

  return (
    <>
      {!isLoggedIn && <Login onLogin={handleLogin} />}
      {isLoggedIn && !isAdmin && !isTimeUnlocked && <TimeLock onUnlock={handleUnlock} />}
      {isLoggedIn && !isAdmin && isTimeUnlocked && !gender && <Welcome onSelectGender={handleGenderSelect} />}
      {isLoggedIn && !isAdmin && isTimeUnlocked && gender && <PhaseManager gender={gender} playerName={playerName} isDebugMode={isDebugMode} />}

      {/* Debug Reset Button */}
      {(isDebugMode || isAdmin) && (
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.7rem',
            padding: '5px 10px',
            cursor: 'pointer',
            zIndex: 9999
          }}
        >
          Reset App (Debug)
        </button>
      )}
    </>
  );
}

export default App;
