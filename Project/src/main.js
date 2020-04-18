/**
 * The currently selected datum. Will contain a vehicle
 * global position message.
 */
let currently_selected_datum = new rxjs.BehaviorSubject(undefined);




// Define the tooltip_div for the tooltip
var tooltip_div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

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
      function (enter) {
        var result = enter.append("circle")
        .classed("hover", true)
        .classed("ignore-mouse-events", true)
        .attr("fill", "grey")
        .attr("stroke", "grey")
        .attr("r", 4);

        update_hover_tooltip(g, closest_datum);
        
        return result;
      },
      update => update,
      exit => exit.remove()
    )
    .attr("cx", points.x())
    .attr("cy", points.y());
}

function update_hover_tooltip(g, datapoint) {
  //TODO: Actually make Y the altitude
  //TODO: Calc the correct XYZ depending on the start point (which is the origin of the viz)

  // Round the numbers to 2 decimals
  let x = Math.round((datapoint.lon + Number.EPSILON) * 100) / 100;
  let y = Math.round((datapoint.lat + Number.EPSILON) * 100) / 100;
  let z = Math.round((datapoint.alt + Number.EPSILON) * 100) / 100;

  tooltip_div.style("opacity", .9);
  tooltip_div.html(`<table>
  <tr><td>Pos:</td><td>(${x}, ${y}, ${z})</td></tr>
  <tr><td>Acc:</td><td>(xx.xx, yy.yy, zz.zz)</td></tr>
  <tr><td>Rot:</td><td>(xx.xx, yy.yy, zz.zz)</td></tr>
  </table>`)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");
} 

function remove_hover_tooltip(g) {
  tooltip_div.style("opacity", 0);
}

/**
 * Removes the hover circle over a graph
 * @param {*} g the g element of the graph
 */
function remove_hover_circle(g) {
  g.selectAll("circle.hover")
    .remove();
  remove_hover_tooltip(g)
}

/** Definition of Arrowhead (used in the axis) */
function defineMarker(svg) {
  let defs = svg.append("defs");
  defs.append("marker")
    .attr("id", "arrowhead_h")
    .attr("refX", 2)
    .attr("refY", 12)
    .attr("markerWidth", 26)
    .attr("markerHeight", 18)
    .attr("orient", "0")
    .append("path")
    .attr("d", "M2,2 L2,13 L8,7 L2,2");

  defs.append("marker")
    .attr("id", "arrowhead_v")
    .attr("refX", 3)
    .attr("refY", 2)
    .attr("markerWidth", 26)
    .attr("markerHeight", 18)
    .attr("orient", "-90")
    .append("path")
    .attr("d", "M2,2 L2,13 L8,7 L2,2");
}

async function generate_2d_plot(data_promise, plot_info) {
  //TODO: Add resize when the window changes
  //TODO: Add axis color
  let svg = d3.select("#" + plot_info.id)
    // .style("background-color", plot_info.color) // TODO: Maybe uncomment?
    .style("background-color", "#f7f7f7")
    .style("border", "black solid");

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

  defineMarker(svg);

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

  var xa = svg.append("g")
    .classed("axis", true)
    .classed("x", true)
    .attr("transform", "translate(" + padding.left + "," + (svg_size.height - padding.bottom) + ")")
    .attr("class", plot_info.x_axis_class)
    .call(axis_x);
  
  xa.select("path").attr("marker-end", "url(#arrowhead_h)");

  let ya = svg.append("g")
    .classed("axis", true)
    .classed("y", true)
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    .attr("class", plot_info.y_axis_class)
    .call(axis_y);
  
  ya.select("path").attr("marker-end", "url(#arrowhead_v)");

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
            .attr("r", 4),
          update => update,
          exit => exit.remove()
        )
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    }
  })
}





