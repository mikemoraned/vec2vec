import React from "react";
import {
  useControlState,
  setStretchAction,
  setMaximumStretchAction,
  MAX_STRETCH,
  MIN_STRETCH,
  STRETCH_STEP
} from "./ControlState.js";

function StretchControl() {
  const [{ stretch }, dispatch] = useControlState();

  return (
    <div className="StretchControl">
      <div>{stretch}</div>
      <input
        type="range"
        value={stretch}
        min={MIN_STRETCH}
        max={MAX_STRETCH}
        step={STRETCH_STEP}
        onChange={event => dispatch(setStretchAction(event.target.value))}
      />
      <button
        className="button"
        onClick={() => dispatch(setMaximumStretchAction())}
      >
        Stretch to Grid
      </button>
    </div>
  );
}

export default StretchControl;
