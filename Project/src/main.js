d3.select(".todo")
  .style("color", "red");

let example_flight_file = new ULogFile("example_flight");

example_flight_file.retreive_message("vehicle_global_position_0")
  .then(console.log);

example_flight_file.retreive_message("actuator_outputs_0")
  .then(console.log);
