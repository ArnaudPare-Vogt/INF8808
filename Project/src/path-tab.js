// Define the tooltip_div for the tooltip
var tooltip_div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);
/** format allows formatting numbers correctly */
var format = d3.formatLocale({
  decimal: ".",
  thousands: " ",
  grouping: [3],
  currency: ["", "CAD"],
  nan: "?"
});





/**
 * Update the status of a hover circle over a graph
 * @param {*} g the g element of the graph
 * @param {*} points The quadtree of points to search in
 */
function update_hover_circle(g, points, all_data) {
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

        update_hover_tooltip([d3.event.pageX, d3.event.pageY], closest_datum.timestamp, all_data,
          ["vehicle_global_position_0", "sensor_accel_0", "vehicle_attitude_0"]);
        
        return result;
      },
      update => update,
      exit => exit.remove()
    )
    .attr("cx", points.x())
    .attr("cy", points.y());
}





function update_hover_tooltip(point, timestamp, all_data, displayed_sensors) {
  let datums = displayed_sensors.map((message_name) => {
    // TODO: Optimize this shit
    let data = all_data[message_name];
    let datum = data[
      data.min_index((d) => Math.abs(d.timestamp - timestamp))
    ];
    return datum;
  });

  // Round the numbers to 2 decimals
  let fmt = format.format(" ,.2f");
  
  let position = "";
  if (displayed_sensors.indexOf("vehicle_global_position_0") !== -1) {
    let index = displayed_sensors.indexOf("vehicle_global_position_0");
    let x = datums[index].enu.e;
    let y = datums[index].enu.u;
    let z = datums[index].enu.n;
    position = `<tr><td>Pos:</td><td>(${fmt(x)}, ${fmt(y)}, ${fmt(z)})</td></tr>`;
  }
  
  let acceleration = "";
  if (displayed_sensors.indexOf("sensor_accel_0") !== -1) {
    let index = displayed_sensors.indexOf("sensor_accel_0");
    let x = datums[index].x;
    let y = datums[index].y;
    let z = datums[index].z;
    acceleration = `<tr><td>Acc:</td><td>(${fmt(x)}, ${fmt(y)}, ${fmt(z)})</td></tr>`;
  }
  
  let rotation = "";
  if (displayed_sensors.indexOf("vehicle_attitude_0") !== -1) {
    let index = displayed_sensors.indexOf("vehicle_attitude_0");
    let x = datums[index].q.toEuler()[0];
    let y = datums[index].q.toEuler()[1];
    let z = datums[index].q.toEuler()[2];
    rotation = `<tr><td>Rot:</td><td>(${fmt(x)}, ${fmt(y)}, ${fmt(z)})</td></tr>`;
  }
  
  let magnetometer = "";
  if (displayed_sensors.indexOf("sensor_mag_0") !== -1) {
    let index = displayed_sensors.indexOf("sensor_mag_0");
    let x = datums[index].x;
    let y = datums[index].y;
    let z = datums[index].z;
    magnetometer = `<tr><td>Mag:</td><td>(${fmt(x)}, ${fmt(y)}, ${fmt(z)})</td></tr>`;
  }
  let baro = "";
  if (displayed_sensors.indexOf("sensor_baro_0") !== -1) {
    let index = displayed_sensors.indexOf("sensor_baro_0");
    let x = datums[index].pressure;
    baro = `<tr><td>Bar:</td><td>(${fmt(x)})</td></tr>`;
  }
  tooltip_div.style("opacity", .9);
  tooltip_div.html(`<table>${position}${acceleration}${rotation}${magnetometer}${baro}</table>`)
    .style("left", (point[0]) + "px")
    .style("top", (point[1] - 28) + "px");
} 





function remove_hover_tooltip() {
  tooltip_div.style("opacity", 0);
}





/**
 * Removes the hover circle over a graph
 * @param {*} g the g element of the graph
 */
function remove_hover_circle(g) {
  g.selectAll("circle.hover")
    .remove();
  remove_hover_tooltip();
}