async function generate_3d_plot(data_promise) {
  //TODO: Add resize when the window changes
  //TODO: Add zoom?
  let svg = d3.select("#path-view-3d")
    .style("background-color", "#f7f7f7")
    .style("border", "black solid");

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

  let accessors = [
    row => row.lon,
    row => row.lat,
    row => row.alt,
  ];
  let extents = [
    d3.extent(data.map(row => row.enu.e)),
    d3.extent(data.map(row => row.enu.n)),
    d3.extent(data.map(row => row.enu.u))
  ];
  let widths = range(3)
    .map(i => extents[i][1] - extents[i][0]);
  let max_width = d3.max(widths);

  let scales = range(3).map(i => 
    d3.scaleLinear()
      .domain(d3.extent(data.map(accessors[i])))
      .range([-widths[i]/max_width, widths[i]/max_width])
  );
  // We invert the altitude scale because svgs have 0 as top
  scales[2].range([scales[2].range()[1], scales[2].range()[0]]);

  let flight_path = d3._3d()
    .origin(origin)
    .shape("LINE_STRIP")
    .scale(Math.min(svg_size.width, svg_size.height) / 2)
    .x(d => scales[0](d.lon))
    .y(d => scales[2](d.alt))
    .z(d => scales[1](d.lat));
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
          .attr("r", 4),
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




async function generate_path_line_chart(example_flight_file) {
  let acceleration_data_promise = example_flight_file.retreive_message("sensor_accel_0");

  let svg = d3.select("#path-line-chart");
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

  let g = svg.append("g")
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")");
  
  let acceleration_data = await acceleration_data_promise;


  let scale_x = d3.scaleTime()
    .domain(d3.extent(acceleration_data, row => row.timestamp))
    .range([0, svg_size.width - padding.left - padding.right]);
  let scale_y = d3.scaleLinear()
    .domain(d3.extent(acceleration_data, row => row.mag))
    .range([svg_size.height - padding.top - padding.bottom, 0]);
  
  let axis_x = d3.axisBottom(scale_x);
  let axis_y = d3.axisLeft(scale_y);

  g.append("g")
    .classed("axis", true)
    .classed("x", true)
    .attr("transform", "translate(0," + (svg_size.height - padding.bottom - padding.top) + ")")
    .call(axis_x);
  
  g.append("g")
    .classed("axis", true)
    .classed("y", true)
    .attr("transform", "translate(0,0)")
    .call(axis_y);

  let accel_line = d3.line()
    .x(row => scale_x(row.timestamp))
    .y(row => scale_y(row.mag));

  g.append("path")
    .datum(acceleration_data)
    .attr("d", accel_line)
    .attr("stroke", "black")
    .classed("graph-line", true);

  currently_selected_datum.subscribe({
    next: (selected_datum) => {
      if (!selected_datum) return;
      let acceleration_datum = acceleration_data[
        acceleration_data.min_index((d) => Math.abs(d.timestamp - selected_datum.timestamp))
      ];
      g.selectAll("line.graph-selection-line")
        .data([acceleration_datum])
        .join(
          enter => enter.append("line")
            .classed("graph-selection-line", true)
            .attr("fill", "none")
            .attr("stroke", "black"),
          update => update,
          exit => exit.remove()
        )
        .attr("x1", d => scale_x(d.timestamp))
        .attr("x2", d => scale_x(d.timestamp))
        .attr("y1", d => scale_y.range()[0])
        .attr("y2", d => scale_y.range()[1]);
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
  y: "lat",
  x_axis_class: "axisBlue",
  y_axis_class: "axisRed"
});
generate_2d_plot(vehicle_global_position_promise, {
  id: "path-view-front",
  color: "rgb(214, 139, 214)",
  x: "lon",
  y: "alt",
  x_axis_class: "axisRed",
  y_axis_class: "axisGreen"
});
generate_2d_plot(vehicle_global_position_promise, {
  id: "path-view-left",
  color: "pink",
  x: "lat",
  y: "alt",
  x_axis_class: "axisBlue",
  y_axis_class: "axisGreen"
});
generate_3d_plot(vehicle_global_position_promise);
setup_selected_point_info(currently_selected_datum);
generate_path_line_chart(example_flight_file);