import React from 'react';
import { useLivePresence } from "@microsoft/live-share-react";

const MY_UNIQUE_KEY = "presence-key";

export const StartGame = ({ onStartGame }) => {
    const { allUsers, localUser, updatePresence } = useLivePresence(MY_UNIQUE_KEY, {
      picture: "DEFAULT_PROFILE_PICTURE_URL",
      readyToStart: false,
    });

    const livePresenceData = useLivePresence(MY_UNIQUE_KEY, {
        picture: "DEFAULT_PROFILE_PICTURE_URL",
        readyToStart: false,
      });
      console.log("Live presence data:", livePresenceData);
      

    console.log("All users:", allUsers); // Log all users
    console.log("Local user:", localUser); // Log local user


    const onToggleReady = () => {
        console.log("Toggling ready state");
        updatePresence({
          ...localUser.data,
          readyToStart: !localUser.data.readyToStart,
        });
      };
      


  const allReady = allUsers.length > 0 && allUsers.every(user => user.data.readyToStart);

  if (allReady && onStartGame) {
    onStartGame(); // Call callback to start the game
  }

  return (
    <div>
      {allUsers.map((user) => (
        <div key={user.userId}>
          <div>{user.displayName}</div>
          <div>{`Ready: ${user.data.readyToStart}`}</div>
          {user.isLocalUser && (
            <button onClick={onToggleReady}>{"Toggle ready"}</button>
          )}
        </div>
      ))}
    </div>
  );
}
