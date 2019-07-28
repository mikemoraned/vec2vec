<script>
  import GridStretch from "./GridStretch.svelte";
  import { stretch } from "./stores.js";

  import { json } from "d3-fetch";
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
  import { select } from "d3-selection";
  import { onMount } from "svelte";

  let simulation = forceSimulation([]);

  const grid_width = 10;
  const side_length = 1000;
  const width = side_length;
  const height = side_length;
  const between_point_distance = side_length / grid_width;

  const xStrength = stretch => {
    return forceX()
      .x(node => {
        return (node.point.x / grid_width) * width;
      })
      .strength(stretch);
  };

  const yStrength = stretch => {
    return forceY()
      .y(node => {
        return (node.point.y / grid_width) * height;
      })
      .strength(stretch);
  };

  const xScale = scaleLinear()
    .domain([0, grid_width])
    .range([0, 255]);
  const yScale = scaleLinear()
    .domain([0, grid_width])
    .range([0, 255]);

  const color = d => {
    return rgb(0, xScale(d.point.x), yScale(d.point.y));
  };

  onMount(async () => {
    const data = await json("/layout.json");
    console.log(data);

    const inferred_links = data.links.map(d => {
      const link = Object.create(d);
      link.grid = false;
      return link;
    });
    const inferred_nodes = data.nodes.map(d => {
      const node = Object.create(d);
      node.grid = false;
      return node;
    });

    const links = inferred_links;
    const nodes = inferred_nodes;

    simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink(links)
          .id(d => d.id)
          .distance(link => {
            return between_point_distance * (1.0 - link.similarity);
          })
      )
      .force("charge", forceManyBody())
      .force("x", xStrength($stretch))
      .force("y", yStrength($stretch))
      .force("center", forceCenter(width / 2, height / 2));

    const svg = select("#grid");

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.0);

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes.filter(n => !n.grid))
      .join("circle")
      .attr("r", 5)
      .attr("fill", color);

    node.append("title").text(d => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("cx", d => d.x).attr("cy", d => d.y);
    });
  });

  $: console.log("stretch", $stretch);

  stretch.subscribe(strength => {
    simulation.force("x", xStrength(strength)).force("y", yStrength(strength));
    simulation.alpha(1).restart();
  });

  function stretchToGrid() {
    stretch.update(s => 1.0);
  }
</script>

<style>
  #grid {
    height: 100vh;
    width: 100vh;
  }
</style>

<GridStretch />

<svg
  id="grid"
  viewBox="0 0 1000 1000"
  preserveAspectRatio="xMidYMid meet"
  on:click={stretchToGrid} />
