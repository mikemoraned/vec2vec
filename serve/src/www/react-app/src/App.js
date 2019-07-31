import React from "react";
import GridComponent from "./GridComponent.js";
import "./App.css";
import { ControlStateProvider } from "./ControlState.js";
import StretchControl from "./StretchControl.js";

function App() {
  return (
    <div className="App">
      <ControlStateProvider>
        <StretchControl />
        <GridComponent layoutName="layout" />
      </ControlStateProvider>
    </div>
  );
}

export default App;
