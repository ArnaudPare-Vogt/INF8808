d3.select(".todo")
  .style("color", "red");

let example_flight_file = new ULogFile("example_flight");

example_flight_file.retreive_message("vehicle_global_position_0")
  .then(console.log);

example_flight_file.retreive_message("actuator_outputs_0")
  .then(console.log);

async function generate_top_plot(file) {
  let data_promise = file.retreive_message("vehicle_global_position_0");

  let svg = d3.select("#path-view-top")
    .style("background-color", "lightgreen");

  let svg_size = {
    width: svg.node().clientWidth,
    height: svg.node().clientHeight
  };

  let padding = {
    left: 50,
    right: 10,
    top: 10,
    bottom: 20,
  }

  let data = await data_promise;

  let scale_lon = d3.scaleLinear()
    .domain(d3.extent(data.map(row => row.lon)))
    .range([0, svg_size.width - padding.left - padding.right]);
  let scale_lat = d3.scaleLinear()
    .domain(d3.extent(data.map(row => row.lat)))
    .range([0, svg_size.height - padding.top - padding.bottom]);
  
  let axis_lon = d3.axisBottom(scale_lon);
  let axis_lat = d3.axisLeft(scale_lat);
  let flight_path = d3.line()
    .x(d => scale_lon(d.lon))
    .y(d => scale_lat(d.lat));

  svg.append("g")
    .classed("axis", true)
    .classed("x", true)
    .attr("transform", "translate(" + padding.left + "," + (svg_size.height - padding.bottom) + ")")
    .call(axis_lon);

  svg.append("g")
    .classed("axis", true)
    .classed("y", true)
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    .call(axis_lat);

  svg.append("g")
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    .append("path")
    .datum(data)
    .attr("d", flight_path)
    .attr("fill", "none")
    .attr("stroke", "black");
}

generate_top_plot(example_flight_file);

