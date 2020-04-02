
async function generate_top_plot(data_promise) {
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

  let path = svg.append("g")
    .classed("path-transform", true)
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    .append("path")
    .classed("flight-path", true)
    .datum(data)
    .attr("d", flight_path)
    .attr("fill", "none")
    .attr("stroke", "black");
  let path_selector = new SvgPathSelector();
  path_selector.set_path(path.node());
  path.on("click", async () => {
      let coords = d3.clientPoint(svg.node(), d3.event);

      coords[0] -= padding.left;
      coords[1] -= padding.top;
      let closest_length = path_selector.get_lenght_from_point(coords);

      console.log(closest_length);
      svg.select("g.path-transform")
        .selectAll("circle.click")
        .data([path.node().getPointAtLength(closest_length)])
        .join(
          enter => enter.append("circle")
            .classed("click", true)
            .attr("fill", "yellow")
            .attr("stroke", "black")
            .classed("ignore-mouse-events", true)
            .attr("r", 2),
          update => update,
          exit => exit.remove()
        )
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    })
    .on("mouseover", async () => {
      let coords = d3.clientPoint(svg.node(), d3.event);

      coords[0] -= padding.left;
      coords[1] -= padding.top;
      let closest_length = path_selector.get_lenght_from_point(coords);

      console.log(closest_length);
      svg.select("g.path-transform")
        .selectAll("circle.hover")
        .data([path.node().getPointAtLength(closest_length)])
        .join(
          enter => enter.append("circle")
            .classed("hover", true)
            .classed("ignore-mouse-events", true)
            .attr("fill", "grey")
            .attr("stroke", "grey")
            .attr("r", 2),
          update => update,
          exit => exit.remove()
        )
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });
}





async function generate_front_plot(data_promise) {
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





async function generate_left_plot(data_promise) {
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





async function generate_3d_plot(data_promise) {
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
  console.log(origin);

  let data = await data_promise;

  let scale_lon = d3.scaleLinear()
    .domain(d3.extent(data.map(row => row.lon)))
    .range([-1, 1]);
    let scale_alt = d3.scaleLinear()
      .domain(d3.extent(data.map(row => row.alt)))
      .range([1, -1]);
  let scale_lat = d3.scaleLinear()
    .domain(d3.extent(data.map(row => row.lat)))
    .range([-1, 1]);
  
  let flight_path = d3._3d()
    .origin(origin)
    .shape("LINE_STRIP")
    .scale(Math.min(svg_size.width, svg_size.height) / 2)
    .x(d => scale_lon(d.lon))
    .y(d => scale_alt(d.alt))
    .z(d => scale_lat(d.lat));

  let theta = 0;
  let phi = 0;
  let path = svg.append("g")
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    .append("path");
  function update_3d() {
    flight_path.rotateX(phi);
    flight_path.rotateY(theta);
    
    let data_3d = flight_path([data]);

    path.datum(data_3d[0])
      .attr("d", flight_path.draw)
      .attr("fill", "none")
      .attr("stroke", "black");
  }
  update_3d();

  let drag = d3.drag()
    .on("drag", () => {
      theta -= d3.event.dx / svg_size.width * Math.PI * 2;
      phi += d3.event.dy / svg_size.height * Math.PI;
      phi = Math.min(Math.max(phi, -Math.PI/2), Math.PI/2);
      update_3d();
    });
  svg.call(drag);
}





d3.select(".todo")
  .style("color", "red");

let example_flight_file = new ULogFile("example_flight");

let vehicle_global_position_promise = example_flight_file.retreive_message("vehicle_global_position_0");
// TODO: keep aspect ratio on graphs
generate_top_plot(vehicle_global_position_promise);
generate_front_plot(vehicle_global_position_promise);
generate_left_plot(vehicle_global_position_promise);
generate_3d_plot(vehicle_global_position_promise);
