import React, { useState } from "react";
import GridComponent from "./GridComponent.js";
import "./App.css";

const MIN_STRETCH = 0.0;
const MAX_STRETCH = 1.0;
const STRETCH_STEP = 0.01;

function StretchComponent({ stretch, setStretch, setMaximumStretch }) {
  return (
    <div className="StretchComponent">
      <input
        type="range"
        value={stretch}
        min={MIN_STRETCH}
        max={MAX_STRETCH}
        step={STRETCH_STEP}
        onChange={event => setStretch(event.target.value)}
      />
      <div>{stretch}</div>
      <button onClick={setMaximumStretch}>Stretch to Grid</button>
    </div>
  );
}

function App() {
  const [stretch, setStretch] = useState(0.0);

  function setMaximumStretch() {
    setStretch(MAX_STRETCH);
  }

  return (
    <div className="App">
      <StretchComponent
        stretch={stretch}
        setStretch={setStretch}
        setMaximumStretch={setMaximumStretch}
      />
      <GridComponent
        layoutName="layout"
        setMaximumStretch={setMaximumStretch}
      />
    </div>
  );
}

export default App;
