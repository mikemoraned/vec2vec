import React, { useReducer, useContext, createContext } from "react";

export const MIN_STRETCH = 0.0;
export const MAX_STRETCH = 1.0;
export const STRETCH_STEP = 0.01;

const initialState = {
  stretch: MIN_STRETCH
};

function reducer(state, action) {
  switch (action.type) {
    case "setStretch":
      return { stretch: action.stretch };
    case "setMaximumStretch":
      return { stretch: MAX_STRETCH };
    default:
      throw new Error();
  }
}

export const ControlStateContext = createContext();

export const ControlStateProvider = ({ children }) => (
  <ControlStateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </ControlStateContext.Provider>
);

export function setStretchAction(stretch) {
  return { type: "setStretch", stretch };
}

export function setMaximumStretchAction() {
  return { type: "setMaximumStretch" };
}

export function useControlState() {
  return useContext(ControlStateContext);
}

export function toNameValuePairs(properties) {
  return Object.keys(properties).map(k => {
    return {
      name: k,
      value: properties[k]
    };
  });
}
