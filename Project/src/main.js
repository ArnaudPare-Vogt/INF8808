const message_preprocessors = {
  "vehicle_global_position_0": (row, parse_timestamp) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/vehicle_global_position.msg
    row.lat = parseFloat(row.lat);
    row.lon = parseFloat(row.lon);
    row.alt = parseFloat(row.alt);
    row.alt_ellipsoid = parseFloat(row.alt_ellipsoid);
    row.delta_alt = parseFloat(row.delta_alt);
    row.lat_lon_reset_counter = parseInt(row.lat_lon_reset_counter);
    row.alt_reset_counter = parseInt(row.alt_reset_counter);
    row.yaw = parseFloat(row.yaw);
    row.eph = parseFloat(row.eph);
    row.epv = parseFloat(row.epv);
    row.terrain_alt = parseFloat(row.terrain_alt);
    row.terrain_alt_valid = parseInt(row.terrain_alt_valid) !== 0;
    row.dead_reckoning = parseInt(row.dead_reckoning) !== 0;
  },
  "sensor_accel_0": (row, parse_timestamp) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/sensor_accel.msg
    row.timestamp_sample = parse_timestamp(row.timestamp_sample);
    row.device_id = parseInt(row.device_id);
    row.x = parseFloat(row.x);
    row.y = parseFloat(row.y);
    row.z = parseFloat(row.z);
    row.temperature = parseFloat(row.temperature);
  },
};

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
   * @returns {[Object]} All the messages of that type from that ulog file
   */
  async retreive_message(message_name) {
    let data = await d3.csv("data/" + this.ulog_file_name + "/" + this.ulog_file_name + "_" + message_name + ".csv");

    let time_scale = await this.time_resolution_promise;

    let preprocessor = message_preprocessors[message_name];
    let parse_timestamp = (timestamp) => new Date(time_scale(parseInt(timestamp.slice(0, -3))));
    data.map(row => {
      row.timestamp = parse_timestamp(row.timestamp);
      if (preprocessor) {
        preprocessor(row, parse_timestamp);
      }
    });

    return data;
  }
};


d3.select(".todo")
  .style("color", "red");

let example_flight_file = new ULogFile("example_flight");

example_flight_file.retreive_message("vehicle_global_position_0")
  .then(console.log);

example_flight_file.retreive_message("sensor_accel_0")
  .then(console.log);