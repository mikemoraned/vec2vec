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

const grid_width = 10;
const side_length = 1000;
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

function GridComponent({ layoutName, stretch, setMaximumStretch }) {
  const [layout, setLayout] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [simulationRunning, setSimulationRunning] = useState(false);

  const svgRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      const data = await json(`${layoutName}.json`);
      const links = data.links.map(d => Object.create(d));
      const nodes = data.nodes.map(d => Object.create(d));

      setLayout({
        nodes,
        links
      });
    }
    fetchData();
  }, [layoutName]);

  useEffect(() => {
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
  }, [simulation, stretch, layout]);

  useEffect(() => {
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
  }, [simulation, simulationRunning, layout]);

  useEffect(() => {
    if (simulationRunning) {
      simulation.force("x", xStrength(stretch)).force("y", yStrength(stretch));
      simulation.alpha(1).restart();
    }
  }, [stretch, simulation, simulationRunning]);

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
