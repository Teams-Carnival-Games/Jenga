import React from 'react';
import './Jenga.css';

function SidePanel({ startGame }) {
  return (
    <div className="side-panel-content">
      <h2>Welcome to Jenga on Teams!</h2>
      <p>Press the button below to start playing.</p>
      <button onClick={startGame}>Start Playing</button>
    </div>
  );
}

export default SidePanel;
