import React, { useState } from "react";
import "./App.css";

function StretchComponent({ stretch, setStretch, setMaximumStretch }) {
  return (
    <div className="StretchComponent">
      <input
        type="range"
        value={stretch}
        min={0.0}
        max={1.0}
        step={0.01}
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
    setStretch(1.0);
  }

  return (
    <div className="App">
      <StretchComponent
        stretch={stretch}
        setStretch={setStretch}
        setMaximumStretch={setMaximumStretch}
      />
    </div>
  );
}

export default App;
