import React from "react";
import GridComponent from "./GridComponent.js";
import "./App.scss";
import { ControlStateProvider } from "./ControlState.js";
import StretchControl from "./StretchControl.js";

function App() {
  const layouts = [
    "size10x10.paths1000000.seed1.dist2,3.dim100.sample25",
    "size10x10.paths1000000.seed1.dist2,3.dim100.sample50",
    "size10x10.paths1000000.seed1.dist2,3.dim100.sample100"
  ];

  return (
    <div className="App columns">
      <ControlStateProvider>
        <div className="column is-2">
          <StretchControl />
        </div>
        {layouts.map(layout => {
          return (
            <div className="column" key={layout}>
              <GridComponent layoutName={layout} />
            </div>
          );
        })}
      </ControlStateProvider>
    </div>
  );
}

export default App;
