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
    .range([svg_size.height - padding.top - padding.bottom, 0]);
  
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





async function generate_front_plot(file) {
  let data_promise = file.retreive_message("vehicle_global_position_0");

  let svg = d3.select("#path-view-front")
    .style("background-color", "rgb(214, 139, 214)");

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
  let scale_alt = d3.scaleLinear()
    .domain(d3.extent(data.map(row => row.alt)))
    .range([svg_size.height - padding.top - padding.bottom, 0]);
  
  let axis_lon = d3.axisBottom(scale_lon);
  let axis_alt = d3.axisLeft(scale_alt);
  let flight_path = d3.line()
    .x(d => scale_lon(d.lon))
    .y(d => scale_alt(d.alt));

  svg.append("g")
    .classed("axis", true)
    .classed("x", true)
    .attr("transform", "translate(" + padding.left + "," + (svg_size.height - padding.bottom) + ")")
    .call(axis_lon);

  svg.append("g")
    .classed("axis", true)
    .classed("y", true)
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    .call(axis_alt);

  svg.append("g")
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    .append("path")
    .datum(data)
    .attr("d", flight_path)
    .attr("fill", "none")
    .attr("stroke", "black");
}





async function generate_left_plot(file) {
  let data_promise = file.retreive_message("vehicle_global_position_0");

  let svg = d3.select("#path-view-left")
    .style("background-color", "pink");

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

  let scale_lat = d3.scaleLinear()
    .domain(d3.extent(data.map(row => row.lat)))
    .range([0, svg_size.width - padding.left - padding.right]);
  let scale_alt = d3.scaleLinear()
    .domain(d3.extent(data.map(row => row.alt)))
    .range([svg_size.height - padding.top - padding.bottom, 0]);
  
  let axis_lat = d3.axisBottom(scale_lat);
  let axis_alt = d3.axisLeft(scale_alt);
  let flight_path = d3.line()
    .x(d => scale_lat(d.lat))
    .y(d => scale_alt(d.alt));

  svg.append("g")
    .classed("axis", true)
    .classed("x", true)
    .attr("transform", "translate(" + padding.left + "," + (svg_size.height - padding.bottom) + ")")
    .call(axis_lat);

  svg.append("g")
    .classed("axis", true)
    .classed("y", true)
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    .call(axis_alt);

  svg.append("g")
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    .append("path")
    .datum(data)
    .attr("d", flight_path)
    .attr("fill", "none")
    .attr("stroke", "black");
}





async function generate_3d_plot(file) {
  let data_promise = file.retreive_message("vehicle_global_position_0");

  let svg = d3.select("#path-view-3d")
    .style("background-color", "lightblue");

  let svg_size = {
    width: svg.node().clientWidth,
    height: svg.node().clientHeight
  };

  let padding = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
  }

  // TODO: Take in acount padding
  let origin = [svg_size.width / 2, svg_size.height / 2];

  let data = await data_promise;

  let scale_lon = d3.scaleLinear()
    .domain(d3.extent(data.map(row => row.lon)))
    .range([-1, 1]);
  let scale_lat = d3.scaleLinear()
    .domain(d3.extent(data.map(row => row.lat)))
    .range([-1, 1]);
  let scale_alt = d3.scaleLinear()
    .domain(d3.extent(data.map(row => row.alt)))
    .range([-1, 1]);
  
  let flight_path = d3._3d()
    .origin(origin)
    .shape("LINE_STRIP")
    .x(d => d.lon)
    .y(d => d.lat)
    .z(d => d.alt);

  let data_3d = flight_path([data]);

  svg.append("g")
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    .append("path")
    .datum(data_3d[0])
    .attr("d", flight_path.draw)
    .attr("fill", "none")
    .attr("stroke", "black");
}





generate_top_plot(example_flight_file);
generate_front_plot(example_flight_file);
generate_left_plot(example_flight_file);
generate_3d_plot(example_flight_file);