/** Definition of Arrowhead (used in the axis) */
function defineMarker(svg, plot_info, id_x, id_y) {
  let defs = svg.append("defs");
  defs.append("marker")
    .attr("id", id_x)
    .attr("refX", 0)
    .attr("refY", 3)
    .attr("markerWidth", 26)
    .attr("markerHeight", 18)
    .attr("orient", "0")
    .classed(plot_info.x_axis_class, true)
    .classed("axis-cap", true)
    .append("path")
    .attr("d", "M0,0 L0,6 L6,3 L0,0");

  defs.append("marker")
    .attr("id", id_y)
    .attr("refX", 0)
    .attr("refY", 3)
    .attr("markerWidth", 26)
    .attr("markerHeight", 18)
    .attr("orient", "-90")
    .classed(plot_info.y_axis_class, true)
    .classed("axis-cap", true)
    .append("path")
    .attr("d", "M0,0 L0,6 L6,3 L0,0");
}





async function generate_2d_plot(all_data, plot_info, selection) {
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

  let arrowhead_x_id = plot_info.id + "-arrowhead-h";
  let arrowhead_y_id = plot_info.id + "-arrowhead-v";
  defineMarker(svg, plot_info, arrowhead_x_id, arrowhead_y_id);

  let data = all_data.vehicle_global_position_0;

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

  let axis_x = d3.axisBottom(scales[plot_info.x])
    .tickSizeOuter(0);
  let axis_y = d3.axisLeft(scales[plot_info.y])
    .tickSizeOuter(0);
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
    .classed(plot_info.x_axis_class, true)
    .call(axis_x);
  
  xa.select("path").attr("marker-end", "url(#" + arrowhead_x_id + ")");

  let ya = svg.append("g")
    .classed("axis", true)
    .classed("y", true)
    .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    .classed(plot_info.y_axis_class, true)
    .call(axis_y);
  
  ya.select("path").attr("marker-end", "url(#" + arrowhead_y_id + ")");

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

      selection.next_selected_datum(closest_datum.timestamp);
    })
    .on("mousemove", () => update_hover_circle(g, points, all_data))
    .on("mouseleave", () => remove_hover_circle(g));

  selection.subscribe_to_selected_datum(["vehicle_global_position_0"], {
    next: (datum) => {
      if (!datum) return;
      pos_datum = datum[0];
      g.selectAll("circle.click")
        .data([pos_datum])
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
        .attr("cx", flight_path.x())
        .attr("cy", flight_path.y());
    }
  })

  selection.subscribe_to_selected_range(["vehicle_global_position_0"], {
    next: (range) => {
      let all_data = [];
      if (range && range[0] !== data) {
        all_data = [range[0]];
      }
      g.selectAll("path.flight-path-selection")
        .data(all_data)
        .join(
          enter => enter.insert("path", ":first-child")
            .classed("flight-path-selection", true),
          update => update,
          exit => exit.remove()
        )
        .attr("d", flight_path);
    }
  });
}





