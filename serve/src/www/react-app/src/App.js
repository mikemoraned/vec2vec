import React from "react";
import GridComponent from "./GridComponent.js";
import "./App.scss";
import { ControlStateProvider } from "./ControlState.js";
import StretchControl from "./StretchControl.js";

function layoutProperties(layoutName) {
  const parts = layoutName.split(".");
  return parts.reduce((p, part) => {
    const match = /^([a-z]+)(.+)$/.exec(part);
    p[match[1]] = match[2];
    return p;
  }, {});
}

function toNameValuePairs(properties) {
  return Object.keys(properties).map(k => {
    return {
      name: k,
      value: properties[k]
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

  const allProperties = layouts.map(l => l.properties);
  const sharedProperties = allProperties.reduce((s, p) => {
    const shared = {};
    Object.keys(p).forEach(k => {
      if (s[k] && s[k] === p[k]) {
        shared[k] = p[k];
      }
    });
    return shared;
  }, allProperties[0]);
  const layoutsWithUniqueProperties = layouts.map(l => {
    const filtered = {};
    Object.keys(l.properties).forEach(k => {
      if (!sharedProperties[k]) {
        filtered[k] = l.properties[k];
      }
    });
    return {
      ...l,
      properties: filtered
    };
  });

  return (
    <div className="App columns">
      <ControlStateProvider>
        <div className="column is-2">
          <StretchControl />
        </div>
        <div className="column">
          <table className="table">
            <tbody>
              {toNameValuePairs(sharedProperties).map(p => {
                return (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>{p.value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {layoutsWithUniqueProperties.map(layout => {
          return (
            <div className="column" key={layout.name}>
              <GridComponent
                name={layout.name}
                properties={toNameValuePairs(layout.properties)}
              />
            </div>
          );
        })}
      </ControlStateProvider>
    </div>
  );
}

export default App;
