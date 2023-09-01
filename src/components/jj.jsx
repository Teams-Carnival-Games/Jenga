import React, { Fragment,useState, useEffect, useCallback } from "react";
import FluidService from "../services/fluidService";
import { Unity, useUnityContext } from "react-unity-webgl";
import { app } from "@microsoft/teams-js";


function Jenga() {
  
  const [gameState, setGameState] = useState(null);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [unityLoaded, setUnityLoaded] = useState(false);
  const [isUnityInitialized, setIsUnityInitialized] = useState(false);
  const [fluidConnected, setFluidConnected] = useState(false);
  const [message, setMessage] = useState("");



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
  } = useUnityContext({
    loaderUrl: "build/build.loader.js",
    dataUrl: "build/build.data",
    frameworkUrl: "build/build.framework.js",
    codeUrl: "build/build.wasm",
  });

  const handleGameState = useCallback((state) => {
    setGameState(state);
    FluidService.updateGameState(state); //receives gamestate from unity
  }, []);
  
  useEffect(() => {
    if (isLoaded) { // Check if Unity is loaded
      addEventListener("SendGameState", handleGameState);
      return () => {
        removeEventListener("SendGameState", handleGameState);
      };
    }
  }, [isLoaded, addEventListener, removeEventListener, handleGameState]); // Depend on Unity loaded state
  



  
  useEffect(() => {
    app.initialize().then(async () => {
      try {
        await FluidService.connect();
        
        const fluidGameState = await FluidService.getGameState();
        setGameState(fluidGameState);

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

          console.log("gamestateinreact: ", JSON.stringify(fluidGameState));


       
        }
   
        setMessage("Fluid is doing well");
      });

      } catch (error) {
        console.error("ERROR: ", error);
        setMessage(`ERROR: ${error.message}`);
      }
    });
  }, [sendMessage]);


  

  return (
    <Fragment>
    <p>Unity Loaded: {isLoaded.toString()}</p>
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <Unity unityProvider={unityProvider} />
    </div>
    <p>Message: {message}</p>

    </Fragment>
  );
}

export default Jenga;
