import React, { useState } from "react";
import "./App.css";

function StretchComponent({ stretch, setStretch, setMaximumStretch }) {
  return (
    <div className="StretchComponent">
      <span>{stretch}</span>
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
        setMaximumStretch={setMaximumStretch}
      />
    </div>
  );
}

export default App;
