import React, { Fragment } from 'react';
import { Unity } from "react-unity-webgl";

function MeetingStage({ unityProvider, message }) {
  return (
    <Fragment>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Unity unityProvider={unityProvider} style={{ width: 900, height: 450 }} />
      </div>
      <p>Message: {message}</p>
    </Fragment>
  );
}

export default MeetingStage;
