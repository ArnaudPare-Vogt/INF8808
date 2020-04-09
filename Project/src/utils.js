function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}





/**
 * This function takes in two points specified in terms of latitude and longitudes, and
 * returns the E and N components of the distance between them in the ENU coordinate system.
 * See: https://en.wikipedia.org/wiki/Local_tangent_plane_coordinates
 * 
 *          (2)
 *           *
 *           ^
 *  (1)      | (N)
 *   *------>+
 *       (E)
 * 
 * @param {number} lat_1 The latitude of point 1
 * @param {number} lat_2 The latitude of point 2
 * @param {number} lon_1 The longitude of point 1
 * @param {number} lon_2 The longitude of point 2
 */
function lat_lon_distance_to_meters(lat_1, lat_2, lon_1, lon_2) {
  // See https://gis.stackexchange.com/questions/203224/longitude-difference-to-meters
  const EARTH_RADIUS = 6378137.0;
  let north = 111.19 * (lat_2 - lat_1);
  let east = EARTH_RADIUS * Math.cos(lat_1) * (lon_2 - lon_1);
  return [east, north];
}