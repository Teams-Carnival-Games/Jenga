import React, { Fragment,useState, useEffect, useCallback } from "react";
import FluidService from "../services/fluidService";
import { Unity } from "react-unity-webgl";
import { app, meeting } from "@microsoft/teams-js";
import { useUnity } from "../services/unityweb";
import './Jenga.css';
import SidePanel from './SidePanel';
import MeetingStage from './MeetingStage';




function Jenga() {
  
  const [gameState, setGameState] = useState(null);
  const [playername, setPlayerName] = useState([]); // Change to array

  const [gameLoaded, setGameLoaded] = useState(false);
  const [unityLoaded, setUnityLoaded] = useState(false);
  const [isUnityInitialized, setIsUnityInitialized] = useState(false);
  const [fluidConnected, setFluidConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [frameContext, setFrameContext] = useState(null);



  const {
    unityContext,
    unityProvider,
    isLoaded,
    unityInstance,
    loadingProgression,
    unload,
    sendMessage,
    addEventListener,
    removeEventListener,
} = useUnity();



  const handleGameStateFromUnity = useCallback((gameStateJson) => {
    const gameState = JSON.parse(gameStateJson);
    setGameState(gameState);
    FluidService.updateGameState(gameStateJson); //receives gamestate from unity
  }, []);
  

  const handleAddPlayerName = useCallback((name) => {
    setPlayerName(name);
    FluidService.updatePlayerNames(name); //receives gamestate from unity
  }, []);

  // Function to handle when Unity notifies that the Start button was clicked
  function handleStartButtonPressedInUnity() {
    // Notify Fluid to start the game for all players
    FluidService.startGameForAllPlayers();
  }

  const shareToStage = () => {
      meeting.shareAppContentToStage((error, result) => {
        if (!error) {
          console.log("Started sharing to stage");
        } else {
          console.warn("shareAppContentToStage failed", error);
        }
      }, window.location.origin + "?inTeams=1&view=stage");
  };

  function startGame() {
    FluidService.resetGameState();  // Reset the Fluid container
    setGameStarted(true);
    shareToStage();
}



  
  useEffect(() => {
    if (isLoaded) { // Check if Unity is loaded
      addEventListener("SendPlayerNameToReact", handleAddPlayerName);
      addEventListener("SendStartButtonPressedToReact", handleStartButtonPressedInUnity);
      addEventListener("SendGameState", handleGameStateFromUnity);


      return () => {
        removeEventListener("SendPlayerNameToReact", handleAddPlayerName);
        removeEventListener("SendStartButtonPressedToReact", handleStartButtonPressedInUnity);
        removeEventListener("SendGameState", handleGameStateFromUnity);


      };
    }
  }, [isLoaded, addEventListener, removeEventListener, handleAddPlayerName,handleStartButtonPressedInUnity, handleGameStateFromUnity]); // Depend on Unity loaded state
  
  useEffect(() => {
    const checkTeamsContext = async () => {
      const context = await app.getContext();
      const frameContextValue = context.page.frameContext;
      console.log("Teams frame context:", frameContextValue);
      setFrameContext(frameContextValue);
    };
  
    checkTeamsContext();
  }, []);
  

  // Update this part
  useEffect(() => {
    app.initialize().then(async () => {
      try {
        await FluidService.connect();
        const playername = await FluidService.getPlayerNames();
        console.log("playername!:", playername);

        FluidService.onNewPlayerNames((playerNamesArray) => {
          if (!isLoaded) {
            setPlayerName(playerNamesArray); // Set the array directly
            const playerNamesJSON = JSON.stringify({ names: playerNamesArray });

            console.log("being sent to unity!:", playerNamesJSON);
            sendMessage("LobbyManager", "UpdatePlayerList", playerNamesJSON);

            setFluidConnected(true);
            setGameLoaded(true);
          } else {
            setPlayerName(playerNamesArray); // Set the array directly
            console.log("PLAYERNAME: ", JSON.stringify(playerNamesArray));
          }

        });



        FluidService.onNewGameState((fluidGameState) => {

          if (!isLoaded)
        {
          setGameState(fluidGameState); 
          console.log("being sent to unity!!!!!:", fluidGameState);
          console.log("being sent to unity!:", JSON.stringify(fluidGameState));
          
          sendMessage("JengaGameController", "LoadGameState", fluidGameState);


  
          setFluidConnected(true);
          setGameLoaded(true);

        }
        else 
        {
          setGameState(fluidGameState);   
        }
   
        setMessage("Fluid is doing well");

        });
      } catch (error) {
        console.error("ERROR: ", error);
        setMessage(`ERROR: ${error.message}`);
      }
    });

}, [sendMessage, isLoaded]);

  useEffect(() => {
    FluidService.onGameStarted(() => {
      // Notify Unity to start the game
      sendMessage("LobbyManager", "StartGameForAllPlayers");
    });
  }, [sendMessage]);


  const handleClearPlayerNames = () => {
    FluidService.resetGameState();
  };
  

return (
  <Fragment>
    {frameContext === "sidePanel" ? (
      <SidePanel startGame={startGame} />
    ) : (
      <MeetingStage unityProvider={unityProvider}  />
    )}
  </Fragment>
);

  

}

export default Jenga;
