import { LiveShareClient, LivePresence } from "@microsoft/live-share";
import { LiveShareHost, call } from "@microsoft/teams-js";
import { SharedMap } from "fluid-framework";

class FluidService {

  #PLAYER_NAMES_KEY = "player-names-key";
  #GAME_STARTED_KEY = "game-started-key";
  #GAME_STATE_KEY = "game-state-key"; 


  #container;
  #registeredPlayerNameEventHandlers = [];
  #registeredGameStartedEventHandlers = [];
  #registeredEventHandlers = [];


  #connectPromise;
  #playernames = []; // Change this to an array
  #gameState = {}; 


  connect = () => {
      if (!this.#connectPromise) {
          this.#connectPromise = this.#connect();
      }
      return this.#connectPromise;
  }
  #connect = async () => {
    try {
        const liveShareHost = LiveShareHost.create();
        const liveShareClient = new LiveShareClient(liveShareHost);
        const { container } = await liveShareClient.joinContainer(
          {
            initialObjects: { 
              gameStateMap: SharedMap, 
            } 
        });
        console.log("liveShareClient.joinContainer worked");
        this.#container = container;
        this.#playernames = [];
        this.#gameState = {};


          console.log("container.initialObjects: ", this.#container.initialObjects);
          console.log("playernames: ", this.#playernames);
          console.log("gamestate: ", this.#gameState);


          this.#container.initialObjects.gameStateMap.on("valueChanged", async (changed, local) => {
            // Check if the changed key matches the key you care about
            if (changed.key !== this.#PLAYER_NAMES_KEY) {
              return; // If not, return early
            }
          
            const json = this.#container.initialObjects.gameStateMap.get(this.#PLAYER_NAMES_KEY);
            console.log("container.playernames: ", this.#container);
            this.#playernames = JSON.parse(json);
            for (let handler of this.#registeredPlayerNameEventHandlers) {
              await handler(this.#playernames);
            }
          });
          


          this.#container.initialObjects.gameStateMap.on("valueChanged", (changed, local) => {
            if (changed.key !== this.#GAME_STARTED_KEY) {
              return; // Ignore changes to other keys
            }
          
            const json = this.#container.initialObjects.gameStateMap.get(this.#GAME_STARTED_KEY);
            const gameStarted = json ? JSON.parse(json) : false;
            if (gameStarted) {
              for (let handler of this.#registeredGameStartedEventHandlers) {
                handler();
              }
            }
          });
          
          
          this.#container.initialObjects.gameStateMap.on("valueChanged", async (changed, local) => {
            if (changed.key !== this.#GAME_STATE_KEY) {
              return; // Ignore changes to other keys
            }
          
            const json = this.#container.initialObjects.gameStateMap.get(this.#GAME_STATE_KEY);
            if (json !== undefined) {
              this.#gameState = JSON.parse(json);
              console.log("gamestate: ", this.#gameState);
              for (let handler of this.#registeredEventHandlers) {
                  await handler(this.#gameState);
              }
            } else {
              console.warn('Value is undefined, cannot parse as JSON');
            }
          });
          
          
          
          



      
        } catch (error) {
          console.log(`Error in fluid service: ${error.message}`); 
          throw error;
        }
      }




  

  updatePlayerNames = async (playerName) => {
    if (!this.#container || !this.#container.initialObjects.gameStateMap) {
      console.log("Container or playerNamesMap is undefined!");
      return;
    }

    // Get the existing player names
    const json = this.#container.initialObjects.gameStateMap.get(this.#PLAYER_NAMES_KEY);
    const existingPlayerNames = json ? JSON.parse(json) : [];

    // Add the new name
    existingPlayerNames.push(playerName);

    // Set the updated list back
    const updatedJson = JSON.stringify(existingPlayerNames);
    this.#container.initialObjects.gameStateMap.set(this.#PLAYER_NAMES_KEY, updatedJson);

    console.log("Player names map updated at:", new Date().toISOString());
    console.log("updated is:", existingPlayerNames);
  };

  getPlayerNames = async () => {
    const json = this.#container.initialObjects.gameStateMap.get(this.#PLAYER_NAMES_KEY);
    return json ? JSON.parse(json) : null;
  }

  onNewPlayerNames = (handler) => {
    this.#registeredPlayerNameEventHandlers.push(handler);
    console.log("registeredPlayerNameEventHandlers:", handler);
  }

  
  resetGameState = () => {
    if (!this.#container || !this.#container.initialObjects.gameStateMap) {
      console.log("Container or gameStateMap is undefined!");
      return;
    }
    
    // Clear player names
    this.#container.initialObjects.gameStateMap.set(this.#PLAYER_NAMES_KEY, JSON.stringify([]));
    console.log("Player names cleared at:", new Date().toISOString());
  
    // Reset the game started state
    this.#container.initialObjects.gameStateMap.set(this.#GAME_STARTED_KEY, JSON.stringify(false));
    console.log("Game started state reset at:", new Date().toISOString());
  
    // Clear the game state
    this.#gameState = {};
    this.#container.initialObjects.gameStateMap.set(this.#GAME_STATE_KEY, JSON.stringify({}));
    console.log("Game state cleared.");
  
    // Clear onNewGameState event handlers
    this.#registeredEventHandlers = [];
    console.log("onNewGameState event handlers cleared.");
  
    // You can add more lines here to reset other parts of the state as needed
  };
  
  
  
  startGameForAllPlayers = () => {
    if (!this.#container || !this.#container.initialObjects.gameStateMap) {
      console.log("Container or gameStateMap is undefined!");
      return;
    }
    
    this.#container.initialObjects.gameStateMap.set(this.#GAME_STARTED_KEY, JSON.stringify(true));
    console.log("Game started at:", new Date().toISOString());
  };
  

  onGameStarted = (handler) => {
    this.#registeredGameStartedEventHandlers.push(handler);
  };


  updateGameState = async (newGameState) => {
    if (!this.#container || !this.#container.initialObjects.gameStateMap) {
      console.log("Container or initialObjects is undefined!");
      return;
    }
  
    // Update the local game state with the new state
    this.#gameState = newGameState;
  
    // Convert the new game state to JSON
    const json = JSON.stringify(newGameState);
  
    // Update the SharedMap with the new game state JSON
    this.#container.initialObjects.gameStateMap.set(this.#GAME_STATE_KEY, json);
  
    console.log("Shared map updated at: ", new Date().toISOString());
  }




  onNewGameState = (handler) => {
    this.#registeredEventHandlers.push(handler);
    console.log("registeredEventHandlers: ", handler);

}
  

}
export default new FluidService();