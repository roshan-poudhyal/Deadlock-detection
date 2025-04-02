document.addEventListener("DOMContentLoaded", () => {
  fetchGraphData()
})

// Function to fetch graph data from the server
function fetchGraphData() {
  fetch("/get_graph")
    .then((response) => response.json())
    .then((data) => {
      updateGraph(data.nodes, data.links, data.deadlock, data.cycle)
      updateDeadlockStatus(data.deadlock, data.cycle)
    })
    .catch((error) => console.error("Error fetching graph data:", error))
}

// Function to update the deadlock status message
function updateDeadlockStatus(deadlock, cycle) {
  const statusDiv = document.getElementById("deadlock-status")
  if (deadlock) {
    statusDiv.innerHTML = `<span style="color: red; font-weight: bold;">Deadlock Detected! 🔴</span> <br> Cycle: ${cycle.map((edge) => `${edge[0]} → ${edge[1]}`).join(" → ")}`
  } else {
    statusDiv.innerHTML = `<span style="color: green; font-weight: bold;">No Deadlock Detected ✅</span>`
  }
}

// Function to render the process-resource graph with dark mode, 3D effects, and tooltips
function updateGraph(nodes, links, deadlock, cycle) {
  d3.select("#graph-container").selectAll("*").remove()

  const width = 800,
    height = 500

  const svg = d3
    .select("#graph-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#1e1e1e") // Dark background
    .style("border-radius", "10px")

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(120),
    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2))

  // Draw links
  const link = svg
    .selectAll(".link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", (d) =>
      deadlock && cycle.some((edge) => edge[0] === d.source.id && edge[1] === d.target.id) ? "red" : "#aaa",
    )
    .style("stroke-width", 3)
    .style("filter", (d) =>
      deadlock && cycle.some((edge) => edge[0] === d.source.id && edge[1] === d.target.id)
        ? "drop-shadow(0px 0px 5px red)"
        : "none",
    ) // Glowing effect for deadlock

  // Draw nodes
  const node = svg
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .call(d3.drag().on("start", dragStart).on("drag", dragged).on("end", dragEnd))

  node
    .append("circle")
    .attr("r", 20)
    .attr("fill", (d) => (d.id.startsWith("P") ? "#007bff" : "#ffa500"))
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .style("filter", "drop-shadow(3px 3px 5px rgba(255,255,255,0.2))") // 3D effect

  node
    .append("title") // Tooltip for node details
    .text((d) => `ID: ${d.id}`)

  node
    .append("text")
    .attr("dy", 5)
    .attr("text-anchor", "middle")
    .style("fill", "#fff")
    .text((d) => d.id)

  simulation.nodes(nodes).on("tick", ticked)
  simulation.force("link").links(links)

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)

    node.attr("transform", (d) => `translate(${d.x},${d.y})`)
  }

  function dragStart(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(event, d) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragEnd(event, d) {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }
}

