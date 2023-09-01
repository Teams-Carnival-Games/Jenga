import React, { useState } from 'react';
import Jenga from './Jenga';
import { StartGame } from './StartGame'; // Import the StartGame component

function GameContainer() {
  const [isGameStarted, setIsGameStarted] = useState(false);

  // This function will be called when all users are ready in StartGame
  const onStartGame = () => {
    setIsGameStarted(true);
  };

  return (
    <div>
      {isGameStarted ? <Jenga /> : <StartGame onStartGame={onStartGame} />}
    </div>
  );
}

export default GameContainer;
