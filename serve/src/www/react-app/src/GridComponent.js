import React, { useState, useRef, useEffect } from "react";
import { json } from "d3-fetch";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { rgb } from "d3-color";
import {
  forceX,
  forceY,
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter
} from "d3-force";
import { useControlState, setMaximumStretchAction } from "./ControlState.js";

const grid_width = 10;
const side_length = 500;
const width = side_length;
const height = side_length;
const between_point_distance = side_length / grid_width;

function xStrength(stretch) {
  return forceX()
    .x(node => {
      return (node.point.x / grid_width) * width;
    })
    .strength(stretch);
}

function yStrength(stretch) {
  return forceY()
    .y(node => {
      return (node.point.y / grid_width) * height;
    })
    .strength(stretch);
}

const xScale = scaleLinear()
  .domain([0, grid_width])
  .range([0, 255]);
const yScale = scaleLinear()
  .domain([0, grid_width])
  .range([0, 255]);

const gridDistance = (from_x, from_y, to_x, to_y) => {
  return Math.sqrt(
    Math.pow(Math.abs(from_x - to_x), 2.0) +
      Math.pow(Math.abs(from_y - to_y), 2.0)
  );
};
const linkOpacityScale = scaleLinear()
  .domain([0, gridDistance(0, 0, grid_width, grid_width)])
  .range([0.9, 0.01]);

const color = d => {
  return rgb(0, xScale(d.point.x), yScale(d.point.y));
};

async function fetchData(name, setLayout) {
  console.time(`${name}_load`);

  const data = await json(`${name}.layout.json`);
  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));

  setLayout({
    nodes,
    links
  });

  console.timeEnd(`${name}_load`);
}

function createSimulation(
  name,
  layout,
  stretch,
  simulation,
  setSimulation,
  setSimulationRunning
) {
  console.time(`${name}_createSim`);
  if (layout != null && simulation == null) {
    const s = forceSimulation(layout.nodes)
      .force(
        "link",
        forceLink(layout.links)
          .id(d => d.id)
          .distance(link => {
            return between_point_distance * (1.0 - link.similarity);
          })
      )
      .force("charge", forceManyBody())
      .force("x", xStrength(stretch))
      .force("y", yStrength(stretch))
      .force("center", forceCenter(width / 2, height / 2));

    setSimulation(s);

    s.on("tick", () => {
      setSimulationRunning(true);
    });
  }
  console.timeEnd(`${name}_createSim`);
}

function updateSimulation(name, stretch, simulation, simulationRunning) {
  console.time(`${name}_updateSim`);
  if (simulationRunning) {
    simulation.force("x", xStrength(stretch)).force("y", yStrength(stretch));
    simulation.alpha(1).restart();
  }
  console.timeEnd(`${name}_updateSim`);
}

function GridComponent({ name, properties }) {
  const [{ stretch }, dispatch] = useControlState();

  const [layout, setLayout] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [simulationRunning, setSimulationRunning] = useState(false);

  useEffect(() => {
    fetchData(name, setLayout);
  }, [name]);

  useEffect(() => {
    createSimulation(
      name,
      layout,
      stretch,
      simulation,
      setSimulation,
      setSimulationRunning
    );
  }, [simulation, stretch, layout, name]);

  useEffect(() => {
    updateSimulation(name, stretch, simulation, simulationRunning);
  }, [name, stretch, simulation, simulationRunning]);

  return (
    <div className="GridComponent card">
      <div className="card-image">
        <CanvasDisplay
          name={name}
          layout={layout}
          simulation={simulation}
          simulationRunning={simulationRunning}
        />
      </div>
      <div className="card-content">
        <table className="table">
          <tbody>
            {properties.map(p => {
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
    </div>
  );
}

function svgRenderSimulation(
  name,
  layout,
  simulation,
  simulationRunning,
  svgRef
) {
  console.time(`${name}_svg_renderSim`);
  if (svgRef.current && simulation != null && simulationRunning) {
    const svg = select(svgRef.current);
    console.dir(svg);
    console.dir(simulation);
    console.dir(simulationRunning);

    const link = svg
      .append("g")
      .attr("stroke", "black")
      .attr("stroke-width", "0.5")
      .attr("fill", "none")
      .attr("marker-mid", "url(#markerArrow)")
      .selectAll("path")
      .data(layout.links)
      .join("path")
      .attr("stroke-opacity", d => {
        const distance = gridDistance(
          d.source.point.x,
          d.source.point.y,
          d.target.point.x,
          d.target.point.y
        );
        return linkOpacityScale(distance);
      });

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .selectAll("circle")
      .data(layout.nodes)
      .join("circle")
      .attr("r", 7)
      .attr("fill", color);

    node.append("title").text(d => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      link.attr("d", d => {
        const dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
        return (
          "M" +
          d.source.x +
          "," +
          d.source.y +
          "A" +
          dr +
          "," +
          dr +
          " 0 0,1 " +
          d.target.x +
          "," +
          d.target.y
        );
      });

      node.attr("cx", d => d.x).attr("cy", d => d.y);
    });
  }
  console.time(`${name}_svg_renderSim`);
}

function SVGDisplay({ name, layout, simulation, simulationRunning }) {
  const [state, dispatch] = useControlState();

  const svgRef = useRef(null);

  useEffect(() => {
    svgRenderSimulation(name, layout, simulation, simulationRunning, svgRef);
  }, [simulation, simulationRunning, layout, name]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${side_length} ${side_length}`}
      preserveAspectRatio="xMidYMid meet"
      onClick={() => dispatch(setMaximumStretchAction())}
    >
      <defs>
        <marker
          id="markerArrow"
          markerWidth="13"
          markerHeight="13"
          refX="2"
          refY="6"
          orient="auto"
        >
          <path d="M2,2 L2,11 L10,6 L2,2" style={{ fill: "#999" }} />
        </marker>
      </defs>
    </svg>
  );
}

function canvasRenderSimulation(
  name,
  layout,
  simulation,
  simulationRunning,
  canvasRef
) {
  console.time(`${name}_canvas_renderSim`);
  if (canvasRef.current && simulation != null && simulationRunning) {
    const context = canvasRef.current.getContext("2d");

    simulation.on("tick", () => {
      context.beginPath();
      context.rect(0, 0, side_length, side_length);
      context.fillStyle = "white";
      context.fill();
      context.closePath();

      context.lineWidth = 0.5;
      layout.links.forEach(d => {
        context.beginPath();

        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);

        const distance = gridDistance(
          d.source.point.x,
          d.source.point.y,
          d.target.point.x,
          d.target.point.y
        );

        const alpha = 1.0 - linkOpacityScale(distance);
        context.strokeStyle = `rgba(0, 0, 0, ${alpha})`;

        context.stroke();
      });

      context.lineWidth = 1.0;
      context.strokeStyle = "#fff";
      const radius = 7;
      layout.nodes.forEach(d => {
        context.beginPath();
        context.arc(d.x, d.y, radius, 0, 2 * Math.PI);

        context.fillStyle = color(d);
        context.fill();
      });
    });
  }
  console.timeEnd(`${name}_canvas_renderSim`);
}

function CanvasDisplay({ name, layout, simulation, simulationRunning }) {
  const [state, dispatch] = useControlState();

  const canvasRef = useRef(null);

  useEffect(() => {
    canvasRenderSimulation(
      name,
      layout,
      simulation,
      simulationRunning,
      canvasRef
    );
  }, [simulation, simulationRunning, layout, name]);

  return (
    <canvas
      ref={canvasRef}
      onClick={() => dispatch(setMaximumStretchAction())}
      width={side_length}
      height={side_length}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export default GridComponent;