async function generate_3d_plot(id, all_data, selection) {
  //TODO: Add resize when the window changes
  //TODO: Add zoom?
  //TODO: Center axis on (0,0,0)
  let svg = d3.select(`#${id}`)
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

  let data = all_data.vehicle_global_position_0;

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

  let theta = Math.PI / 4;
  let phi = Math.PI / 4;

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
    .on("mousemove", () => update_hover_circle(g, points, all_data))
    .on("mouseleave", () => remove_hover_circle(g))
    .on("click", () => {
      let coords = d3.clientPoint(g.node(), d3.event);
      let closest_datum = points.find(coords[0], coords[1]);
      selection.next_selected_datum(closest_datum.timestamp);
    });

  function update_selection_circle(datum) {
    if (!datum) return;
    g.selectAll("circle.click")
      .data(flight_path([[datum[0]]])[0])
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
  function update_selection_range(range) {
    let all_data = [];
    if (range && range[0] !== data) {
      all_data = [range[0]];
    }
    flight_path(all_data);

    g.selectAll("path.flight-path-selection")
      .data(all_data)
      .join(
        enter => enter.insert("path", ":first-child")
          .classed("flight-path-selection", true),
        update => update,
        exit => exit.remove()
      )
      .attr("d", flight_path.draw);
  }

  function update_3d() {
    flight_path.rotateX(phi);
    flight_path.rotateY(theta);
    axis_projection.rotateX(phi);
    axis_projection.rotateY(theta);

    let launchpoint = data[0];
    let axis_data = [
      [[-1.0, scales[2](launchpoint.alt), scales[1](launchpoint.lat)],
       [ 1.0, scales[2](launchpoint.alt), scales[1](launchpoint.lat)]],// x
      [[scales[0](launchpoint.lon), -1.0, scales[1](launchpoint.lat)],
       [scales[0](launchpoint.lon), 1.0, scales[1](launchpoint.lat)]],// y
      [[scales[0](launchpoint.lon), scales[2](launchpoint.alt), -1.0],
       [scales[0](launchpoint.lon), scales[2](launchpoint.alt), 1.0]] // z
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
    let current_datum = selection.get_selected_datum(["vehicle_global_position_0"]);
    if (current_datum) {
      update_selection_circle(current_datum);
    }
    let current_range = selection.get_selected_range(["vehicle_global_position_0"]);
    if (current_range) {
      update_selection_range(current_range);
    }
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

  selection.subscribe_to_selected_datum(["vehicle_global_position_0"], {
    next: update_selection_circle
  });

  selection.subscribe_to_selected_range(["vehicle_global_position_0"], {
    next: update_selection_range
  });
  // Ensure we update the 3d when we zoom out
  // But only if we are the original zoomed out svg
  if (id == "path-view-3d") {
    selection.zoomed_out_event.subscribe({ next: update_3d });
  }
}





function setup_selected_point_info(selection) {
  let fmt = format.format(" ,.4f");
  selection.subscribe_to_selected_datum(
    ["vehicle_global_position_0", "sensor_accel_0", "sensor_mag_0", "sensor_baro_0", "vehicle_attitude_0"],
    {
      next: (d) => {
        if (!d) {
          d = [
            { enu: {e: "?", n: "?", u: "?"} },
            { x: "?", y: "?", z: "?" },
            { x: "?", y: "?", z: "?" },
            { pressure: "?" },
            { q: new Quaternion() }];
        }
        d3.selectAll(".pos_x").text(fmt(d[0].enu.e));
        d3.selectAll(".pos_y").text(fmt(d[0].enu.u));
        d3.selectAll(".pos_z").text(fmt(d[0].enu.n));
        d3.selectAll(".acc_x").text(fmt(d[1].x));
        d3.selectAll(".acc_y").text(fmt(d[1].y));
        d3.selectAll(".acc_z").text(fmt(d[1].z));
        d3.selectAll(".mag_x").text(fmt(d[2].x));
        d3.selectAll(".mag_y").text(fmt(d[2].y));
        d3.selectAll(".mag_z").text(fmt(d[2].z));
        d3.selectAll(".baro").text("(" + fmt(d[3].pressure) + ")");
        d3.selectAll(".rot_x").text(fmt(rad_to_deg(d[4].q.toEuler()[0])));
        d3.selectAll(".rot_y").text(fmt(rad_to_deg(d[4].q.toEuler()[1])));
        d3.selectAll(".rot_z").text(fmt(rad_to_deg(d[4].q.toEuler()[2])));
      }
    })
}




async function generate_path_line_chart(all_data, selection) {
  let acceleration_data = all_data.sensor_accel_0;
  let data_names = [ "Acceleration",  "Magnetometer", "Barometer" ];
  let data = [ all_data.sensor_accel_0, all_data.sensor_mag_0, all_data.sensor_baro_0 ];
  let data_is_visible = [ true, true, true ];
  let color_scale = d3.scaleOrdinal(d3.schemeCategory10);
  let data_accesors = [ d => d.mag, d => d.mag, d => d.pressure ];

  // Adding legend. Note: We need to add the legend before we get the svg size,
  // because the legend will push (and shrink) the svg.
  let populate_legend_label = (div) => {
    let id = (d, i) => `path-line-chart-legend-${i}`;
    div.attr("class", (d, i) => "ordinal" + i)
      .classed("custom-control", true)
      .classed("custom-checkbox", true);
    div.append("input")
      .attr("type", "checkbox")
      .classed("custom-control-input", true)
      .attr("id", id)
      .property("checked", true);
    div.append("label")
      .classed("custom-control-label", true)
      .attr("for", id)
      .text(d => d);
  }

  let legend = d3.select("#path-line-chart-legend");
  let legend_binding = legend.selectAll("div")
    .data(data_names)
    .enter()
    .append("div")
    .call(populate_legend_label);

  // TODO: If there is only one datapoint selected, we don't need to normalise,
  // so we could display the actual scale instead.
  let normalize_scales = range(data.length)
    .map(i => d3.scaleLinear(d3.extent(data[i], data_accesors[i]), [0, 1]));

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
  
  let clip_path_id = "path-line-chart-clip-path";
  g.append("clipPath")
    .attr("id", clip_path_id)
    .append("rect")
    .attr("width", svg_size.width - padding.left - padding.right)
    .attr("height", svg_size.height - padding.top - padding.bottom)

  let scale = {
    x_no_zoom: d3.scaleTime()
      .domain(d3.extent(acceleration_data, row => row.timestamp))
      .range([0, svg_size.width - padding.left - padding.right]),
    y: d3.scaleLinear()
      .domain([0, 1])
      .range([svg_size.height - padding.top - padding.bottom, 0])
  };
  scale.x = scale.x_no_zoom;
  
  let axis_x = (g, x) => g.call(d3.axisBottom(x));
  let axis_y = d3.axisLeft(scale.y);

  g.append("g")
    .classed("axis", true)
    .classed("x", true)
    .attr("transform", "translate(0," + (svg_size.height - padding.bottom - padding.top) + ")")
    .call(axis_x, scale.x);
  
  g.append("g")
    .classed("axis", true)
    .classed("y", true)
    .attr("transform", "translate(0,0)")
    .call(axis_y);

  let lines = range(data.length)
    .map(i => d3.line()
        .x(d => scale.x(d.timestamp))
        .y(d => scale.y(normalize_scales[i](data_accesors[i](d))))
    );

  let update_lines = () => {
    g.selectAll("path.graph-line")
      .data(data)
      .join(
        enter => enter.append("path")
          .classed("graph-line", true)
          .attr("clip-path", `url(#${clip_path_id})`),
        update => update,
        exit => exit.remove()
      )
      .attr("d", (d, i) => lines[i](d))
      .attr("stroke", (d, i) => color_scale(i))
      .attr("visibility", (d, i) => data_is_visible[i]?"visible":"hidden");
  };
  update_lines();
  
  let update_selection_line = (selected_datum) => {
    if (!selected_datum) return;
    g.selectAll("line.graph-selection-line")
      .data([selected_datum[0]])
      .join(
        enter => enter.append("line")
          .classed("graph-selection-line", true)
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("clip-path", `url(#${clip_path_id})`),
        update => update,
        exit => exit.remove()
      )
      .attr("x1", d => scale.x(d.timestamp))
      .attr("x2", d => scale.x(d.timestamp))
      .attr("y1", d => scale.y.range()[0])
      .attr("y2", d => scale.y.range()[1]);
  };

  let update_hover_line = (timestamp) => {
    g.selectAll("line.graph-hover-line")
      .data([timestamp])
      .join(
        enter => enter.append("line")
          .classed("graph-hover-line", true)
          .attr("fill", "none")
          .attr("stroke", "grey")
          .attr("pointer-events", "none")
          .attr("clip-path", `url(#${clip_path_id})`),
        update => update,
        exit => exit.remove()
      )
      .attr("x1", d => scale.x(d))
      .attr("x2", d => scale.x(d))
      .attr("y1", d => scale.y.range()[0])
      .attr("y2", d => scale.y.range()[1]);

    if (timestamp) {
      update_hover_tooltip([d3.event.pageX, d3.event.pageY], timestamp, all_data, 
        ["sensor_accel_0", "sensor_baro_0", "sensor_mag_0"]);
    }
    else {
      remove_hover_tooltip();
    }
  }

  let zoom = d3.zoom()
    .scaleExtent([1, 32])
    .extent([[0, 0], [svg_size.width - padding.left - padding.right, 0]])
    .translateExtent([[0, 0], [svg_size.width - padding.left - padding.right, 0]])
    .clickDistance(5)
    .on("zoom", () => {
      const transform = d3.event.transform;
      scale.x = transform.rescaleX(scale.x_no_zoom).interpolate(d3.interpolateRound);
      svg.select("g.axis.x").call(axis_x, scale.x);
      update_lines();
      update_selection_line(selection.get_selected_datum(["sensor_accel_0"]));
      if (d3.event.transform.k === 1) {
        selection.next_selected_range(undefined, undefined);
      }
      else {
        let start = scale.x.invert(scale.x.range()[0]);
        let end = scale.x.invert(scale.x.range()[1]);
        selection.next_selected_range(start, end);
      }
    });

  g.append("rect")
    .attr("width", svg_size.width - padding.left - padding.right)
    .attr("height", svg_size.height - padding.top - padding.bottom)
    .attr("fill", "none")
    .style("pointer-events", "fill")
    .on("click", () => {
      let coords = d3.clientPoint(g.node(), d3.event);
      let clicked_date = scale.x.invert(coords[0]);
      selection.next_selected_datum(clicked_date);
    })
    .on("mousemove", () => {
      let coords = d3.clientPoint(g.node(), d3.event);
      let hovered_date = scale.x.invert(coords[0]);
      // We do this to snap to the closest date.
      hovered_date = data[0][data[0].min_index((d) => Math.abs(d.timestamp - hovered_date))].timestamp;
      update_hover_line(hovered_date);
    })
    .on("mouseleave", () => update_hover_line(undefined))
    .call(zoom)
    .call(zoom.transform, d3.zoomIdentity);

  selection.subscribe_to_selected_datum(["sensor_accel_0"], {
    next: update_selection_line
  });

  // Legend interractivity
  legend_binding.select("input")
    .on("change", function (d, i) {
      data_is_visible[i] = d3.select(this).property("checked");
      update_lines();
    });
}





function generate_remote_controller(selection) {
  let svg = d3.select("#rc-view");
  let left_stick = svg.select("#left-stick");
  let right_stick = svg.select("#right-stick");
  // Note: the values below for the domain come from the px4 specs
  let px4_rc_input_domain = [1000, 2000];
  // Note: the value for the range come from the svg controller.svg
  let toggle_scale = d3.scaleLinear()
    .domain(px4_rc_input_domain)
    .range([191, 194])
    .clamp(true);
  let thrust_scale = d3.scaleLinear()
    .domain(px4_rc_input_domain)
    .range([parseFloat(left_stick.attr("cy")) + parseFloat(left_stick.attr("r")),
            parseFloat(left_stick.attr("cy")) - parseFloat(left_stick.attr("r"))])
    .clamp(true);
  let yaw_scale = d3.scaleLinear()
    .domain(px4_rc_input_domain)
    .range([parseFloat(left_stick.attr("cx")) - parseFloat(left_stick.attr("r")),
            parseFloat(left_stick.attr("cx")) + parseFloat(left_stick.attr("r"))])
    .clamp(true);
  let pitch_scale = d3.scaleLinear()
    .domain(px4_rc_input_domain)
    .range([parseFloat(right_stick.attr("cy")) + parseFloat(right_stick.attr("r")),
            parseFloat(right_stick.attr("cy")) - parseFloat(right_stick.attr("r"))])
    .clamp(true);
  let roll_scale = d3.scaleLinear()
    .domain(px4_rc_input_domain)
    .range([parseFloat(right_stick.attr("cx")) - parseFloat(right_stick.attr("r")),
            parseFloat(right_stick.attr("cx")) + parseFloat(right_stick.attr("r"))])
    .clamp(true);
  selection.subscribe_to_selected_datum(["input_rc_0"], {
    next: (datum) => {
      // TODO: Set the controller to a "disabled" state
      if (!datum) return;

      let rc_input = datum[0];
      // Set channel 0 and 1 (thrust and yaw)
      svg.select("#left-knob")
        .attr("cx", yaw_scale(rc_input.values[3]))
        .attr("cy", thrust_scale(rc_input.values[2]));
      svg.select("#right-knob")
        .attr("cx", roll_scale(rc_input.values[0]))
        .attr("cy", pitch_scale(rc_input.values[1]));
      // Set the chanels 4 and above
      for (let i = 4; i < rc_input.values.length; ++i) {
        svg.select(`#channel${i}`)
          .attr("y", toggle_scale(rc_input.values[i]))
      }
    }
  });
}




function create_zoom_buttons(generators, selection) {
  let svg = d3.selectAll(".four-views > svg");

  let zoom_button_size = [15, 15];
  let zoom_button_padding = {
    top: 2,
    right: 2
  };

  function create_zoom_buttons(svg, text) {
    let g = svg.append("g")
      .attr("transform", function() {
        return `translate(${
          this.parentNode.clientWidth - zoom_button_size[0] - zoom_button_padding.right
        }, ${zoom_button_padding.top})`;
      });

    g.append("rect")
      .classed("zoom-button", true)
      .attr("width", zoom_button_size[0])
      .attr("height", zoom_button_size[1])
      .attr("x", 0)
      .attr("y", 0)
      .attr("rx", zoom_button_size[0]/4)
      .attr("ry", zoom_button_size[1]/4);
    g.append("text")
      .classed("unselectable", true)
      .attr("x", zoom_button_size[0] / 2)
      .attr("y", zoom_button_size[1] / 2)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "middle")
      .attr("stroke", "white")
      .attr("user-select", "none")
      .text(text);
    return g;
  }
  function zoom_in() {
    d3.select("#small-graphs")
      .style("display", "none");
    let svg = d3.select("#big-graph")
      .style("display", "initial")
      .select("svg");
      
    svg.selectAll("*").remove();
    
    // we clicked on a child of g, the 2nd parent is the svg
    let id = d3.select(d3.event.srcElement.parentNode.parentNode).attr("id");
    generators[id]("zoomed-graph");

    let unzoom_buttons = create_zoom_buttons(svg, "-");
    unzoom_buttons.on("click", () => {
      d3.select("#small-graphs")
        .style("display", "grid");
      let svg = d3.select("#big-graph")
        .style("display", "none")
        .select("svg");
      selection.zoomed_out_event.next();
    });
  }

  let zoom_buttons = create_zoom_buttons(svg, "+");
  zoom_buttons.on("click", zoom_in);
}





let example_flight_file = new ULogFile("example_flight");
ON_TAB_FIRST_OPEN["path-tab"] = async () => {
  //TODO: Allign axis
  let all_data = await example_flight_file.retreive_all();
  let selection = new Selection(all_data);
  
  // TODO: keep aspect ratio on graphs
  let generators = {
    "path-view-top": (id) => generate_2d_plot(all_data, {
      id: id,
      color: "lightgreen",
      x: "lon",
      y: "lat",
      x_axis_class: "red",
      y_axis_class: "blue"
    }, selection),
    "path-view-front": (id) => generate_2d_plot(all_data, {
      id: id,
      color: "rgb(214, 139, 214)",
      x: "lon",
      y: "alt",
      x_axis_class: "red",
      y_axis_class: "green"
    }, selection),
    "path-view-left": (id) => generate_2d_plot(all_data, {
      id: id,
      color: "pink",
      x: "lat",
      y: "alt",
      x_axis_class: "blue",
      y_axis_class: "green"
    }, selection),
    "path-view-3d": (id) => generate_3d_plot(id, all_data, selection),
  };
  for (let [id, generator] of Object.entries(generators)) {
    generator(id);
  }
  
  setup_selected_point_info(selection);
  generate_path_line_chart(all_data, selection);
  generate_remote_controller(selection);

  create_zoom_buttons(generators, selection);
}