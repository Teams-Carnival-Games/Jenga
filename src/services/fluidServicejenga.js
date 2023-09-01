import { LiveShareClient, LivePresence } from "@microsoft/live-share";
import { LiveShareHost, call } from "@microsoft/teams-js";
import { SharedMap } from "fluid-framework";




class FluidService {

  #GAME_STATE_KEY = "game-state-key"; 
  #PLAYER_NAMES_KEY = "player-names-key";
  #GAME_STARTED_KEY = "game-started-key";

  #container;
  #registeredEventHandlers = [];
  #registeredPlayerNameEventHandlers = [];
  #registeredGameStartedEventHandlers = [];

  #connectPromise;
  #playernames = []; // Change this to an array

  #gameState = new GameState();


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

          console.log("container.initialObjects: ", this.#container.initialObjects);
          console.log("playernames: ", this.#playernames);

          this.#container.initialObjects.gameStateMap.on("valueChanged", async () => {
            const json = this.#container.initialObjects.gameStateMap.get(this.#PLAYER_NAMES_KEY);
            console.log("container.playernames: ", this.#container);
            this.#playernames = JSON.parse(json);
            for (let handler of this.#registeredPlayerNameEventHandlers) {
              await handler(this.#playernames);
            }
          });


          this.#container.initialObjects.gameStateMap.on("valueChanged", () => {
            const json = this.#container.initialObjects.gameStateMap.get(this.#GAME_STARTED_KEY);
            const gameStarted = json ? JSON.parse(json) : false;
            if (gameStarted) {
              for (let handler of this.#registeredGameStartedEventHandlers) {
                handler();
              }
            }
          });

          this.#container.initialObjects.gameStateMap.on("valueChanged", async () => { 
            const json = this.#container.initialObjects.gameStateMap.get(this.#GAME_STATE_KEY);
            this.#gameState = JSON.parse(json); // Assuming the JSON matches the GameState structure
            console.log("gamestate: ", this.#gameState);
            for (let handler of this.#registeredEventHandlers) {
                await handler(this.#gameState);
            }
          });
          

            
      
        } catch (error) {
          console.log(`Error in fluid service: ${error.message}`); 
          throw error;
        }
      }




  clearGameState = () => {
    if (!this.#container || !this.#container.initialObjects.gameStateMap) {
      console.log("Container or gameStateMap is undefined!");
      return;
    }
    // Clear the specific keys related to the game state
    this.#container.initialObjects.gameStateMap.delete(this.#GAME_STATE_KEY);
    this.#container.initialObjects.gameStateMap.delete(this.#PLAYER_NAMES_KEY);
    this.#container.initialObjects.gameStateMap.delete(this.#GAME_STARTED_KEY);
  
    console.log("Game state keys cleared at:", new Date().toISOString());
  
    // Optionally, you can reinitialize the game state here
    this.#gameState = new GameState();
  };
      

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

  
  clearPlayerNames = () => {
    if (!this.#container || !this.#container.initialObjects.gameStateMap) {
      console.log("Container or playerNamesMap is undefined!");
      return;
    }
    this.#container.initialObjects.gameStateMap.set(this.#PLAYER_NAMES_KEY, JSON.stringify([]));
    console.log("Player names cleared at:", new Date().toISOString());
  }
  
  startGameForAllPlayers = () => {
    if (!this.#container || !this.#container.initialObjects.gameStateMap) {
      console.log("Container or gameStateMap is undefined!");
      return;
    }
  
    // Set the game started key
    this.#container.initialObjects.gameStateMap.set(this.#GAME_STARTED_KEY, JSON.stringify(true));
    console.log("Game started at:", new Date().toISOString());

      
    // Clear the existing game state
    this.clearGameState();
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
