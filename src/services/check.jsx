import React, { Fragment, useState, useEffect, useCallback, useRef } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import FluidService from "../services/fluidService";
import { app } from "@microsoft/teams-js";

export default function Jenga() {

  // Initializing states
  const [movedBlock, setMovedBlock] = useState(null);
  const [isLocalAction, setIsLocalAction] = useState(false);
  const [lastMessageToFluid, setLastMessageToFluid] = useState(null);
  const [lastGameState, setLastGameState] = useState(null);
  const [fluidServiceReady, setFluidServiceReady] = useState(false);

  const messageQueue = useRef([]); // Hold messages to be sent to Unity when it's ready

  // Unity context
  const { unityProvider, isLoaded, loadingProgression, unload, sendMessage, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "build/build.loader.js",
    dataUrl: "build/build.data",
    frameworkUrl: "build/build.framework.js",
    codeUrl: "build/build.wasm",
  });

  // Window Event Dispatch
  window.dispatchReactUnityEvent = function(eventName, eventData) {
    const event = new Event(eventName);
    event.data = eventData;
    window.dispatchEvent(event);
  };

  // Function to handle unloading of Unity
  async function handleUnload() {
    await unload();
  }

  // Callbacks for Unity Events
  // This handles block movement
  const handleBlockMoved = useCallback((blockNameAndState) => { /* Code here */}, [fluidServiceReady, isLocalAction, lastMessageToFluid]);

  // This handles game state updates
  const handleGameState = useCallback((gameState) => { /* Code here */ }, [fluidServiceReady, isLocalAction, setLastGameState, FluidService]); // Add fluidService to the dependencies

  // Fetches game state from Fluid
  const getGameStateFromFluid = () => {/* Code here */};

  // Event Listener Effects
  useEffect(() => { /* Code here */ }, [handleBlockMoved, handleGameState]);

  // Logs the loading status of Unity and Fluid
  useEffect(() => { /* Code here */ }, [isLoaded, fluidServiceReady, loadingProgression, sendMessage]);

  // Adds Unity event listeners, sends queued messages, and initializes Unity with game state
  useEffect(() => { /* Code here */ }, [isLoaded, addEventListener, removeEventListener, handleBlockMoved, handleGameState, sendMessage]);

  // Initializes the Fluid Service, and sets up Unity with game state fetched from Fluid
  useEffect(() => { /* Code here */ }, [lastGameState, isLoaded]);

  // Handles events received from Fluid
  useEffect(() => { /* Code here */ }, [isLoaded, sendMessage, lastMessageToFluid, lastGameState]);  // Add lastGameState to the dependencies

  // Component Render
  eturn (
    <Fragment>
      {fluidServiceReady ? (
        <div>
          <p>Unity status: {isLoaded.toString()}</p>
          <p>Loading progression: {Math.round(loadingProgression * 100)}%</p>

          <div style={{ width: '90%', aspectRatio: '16/9' }}>
            <Unity unityProvider={unityProvider} style={{ width: '150%', height: '200%' }} />
          </div>
          {movedBlock && <p>Block Moved: {movedBlock}</p>}
          <button onClick={handleUnload}>Unload Unity</button>

        </div>
      ) : (
        <p>Waiting for Fluid service to initialize...</p>
      )}
    </Fragment>
  );
}