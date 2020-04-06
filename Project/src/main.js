/**
 * The currently selected datum. Will contain a vehicle
 * global position message.
 */
let currently_selected_datum = new rxjs.Subject();





async function generate_2d_plot(data_promise, plot_info) {
  let svg = d3.select("#" + plot_info.id)
    .style("background-color", plot_info.color);

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

  let scales = {
    lon: d3.scaleLinear()
      .domain(d3.extent(data.map(row => row.lon))),
    lat: d3.scaleLinear()
      .domain(d3.extent(data.map(row => row.lat))),
    alt: d3.scaleLinear()
      .domain(d3.extent(data.map(row => row.alt)))
  };
  scales[plot_info.x].range([0, svg_size.width - padding.left - padding.right]);
  scales[plot_info.y].range([svg_size.height - padding.top - padding.bottom, 0]);

  let axis_x = d3.axisBottom(scales[plot_info.x]);
  let axis_y = d3.axisLeft(scales[plot_info.y]);
  let flight_path = d3.line()
    .x(d => scales[plot_info.x](d[plot_info.x]))
    .y(d => scales[plot_info.y](d[plot_info.y]));
  
  let points = d3.quadtree()
    .x(flight_path.x())
    .y(flight_path.y());
  points.addAll(data);

  svg.append("g")
    .classed("axis", true)
    .classed("x", true)
    .attr("transform", "translate(" + padding.left + "," + (svg_size.height - padding.bottom) + ")")
    .call(axis_x);

  svg.append("g")
    .classed("axis", true)
    .classed("y", true)
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    .call(axis_y);

  let g = svg.append("g")
    .classed("path-transform", true)
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")");
  g.append("path")
    .classed("flight-path", true)
    .datum(data)
    .attr("d", flight_path)
    .attr("fill", "none")
    .attr("stroke", "black");
  g.append("path")
    .datum(data)
    .attr("d", flight_path)
    .attr("fill", "none")
    .attr("stroke", "none")
    .style("stroke-width", 10)
    .style("pointer-events", "stroke")
    .on("click", () => {
      let coords = d3.clientPoint(svg.node(), d3.event);

      coords[0] -= padding.left;
      coords[1] -= padding.top;
      let closest_datum = points.find(coords[0], coords[1]);

      currently_selected_datum.next(closest_datum);
    })
    .on("mousemove", () => {
      let coords = d3.clientPoint(svg.node(), d3.event);

      coords[0] -= padding.left;
      coords[1] -= padding.top;
      let closest_datum = points.find(coords[0], coords[1]);

      svg.select("g.path-transform")
        .selectAll("circle.hover")
        .data([{x: flight_path.x()(closest_datum), y: flight_path.y()(closest_datum)}])
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
    })
    .on("mouseleave", () => {
      svg.select("g.path-transform")
        .selectAll("circle.hover")
        .remove();
    });

  currently_selected_datum.subscribe({
    next: (datum) => {
      g.selectAll("circle.click")
        .data([{x: flight_path.x()(datum), y: flight_path.y()(datum)}])
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
    }
  })
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

  let points; // Our quadtree
  let g = svg.append("g")
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
  let path = g.append("path")
    .attr("fill", "none")
    .attr("stroke", "black");
  let hover_path = g.append("path")
    .attr("fill", "none")
    .attr("stroke", "none")
    .style("stroke-width", 10)
    .style("pointer-events", "stroke")
    .on("mousemove", () => {
      let coords = d3.clientPoint(svg.node(), d3.event);

      coords[0] -= padding.left;
      coords[1] -= padding.top;
      let closest_datum = points.find(coords[0], coords[1]);

      g.selectAll("circle.hover")
        .data([closest_datum])
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
        .attr("cx", points.x())
        .attr("cy", points.y());
    });

  function update_3d() {
    flight_path.rotateX(phi);
    flight_path.rotateY(theta);
    
    let data_3d = flight_path([data]);
    points = d3.quadtree()
      .x(d => d.projected.x)
      .y(d => d.projected.y);
    points.addAll(data_3d[0]);

    path.datum(data_3d[0])
      .attr("d", flight_path.draw);
    hover_path.datum(data_3d[0])
      .attr("d", flight_path.draw);
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
generate_2d_plot(vehicle_global_position_promise, {
  id: "path-view-top",
  color: "lightgreen",
  x: "lon",
  y: "lat"
});
generate_2d_plot(vehicle_global_position_promise, {
  id: "path-view-front",
  color: "rgb(214, 139, 214)",
  x: "lon",
  y: "alt"
});
generate_2d_plot(vehicle_global_position_promise, {
  id: "path-view-left",
  color: "pink",
  x: "lat",
  y: "alt"
});
generate_3d_plot(vehicle_global_position_promise);
