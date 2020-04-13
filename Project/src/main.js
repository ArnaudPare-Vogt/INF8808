/**
 * The currently selected datum. Will contain a vehicle
 * global position message.
 */
let currently_selected_datum = new rxjs.BehaviorSubject(undefined);





/**
 * Update the status of a hover circle over a graph
 * @param {*} g the g element of the graph
 * @param {*} points The quadtree of points to search in
 */
function update_hover_circle(g, points) {
  let coords = d3.clientPoint(g.node(), d3.event);
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
}





/**
 * Removes the hover circle over a graph
 * @param {*} g the g element of the graph
 */
function remove_hover_circle(g) {
  g.selectAll("circle.hover")
    .remove();
}





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
      let coords = d3.clientPoint(g.node(), d3.event);
      let closest_datum = points.find(coords[0], coords[1]);

      currently_selected_datum.next(closest_datum);
    })
    .on("mousemove", () => update_hover_circle(g, points))
    .on("mouseleave", () => remove_hover_circle(g));

  currently_selected_datum.subscribe({
    next: (datum) => {
      if (!datum) return;
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

  let origin = [
    (svg_size.width - padding.left - padding.right) / 2,
    (svg_size.height - padding.top - padding.bottom ) / 2];

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
  let axis_projection = d3._3d()
    .origin(origin)
    .shape("LINE_STRIP")
    .scale(Math.min(svg_size.width, svg_size.height) / 2);

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
    .on("mousemove", () => update_hover_circle(g, points))
    .on("mouseleave", () => remove_hover_circle(g))
    .on("click", () => {
      let coords = d3.clientPoint(g.node(), d3.event);
      let closest_datum = points.find(coords[0], coords[1]);
      currently_selected_datum.next(closest_datum);
    });

  function update_selection_circle(datum) {
    if (!datum) return;
    g.selectAll("circle.click")
      .data(flight_path([[datum]])[0])
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
      .attr("cx", points.x())
      .attr("cy", points.y());
  }
  function update_3d() {
    flight_path.rotateX(phi);
    flight_path.rotateY(theta);
    axis_projection.rotateX(phi);
    axis_projection.rotateY(theta);

    let axis_data = [
      [[-1.0, 0.0, 0.0], [1.0, 0.0, 0.0]],// x
      [[0.0, 0.0, -1.0], [0.0, 0.0, 1.0]],// y
      [[0.0, -1.0, 0.0], [0.0, 1.0, 0.0]] // z
    ];
    let axis_color = ["red", "green", "blue"];
    let projected_axis_data = axis_projection(axis_data);
    g.selectAll("path.axis")
      .data(projected_axis_data)
      .join(
        enter => enter.append("path")
          .classed("axis", true)
          .attr("fill", "none")
          .attr("stroke", (d, i) => axis_color[i]),
        update => update,
        exit => exit.remove()
      ).attr("d", axis_projection.draw);
    
    let data_3d = flight_path([data]);
    points = d3.quadtree()
      .x(d => d.projected.x)
      .y(d => d.projected.y);
    points.addAll(data_3d[0]);

    path.datum(data_3d[0])
      .attr("d", flight_path.draw);
    hover_path.datum(data_3d[0])
      .attr("d", flight_path.draw);
    
    // If we have a selection circle, we need to uptate its position
    update_selection_circle(currently_selected_datum.getValue());
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

  currently_selected_datum.subscribe({
    next: update_selection_circle
  });
}





function setup_selected_point_info(selected_datum_subject) {
  selected_datum_subject.subscribe({
    next: (d) => {
      if (!d) {
        d = {
          lon: "?",
          lat: "?",
          alt: "?"
        };
      }
      d3.selectAll(".pos_x").text(d.lon);
      d3.selectAll(".pos_y").text(d.lat);
      d3.selectAll(".pos_z").text(d.alt);
    }
  })
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
setup_selected_point_info(currently_selected_datum);