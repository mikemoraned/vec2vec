import React, { useState, useRef, useEffect } from "react";
import { json } from "d3-fetch";
import { select } from "d3-selection";
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

function GridComponent({ layoutName, setMaximumStretch }) {
  const svgRef = useRef(null);
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await json(`${layoutName}.json`);
      setLayout(data);
    }
    fetchData();
  }, [layoutName]);

  useEffect(() => {
    if (svgRef.current && layout != null) {
      const svg = select(svgRef.current);
      console.dir(svg);
      console.dir(layout);
    }
  }, [layout]);

  return (
    <div className="GridComponent">
      <svg
        ref={svgRef}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
        onClick={setMaximumStretch}
      />
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
