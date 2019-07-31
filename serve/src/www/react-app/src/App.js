import React from "react";
import GridComponent from "./GridComponent.js";
import "./App.scss";
import { ControlStateProvider } from "./ControlState.js";
import StretchControl from "./StretchControl.js";

function App() {
  return (
    <div className="App columns">
      <ControlStateProvider>
        <div class="column is-2">
          <StretchControl />
        </div>
        <div class="column">
          <GridComponent layoutName="layout" />
        </div>
      </ControlStateProvider>
    </div>
  );
}

export default App;
