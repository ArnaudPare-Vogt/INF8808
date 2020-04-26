const message_preprocessors = {
  "vehicle_global_position_0": (row, parse_timestamp, data) => {
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

    let east_north = lat_lon_distance_to_meters(
      data[0].lat,
      row.lat,
      data[0].lon,
      row.lon
    );

    row.enu = {
      e: east_north[0],
      n: east_north[1],
      u: row.alt
    };
  },
  "vehicle_gps_position_0": (row, parse_timestamp, data) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/vehicle_gps_position.msg
    row.lat = parseInt(row.lat) * 1e-7;
    row.lon = parseInt(row.lon) * 1e-7;

    row.alt = parseInt(row.alt) * 1e-3;
    row.alt_ellipsoid = parseFloat(row.alt_ellipsoid) * 1e-3;

    row.s_variance_m_s = parseFloat(row.s_variance_m_s);
    row.c_variance_rad = parseFloat(row.c_variance_rad);

    row.fix_type = parseInt(row.fix_type);
    
    row.eph = parseFloat(row.eph);
    row.epv = parseFloat(row.epv);
    
    row.hdop = parseFloat(row.hdop);
    row.vdop = parseFloat(row.vdop);

    row.noise_per_ms = parseInt(row.noise_per_ms);
    row.jamming_indicator = parseInt(row.jamming_indicator);

    row.vel_m_s = parseFloat(row.vel_m_s);
    row.vel_n_m_s = parseFloat(row.vel_n_m_s);
    row.vel_e_m_s = parseFloat(row.vel_e_m_s);
    row.vel_d_m_s = parseFloat(row.vel_d_m_s);
    row.cog_rad = parseFloat(row.cog_rad);
    row.vel_ned_valid = parseInt(row.vel_ned_valid) !== 0;

    row.satellites_used = parseInt(row.satellites_used);

    row.heading = parseFloat(row.heading);
    row.heading_offset = parseFloat(row.heading_offset);

    let east_north = lat_lon_distance_to_meters(
      data[0].lat,
      row.lat,
      data[0].lon,
      row.lon
    );

    row.enu = {
      e: east_north[0],
      n: east_north[1],
      u: row.alt
    };
  },
  "vehicle_land_detected_0": (row, parse_timestamp) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/vehicle_land_detected.msg
    row.alt_max = parseFloat(row.alt_max);
    row.freefall = parseInt(row.freefall) !== 0;
    row.ground_contact = parseInt(row.ground_contact) !== 0;
    row.maybe_landed = parseInt(row.maybe_landed) !== 0;
    row.landed = parseInt(row.landed) !== 0;
    row.in_ground_effect = parseInt(row.in_ground_effect) !== 0;
  },
  "sensor_accel_0": (row, parse_timestamp) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/sensor_accel.msg
    row.timestamp_sample = parse_timestamp(row.timestamp_sample);
    row.device_id = parseInt(row.device_id);
    row.x = parseFloat(row.x);
    row.y = parseFloat(row.y);
    row.z = parseFloat(row.z);
    row.temperature = parseFloat(row.temperature);
    
    row.mag = Math.sqrt(Math.pow(row.x, 2) + Math.pow(row.y, 2) + Math.pow(row.z, 2));
  },
  "sensor_baro_0": (row, parse_timestamp) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/sensor_baro.msg
    row.device_id = parseInt(row.device_id);
    row.error_count = parseInt(row.error_count);
    row.pressure = parseFloat(row.pressure);
    row.temperature = parseFloat(row.temperature);
  },
  "sensor_mag_0": (row, parse_timestamp) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/sensor_mag.msg
    row.device_id = parseInt(row.device_id);
    row.error_count = parseInt(row.error_count);
    row.x = parseFloat(row.x);
    row.y = parseFloat(row.y);
    row.z = parseFloat(row.z);
    row.temperature = parseFloat(row.temperature);
    row.scaling = parseFloat(row.scaling);
    row.x_raw = parseInt(row.x_raw);
    row.y_raw = parseInt(row.y_raw);
    row.z_raw = parseInt(row.z_raw);
    row.is_external = parseInt(row.is_external) !== 0;

    row.mag = Math.sqrt(Math.pow(row.x, 2) + Math.pow(row.y, 2) + Math.pow(row.z, 2));
  },
  "sensor_gyro_0": (row, parse_timestamp) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/sensor_gyro.msg
    row.timestamp_sample = parse_timestamp(row.timestamp_sample);
    row.device_id = parseInt(row.device_id);
    row.x = parseFloat(row.x);
    row.y = parseFloat(row.y);
    row.z = parseFloat(row.z);
    row.temperature = parseFloat(row.temperature);
  },
  "cpuload_0": (row, parse_timestamp) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/cpuload.msg
    row.load = parseFloat(row.load);
    row.ram_usage = parseFloat(row.ram_usage);
  },
  "battery_status_0": (row, parse_timestamp) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/battery_status.msg
    row.voltage_v = parseFloat(row.voltage_v);
    row.voltage_filtered_v = parseFloat(row.voltage_filtered_v);
    row.current_a = parseFloat(row.current_a);
    row.current_filtered_a = parseFloat(row.current_filtered_a);
    row.average_current_a = parseFloat(row.average_current_a);
    row.discharged_mah = parseFloat(row.discharged_mah);
    row.remaining = parseFloat(row.remaining);
    row.scale = parseFloat(row.scale);
    row.temperature = parseFloat(row.temperature);
    row.cell_count = parseInt(row.cell_count);

    // most other fields are not interresting
  },
  "input_rc_0": (row, parse_timestamp) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/input_rc.msg
    row.timestamp_last_signal = parse_timestamp(row.timestamp_last_signal);
    row.channel_count = parseInt(row.channel_count);
    row.rssi = parseInt(row.rssi);
    
    row.rc_failsafe = parseInt(row.rc_failsafe) !== 0;
    row.rc_lost = parseInt(row.rc_lost) !== 0;
    row.rc_lost_frame_count = parseInt(row.rc_lost_frame_count);
    row.rc_total_frame_count = parseInt(row.rc_total_frame_count);
    row.rc_ppm_frame_length = parseInt(row.rc_ppm_frame_length);

    row.input_source = parseInt(row.input_source);
    row.values = [
      parseInt(row["values[0]"]),
      parseInt(row["values[1]"]),
      parseInt(row["values[2]"]),
      parseInt(row["values[3]"]),
      parseInt(row["values[4]"]),
      parseInt(row["values[5]"]),
      parseInt(row["values[6]"]),
      parseInt(row["values[7]"]),
      parseInt(row["values[8]"]),
      parseInt(row["values[9]"]),
      parseInt(row["values[10]"]),
      parseInt(row["values[11]"]),
      parseInt(row["values[12]"]),
      parseInt(row["values[13]"]),
      parseInt(row["values[14]"]),
      parseInt(row["values[15]"]),
      parseInt(row["values[16]"]),
      parseInt(row["values[17]"])
    ];
    row.values = row.values.slice(0, row.channel_count);
    delete row["values[0]"];
    delete row["values[1]"];
    delete row["values[2]"];
    delete row["values[3]"];
    delete row["values[4]"];
    delete row["values[5]"];
    delete row["values[6]"];
    delete row["values[7]"];
    delete row["values[8]"];
    delete row["values[9]"];
    delete row["values[10]"];
    delete row["values[11]"];
    delete row["values[12]"];
    delete row["values[13]"];
    delete row["values[14]"];
    delete row["values[15]"];
    delete row["values[16]"];
    delete row["values[17]"];
  },
  "actuator_outputs_0": (row, parse_timestamp) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/actuator_outputs.msg
    row.noutputs = parseInt(row.noutputs);
    row.output = [
      parseInt(row["output[0]"]),
      parseInt(row["output[1]"]),
      parseInt(row["output[2]"]),
      parseInt(row["output[3]"]),
      parseInt(row["output[4]"]),
      parseInt(row["output[5]"]),
      parseInt(row["output[6]"]),
      parseInt(row["output[7]"]),
      parseInt(row["output[8]"]),
      parseInt(row["output[9]"]),
      parseInt(row["output[10]"]),
      parseInt(row["output[11]"]),
      parseInt(row["output[12]"]),
      parseInt(row["output[13]"]),
      parseInt(row["output[14]"]),
      parseInt(row["output[15]"])
    ];
    delete row["output[0]"];
    delete row["output[1]"];
    delete row["output[2]"];
    delete row["output[3]"];
    delete row["output[4]"];
    delete row["output[5]"];
    delete row["output[6]"];
    delete row["output[7]"];
    delete row["output[8]"];
    delete row["output[9]"];
    delete row["output[10]"];
    delete row["output[11]"];
    delete row["output[12]"];
    delete row["output[13]"];
    delete row["output[14]"];
    delete row["output[15]"];
  },
  
  "vehicle_attitude_0": (row, parse_timestamp) => {
    // See https://github.com/PX4/Firmware/blob/master/msg/vehicle_attitude.msg
    row.q = new Quaternion([
      parseFloat(row["q[0]"]),
      parseFloat(row["q[1]"]),
      parseFloat(row["q[2]"]),
      parseFloat(row["q[3]"])
    ]);
    row.euler = row.q.toEuler();
    delete row["q[0]"];
    delete row["q[1]"];
    delete row["q[2]"];
    delete row["q[3]"];
    row.delta_q_reset = new Quaternion([
      parseFloat(row["delta_q_reset[0]"]),
      parseFloat(row["delta_q_reset[1]"]),
      parseFloat(row["delta_q_reset[2]"]),
      parseFloat(row["delta_q_reset[3]"])
    ]);
    delete row["delta_q_reset[0]"];
    delete row["delta_q_reset[1]"];
    delete row["delta_q_reset[2]"];
    delete row["delta_q_reset[3]"];
    row.quat_reset_counter = parseInt(row.quat_reset_counter);
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
        preprocessor(row, parse_timestamp, data);
      }
    });

    return data;
  }

  /**
   * Gets all messages.
   */
  async retreive_all() {
    let promises = Object.keys(message_preprocessors)
      .map((message_name) => {
        return {
          msg: message_name,
          promise: this.retreive_message(message_name)
        };
      });
    let result = {};
    for (let promise of promises) {
      result[promise.msg] = await promise.promise;
    }
    return result;
  }
};

