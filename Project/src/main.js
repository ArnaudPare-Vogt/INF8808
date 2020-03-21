class ULogFile {
  /**
   * Creates a new ULogFile.
   * @param {String} ulog_file_name The name of the ulog file (without extention). e.g.: "example_flight"
   */
  constructor(ulog_file_name) {
    this.ulog_file_name = ulog_file_name;

    // We use GPS time to map timestamps to utc time
    // TODO: Handle the case of no gps attatched to the drone
    this.time_resolution_promise = async function() {
      let data = await d3.csv("data/" + ulog_file_name + "/" + ulog_file_name + "_vehicle_gps_position_0.csv");
      
      let timestamp_base_ms = parseInt(data[0].timestamp.slice(0, -3));
      let utc_time_base_ms = parseInt(data[0].time_utc_usec.slice(0, -3));
      return d3.scaleLinear()
        .domain([timestamp_base_ms, timestamp_base_ms+1])
        .range([utc_time_base_ms, utc_time_base_ms+1]);
    }();
  }

  /**
   * Fetches a message from the server.
   * @param {String} message_name The message name to fetch. e.g.: "vehicle_global_position_0"
   * @returns {} All the messages of that type from that ulog file
   */
  async retreive_message(message_name) {
    let data = await d3.csv("data/" + this.ulog_file_name + "/" + this.ulog_file_name + "_" + message_name + ".csv");

    let time_scale = await this.time_resolution_promise;

    data.map(row => {
      row.timestamp = new Date(time_scale(parseInt(row.timestamp.slice(0, -3))));
    });

    return data;
  }
};


d3.select(".todo")
  .style("color", "red");

new ULogFile("example_flight")
  .retreive_message("vehicle_global_position_0")
  .then(console.log);
