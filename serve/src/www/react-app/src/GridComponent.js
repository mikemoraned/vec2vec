import React, { useState, useRef, useEffect } from "react";
import { json } from "d3-fetch";
import { select } from "d3-selection";

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

export default GridComponent;
