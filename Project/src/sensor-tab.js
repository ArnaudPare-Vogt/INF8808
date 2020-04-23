const CIRCLE_RADIUS = 45;
let sensors = [{ "id": 0, "name": 'Accelerator', "sensor_id": "sensor_accel_0", "data_getter": d => d.mag },
{ "id": 1, "name": 'Estimated', "sensor_id": "vehicle_global_position_0", "data_getter": d => d.enu.u }, //TODO: Check
{ "id": 2, "name": 'GPS', "sensor_id": "vehicle_gps_position_0", "data_getter": d => d.alt }, //TODO: Check getter
{ "id": 3, "name": 'Battery', "sensor_id": "battery_status_0", "data_getter": d => d.voltage_v * d.current_a }, //TODO: Check getter
{ "id": 4, "name": 'Wind', "sensor_id": "vehicle_global_position_0", "data_getter": d => d.enu.u }, //TODO: Check
{ "id": 5, "name": 'Baro', "sensor_id": "sensor_baro_0", "data_getter": d => d.pressure },
{ "id": 6, "name": 'Gyro', "sensor_id": "sensor_gyro_0", "data_getter": d => d.temperature }] //TODO: Check getter

let sensorLinks = [{
    'source': 0,
    'target': 5
},
{
    'source': 1,
    'target': 6
},
{
    'source': 1,
    'target': 2
},
{
    'source': 2,
    'target': 6
},
{
    'source': 3,
    'target': 4
},
{
    'source': 3,
    'target': 5
},
{
    'source': 4,
    'target': 5
}]

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
    for (let i = 0; i < sensorLinks.length; ++i) {
        let link = sensorLinks[i];
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

    sensorLinks
        .forEach(function (e, idx) {
            if (linksToIgnore.has(idx)) {
                svg.select(`#link_${idx}`).style('opacity', '1.0')
            } else {
                svg.select(`#link_${idx}`).style('opacity', '0.25')
            }
        })
}

example_flight_file.retreive_all().then((all_data) => {
    var allSensors = Object.keys(all_data);
    console.log(allSensors)

    generate_sensor_network(sensors, sensorLinks)
    generate_sensor_datagraph(all_data, sensors)

    //TODO-WIP: Add graph depending of the selected nodes

});


function generate_sensor_datagraph(all_data, sensor_list) {
    let normalize_scales = range(sensor_list.length)
        .map(i => d3.scaleLinear(d3.extent(all_data[sensor_list[i].sensor_id], sensor_list[i].data_getter), [0, 1]));
    console.log(normalize_scales)
    // let sensor_data = [all_data['sensor_gyro_0']]
    // console.log(all_data['vehicle_gps_position_0'])
    let sensor_graph_svg = d3.select("#sensor-graphs")
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

    let clip_path_id = "sensor-graphs-path-line-chart-clip-path";
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

    let lines = range(sensor_list.length)
        .map(i => d3.line()
            .x(d => scale.x(d.timestamp))
            .y(d => scale.y(normalize_scales[i](sensor_list[i].data_getter(d))))
        );

    let color_scale = d3.scaleOrdinal(d3.schemeCategory10);
    let update_lines = () => {
        g.selectAll("path.graph-line")
            .data(sensor_list)
            .join(
                enter => enter.append("path")
                    .classed("graph-line", true)
                    .attr("clip-path", `url(#${clip_path_id})`),
                update => update,
                exit => exit.remove()
            )
            .attr("d", (d, i) => lines[i](all_data[d.sensor_id]))
            .attr("stroke", (d, i) => color_scale(i))
            .attr("visibility", (d, i) => "visible");
        // .attr("visibility", (d, i) => data_is_visible[i] ? "visible" : "hidden");

    };
    update_lines();
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

    let circle = node
        .append("circle")
        .attr("id", (entry) => `sensor_${entry.id}`)
        .attr("r", CIRCLE_RADIUS)
        .style("fill", d => getRandomColor())

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
