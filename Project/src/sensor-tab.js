const CIRCLE_RADIUS = 45;
let sensors = [{ "id": 0, "name": 'Accelerator' },
{ "id": 1, "name": 'Estimated' },
{ "id": 2, "name": 'GPS' },
{ "id": 3, "name": 'Battery' },
{ "id": 4, "name": 'Wind' },
{ "id": 5, "name": 'Baro' },
{ "id": 6, "name": 'Gyro' }]

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
            if(linksToIgnore.has(idx)) {
                svg.select(`#link_${idx}`).style('opacity', '1.0')
            }else {
                svg.select(`#link_${idx}`).style('opacity', '0.25')
            }
        })
}

example_flight_file.retreive_all().then((all_data) => {
    var allSensors = Object.keys(all_data);
    console.log(allSensors)

    // Initialize the links
    let link = svg
        .selectAll("line")
        .data(sensorLinks)
        .enter()
        .append("line")
        .attr("id", (entry, idx) => `link_${idx}`)
        .style("stroke", "#aaa")

    // Initialize the nodes
    let node = svg
        .selectAll("circle")
        .data(sensors)
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
    let simulation = d3.forceSimulation(sensors)
        .force("link", d3.forceLink()
            .id(function (d) { return d.id; })
            .links(sensorLinks)
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
            .attr("cx", function (d) { return clamp(d.x, CIRCLE_RADIUS, width); })
            .attr("cy", function (d) { return clamp(d.y, CIRCLE_RADIUS, height); });

        node_label
            .attr("dx", function (d) { return clamp(d.x - this.getComputedTextLength() / 2.0, CIRCLE_RADIUS, width); })
            .attr("dy", function (d) { return clamp(d.y, CIRCLE_RADIUS, height); });
    }

    //TODO-WIP: Add graph depending of the selected nodes

});
