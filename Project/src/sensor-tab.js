// set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 20, left: 40 },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#main-page-sensor")
    .append("svg")
    .attr("width", width + margin.left + margin.right) // 
    .attr("height", height + margin.top + margin.bottom) //
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


example_flight_file.retreive_all().then((all_data) => {
    let selection = new Selection(all_data);
    var allSensors = Object.keys(all_data);
    console.log(allSensors)

    let sensors = [{ "id": 1, "name": 'Accelerator' },
    { "id": 2, "name": 'Estimated' },
    { "id": 3, "name": 'GPS' },
    { "id": 4, "name": 'Battery' },
    { "id": 5, "name": 'Wind' },
    { "id": 6, "name": 'Baro' },
    { "id": 7, "name": 'Gyro' }]

    let sensorLinks = [{
        'source': 1,
        'target': 6
    },
    {
        'source': 2,
        'target': 7
    },
    {
        'source': 2,
        'target': 3
    },
    {
        'source': 3,
        'target': 7
    },
    {
        'source': 4,
        'target': 5
    },
    {
        'source': 4,
        'target': 6
    },
    {
        'source': 5,
        'target': 6
    }]

    // Initialize the links
    var link = svg
        .selectAll("line")
        .data(sensorLinks)
        .enter()
        .append("line")
        .style("stroke", "#aaa")

    // Initialize the nodes
    var node = svg
        .selectAll("circle")
        .data(sensors)
        .enter()
        .append("circle")
        .attr("r", 30)
        .style("fill", d => getRandomColor())
        .on('click', function(e) {
            console.log('CLICKED!')
            //TODO-WIP: Get the node, and links related to this and highlight them
        })
       

    // Let's list the force we wanna apply on the network
    var simulation = d3.forceSimulation(sensors)                 
        .force("link", d3.forceLink()                            
            .id(function (d) { return d.id; })                   
            .links(sensorLinks)                                  
        )
        .force("charge", d3.forceManyBody().strength(20))        
        .force("center", d3.forceCenter(width / 2, height / 2))     // Attract to center of SVG
        .force('collision', d3.forceCollide().radius(40)) // Collide between nodes (Collision radius: Radius + 10)
        .on("tick", ticked);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node
            .attr("cx", function (d) { return clamp(d.x, 30, width); })
            .attr("cy", function (d) { return clamp(d.y, 30, height); });
    }

    //TODO-WIP: Add graph depending of the selected nodes

});
