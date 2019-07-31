import React from "react";
import GridComponent from "./GridComponent.js";
import "./App.scss";
import { ControlStateProvider } from "./ControlState.js";
import StretchControl from "./StretchControl.js";

function layoutProperties(layoutName) {
  const parts = layoutName.split(".");
  return parts.map(part => {
    const match = /^([a-z]+)(.+)$/.exec(part);
    return {
      name: match[1],
      value: match[2]
    };
  });
}

function App() {
  const layoutNames = [
    "size10x10.paths1000000.seed1.dist2,3.dim100.sample25",
    "size10x10.paths1000000.seed1.dist2,3.dim100.sample50",
    "size10x10.paths1000000.seed1.dist2,3.dim100.sample100"
  ];

  const layouts = layoutNames.map(name => {
    return {
      name,
      properties: layoutProperties(name)
    };
  });

  return (
    <div className="App columns">
      <ControlStateProvider>
        <div className="column is-2">
          <StretchControl />
        </div>
        {layouts.map(layout => {
          return (
            <div className="column" key={layout.name}>
              <GridComponent
                name={layout.name}
                properties={layout.properties}
              />
            </div>
          );
        })}
      </ControlStateProvider>
    </div>
  );
}

export default App;
