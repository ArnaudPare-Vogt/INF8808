// TODO: @Riad change this to contain less stuff (like define functions outside) 
ON_TAB_FIRST_OPEN["sensor-tab"] = async () => {
const CIRCLE_RADIUS = 55;
/**
*0 Accele(Norm [x]) -> { Battery(powerUsed[x]), Wind(intensity[x]) } 
*1 Estimated(xyz) -> { GPS(xyz), Baro(y)}
*2 GPS(xyz) -> { Estimated (xyz), Baro(y) }
*3 Battery(powerUsed) ->  {Wind(intensity), Baro(y), GPS (alt[y])}
*4 Wind(x) -> {Battery(x), Accele(x), Baro(y)}
*5 Baro(y) -> { GPS(y), Estimated(y), Wind(intensity), Battery(powerUsed)}
*6 Gyro(xyz) -> { Estimated_Attitude (xyz) }
*7 Estimated_Attitude (xyz) -> { Gyro(xyz) }
*/
let sensors = [
    { "id": 0, "name": 'Accelerometer', "sensor_id": "sensor_accel_0", "data_getter_x": d => d.mag, "data_getter_y": null, "data_getter_z": null },
    { "id": 1, "name": 'Estimated', "sensor_id": "vehicle_global_position_0", "data_getter_x": d => d.enu.e, "data_getter_y": d => d.enu.n, "data_getter_z": d => d.enu.u }, //TODO: Check getter
    { "id": 2, "name": 'GPS', "sensor_id": "vehicle_gps_position_0", "data_getter_x": d => d.enu.e, "data_getter_y": d => d.enu.n, "data_getter_z": d => d.enu.u }, //TODO: Check getter
    { "id": 3, "name": 'Battery', "sensor_id": "battery_status_0", "data_getter_x": d => d.voltage_v * d.current_a, "data_getter_y": null, "data_getter_z": d => 0 },
    { "id": 4, "name": 'Wind', "sensor_id": "vehicle_global_position_0", "data_getter_x": d => d.enu.u, "data_getter_y": null, "data_getter_z": null }, //TODO: Check
    { "id": 5, "name": 'Baro', "sensor_id": "sensor_baro_0", "data_getter_x": null, "data_getter_y": d => d.pressure, "data_getter_z": null },
    { "id": 6, "name": 'Gyro', "sensor_id": "sensor_gyro_0", "data_getter_x": d => d.x, "data_getter_y": d => d.y, "data_getter_z": d => d.z },
    { "id": 7, "name": 'Attitude', "sensor_id": "vehicle_attitude_0", "data_getter_x": d => d.euler[0], "data_getter_y": d => d.euler[1], "data_getter_z": d => d.euler[2] }
]

let sensorLinks = [
    [{ // Accelerometer
        'source': 0, 'target': 3,
        'x_link': 'data_getter_x', // Means Accel(x) plots with Battery(x)
        'y_link': null,
        'z_link': null
    },
    {
        'source': 0, 'target': 4,
        'x_link': 'data_getter_x',
        'y_link': null,
        'z_link': null
    }],
    [{ // Estimated
        'source': 1, 'target': 2,
        'x_link': 'data_getter_x',
        'y_link': 'data_getter_y',
        'z_link': 'data_getter_z'
    },
    {
        'source': 1, 'target': 5,
        'x_link': null,
        'y_link': 'data_getter_y',
        'z_link': null
    }],
    [{ // GPS
        'source': 2, 'target': 1,
        'x_link': 'data_getter_x',
        'y_link': 'data_getter_y',
        'z_link': 'data_getter_z'
    },
    {
        'source': 2, 'target': 5,
        'x_link': null,
        'y_link': 'data_getter_y',
        'z_link': null
    }],
    [{ // Battery
        'source': 3, 'target': 4,
        'x_link': 'data_getter_x',
        'y_link': null,
        'z_link': null
    },
    {
        'source': 3, 'target': 5,
        'x_link': 'data_getter_y',
        'y_link': null,
        'z_link': null
    },
    {
        'source': 3, 'target': 2,
        'x_link': 'data_getter_y',
        'y_link': null,
        'z_link': null
    }],
    [{ // Wind(x)
        'source': 4, 'target': 3,
        'x_link': 'data_getter_x',
        'y_link': null,
        'z_link': null
    },
    {
        'source': 4, 'target': 0,
        'x_link': 'data_getter_x',
        'y_link': null,
        'z_link': null
    },
    {
        'source': 4, 'target': 5,
        'x_link': 'data_getter_y',
        'y_link': null,
        'z_link': null
    }],
    [{ // Baro
        'source': 5, 'target': 2,
        'x_link': null,
        'y_link': 'data_getter_y',
        'z_link': null
    },
    {
        'source': 5, 'target': 1,
        'x_link': null,
        'y_link': 'data_getter_y',
        'z_link': null
    },
    {
        'source': 5, 'target': 4,
        'x_link': null,
        'y_link': 'data_getter_x', // Baro(y) with Wind(x)
        'z_link': null
    },
    {
        'source': 5, 'target': 3,
        'x_link': null,
        'y_link': 'data_getter_x', // Baro(y) with Battery(x)
        'z_link': null
    }],
    [{ // Gyro
        'source': 6, 'target': 7,
        'x_link': 'data_getter_x',
        'y_link': 'data_getter_y',
        'z_link': 'data_getter_z'
    }],
    [{ // Attitude
        'source': 7, 'target': 6,
        'x_link': 'data_getter_x',
        'y_link': 'data_getter_y',
        'z_link': 'data_getter_z'
    }]]

// set the dimensions and margins of the graph
let margin = { top: 20, right: 20, bottom: 20, left: 40 },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3.select("#main-page-sensor")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


let selected_sensor_index = -1;

function update_selected_sensor(sensor_index) {
    if (selected_sensor_index != -1) {
        svg.select(`#sensor_${selected_sensor_index}`).style("stroke", 'none');
    }
    selected_sensor_index = sensor_index;

    svg.select(`#sensor_${sensor_index}`).style("stroke", 'red').style('stroke-width', '3px');

    // Find sensors that are connected to this one
    let toIgnore = new Set();
    let linksToIgnore = new Set();
    let flat = sensorLinks.flat()
    for (let i = 0; i < flat.length; ++i) {
        let link = flat[i];
        if (link.source.id == sensor_index || link.target.id == sensor_index) {
            toIgnore.add(link.source.id)
            toIgnore.add(link.target.id)
            linksToIgnore.add(i);
        }
    }

    sensors
        .filter(e => !toIgnore.has(e.id))
        .forEach(e => svg.select(`#sensor_g_${e.id}`).style('opacity', '0.25'))

    toIgnore
        .forEach(e => svg.select(`#sensor_g_${e}`).style('opacity', '1.0'))

    flat
        .forEach(function (e, idx) {
            if (linksToIgnore.has(idx)) {
                svg.select(`#link_${idx}`).style('opacity', '1.0')
            } else {
                svg.select(`#link_${idx}`).style('opacity', '0.25')
            }
        })

    //Update the XYZ graphics
    upd_x(sensors[selected_sensor_index])
    upd_y(sensors[selected_sensor_index])
    upd_z(sensors[selected_sensor_index])

}

let upd_x = null;
let upd_y = null;
let upd_z = null;

example_flight_file.retreive_all().then((all_data) => {
    generate_sensor_network(sensors, sensorLinks.flat())
    upd_x = generate_sensor_datagraph(all_data, sensors, 'x')
    upd_y = generate_sensor_datagraph(all_data, sensors, 'y')
    upd_z = generate_sensor_datagraph(all_data, sensors, 'z')
});


function generate_sensor_datagraph(all_data, sensor_list, axis) {
    let sensor_graph_svg = d3.select(`#sensor-graphs-${axis}`)
        .append("svg")
        .attr('width', '100%')
        .attr('height', '100%')

    let svg_size = {
        width: sensor_graph_svg.node().clientWidth,
        height: sensor_graph_svg.node().clientHeight
    };

    let padding = {
        left: 50,
        right: 10,
        top: 10,
        bottom: 20,
    }

    let g = sensor_graph_svg.append("g")
        .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

    let clip_path_id = "sensor-graphs-path-line-chart-clip-path" + axis;
    g.append("clipPath")
        .attr("id", clip_path_id)
        .append("rect")
        .attr("width", svg_size.width - padding.left - padding.right)
        .attr("height", svg_size.height - padding.top - padding.bottom)

    let acceleration_data = all_data.sensor_accel_0;
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



    let color_scale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(sensors.map(d => d.id));
    let update_lines = (selected_sensor) => {
        let others = sensorLinks[selected_sensor.id]

        // Check if we need to draw this axis
        if (others[0][`${axis}_link`] == null) {
            g.attr('visibility', 'hidden');
            return;
        }
        g.attr('visibility', 'visible');

        let normalize_scales = [d3.scaleLinear(d3.extent(all_data[selected_sensor.sensor_id], selected_sensor[`data_getter_${axis}`]), [0, 1])]

        normalize_scales.push(range(others.length)
            .map(function (i) {
                return d3.scaleLinear(d3.extent(all_data[others[i].target.sensor_id], others[i].target[`data_getter_${axis}`]), [0, 1])
            }));
        normalize_scales = normalize_scales.flat()

        let data = [selected_sensor]
        data.push(others.map(d => d.target))
        data = data.flat()

        let lines = range(data.length)
            .map(i => d3.line()
                .x(d => scale.x(d.timestamp))
                .y(d => data[i][`data_getter_${axis}`] == null ? null : scale.y(normalize_scales[i](data[i][`data_getter_${axis}`](d))))
            );

        g.selectAll("path.graph-line")
            .data(data)
            .join(
                enter => enter.append("path")
                    .classed("graph-line", true)
                    .attr("clip-path", `url(#${clip_path_id})`),
                update => update,
                exit => exit.remove()
            )
            .attr("d", (d, i) => lines[i] == null ? "" : lines[i](all_data[d.sensor_id]))
            .attr("stroke", (d) => color_scale(d.id))
            .attr("visibility", (d, i) => sensors[d.id][`data_getter_${axis}`] != null ? "visible" : "hidden");
    };
    g.attr('visibility', 'hidden'); // Lines are hidden by default

    return update_lines
}

function generate_sensor_network(sensor_list, sensor_links) {
    // Initialize the links
    let link = svg
        .selectAll("line")
        .data(sensor_links)
        .enter()
        .append("line")
        .attr("id", (entry, idx) => `link_${idx}`)
        .style("stroke", "#aaa")

    // Initialize the nodes
    let node = svg
        .selectAll("circle")
        .data(sensor_list)
        .enter()
        .append('g')
        .attr("id", (entry) => `sensor_g_${entry.id}`)

    let color_scale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(sensors.map(d => d.id));
    let circle = node
        .append("circle")
        .attr("id", (entry) => `sensor_${entry.id}`)
        .attr("r", CIRCLE_RADIUS)
        .style("fill", d => color_scale(d.id))

    node.on('click', e => update_selected_sensor(e.id))
        .on("mouseover", function (d) { d3.select(this).style("cursor", "pointer"); })
        .on("mouseout", function (d) { d3.select(this).style("cursor", "default"); })
    let node_label = node.append('text').text(entry => entry.name).attr('fill', 'white')

    // Let's list the force we wanna apply on the network
    let simulation = d3.forceSimulation(sensor_list)
        .force("link", d3.forceLink()
            .id(function (d) { return d.id; })
            .links(sensor_links)
        )
        .force("charge", d3.forceManyBody().strength(20))
        .force("center", d3.forceCenter(width / 2, height / 2))     // Attract to center of SVG
        .force('collision', d3.forceCollide().radius(CIRCLE_RADIUS + 10)) // Collide between nodes (Collision radius: Radius + 10)
        .on("tick", ticked);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        circle
            .attr("cx", function (d) { return clamp(d.x, CIRCLE_RADIUS / 2.0, width - CIRCLE_RADIUS / 2.0); })
            .attr("cy", function (d) { return clamp(d.y, CIRCLE_RADIUS / 2.0, height - CIRCLE_RADIUS / 2.0); });

        node_label
            .attr("dx", function (d) { return clamp(d.x - this.getComputedTextLength() / 2.0, CIRCLE_RADIUS / 2.0, width - CIRCLE_RADIUS / 2.0); })
            .attr("dy", function (d) { return clamp(d.y, CIRCLE_RADIUS / 2.0, height - CIRCLE_RADIUS / 2.0); });
    }
}
}