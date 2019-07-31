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
    <tr>
      <td>stretch</td>
      <td>{stretch}</td>
      <td>
        <input
          type="range"
          value={stretch}
          min={MIN_STRETCH}
          max={MAX_STRETCH}
          step={STRETCH_STEP}
          onChange={event => dispatch(setStretchAction(event.target.value))}
        />
      </td>
      <td>
        <button
          className="button is-small"
          onClick={() => dispatch(setMaximumStretchAction())}
        >
          max
        </button>
      </td>
    </tr>
  );
}

function StaticProperty({ property }) {
  return (
    <tr key={property.name}>
      <td>{property.name}</td>
      <td>{property.value}</td>
      <td />
      <td />
    </tr>
  );
}

function Controls({ staticProperties }) {
  const controls = [<StretchControl />].concat(
    staticProperties.map(p => <StaticProperty property={p} />)
  );

  return (
    <table className="table is-size-7">
      <thead>
        <tr>
          <th>name</th>
          <th>value</th>
          <th colspan="2">control</th>
        </tr>
      </thead>
      <tbody>{controls}</tbody>
    </table>
  );
}

export default Controls;
