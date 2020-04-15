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
  let north = 111190 * (lat_2 - lat_1);
  let east = EARTH_RADIUS * Math.cos(lat_1 * Math.PI / 180) * (lon_2 - lon_1) * Math.PI / 180;
  return [east, north];
}





// From a later version of d3-array
// https://github.com/d3/d3-array/blob/master/src/minIndex.js
Array.prototype.min_index = function(valueof) {
  let values = this;
  let min;
  let minIndex = -1;
  let index = -1;
  if (valueof === undefined) {
    for (const value of values) {
      ++index;
      if (value != null
          && (min > value || (min === undefined && value >= value))) {
        min = value, minIndex = index;
      }
    }
  } else {
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (min > value || (min === undefined && value >= value))) {
        min = value, minIndex = index;
      }
    }
  }
  return minIndex;
}





// From a later version of d3-array
// https://github.com/d3/d3-array/blob/master/src/maxIndex.js
Array.prototype.max_index = function(valueof) {
  let values = this;
  let max;
  let maxIndex = -1;
  let index = -1;
  if (valueof === undefined) {
    for (const value of values) {
      ++index;
      if (value != null
          && (max < value || (max === undefined && value >= value))) {
        max = value, maxIndex = index;
      }
    }
  } else {
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (max < value || (max === undefined && value >= value))) {
        max = value, maxIndex = index;
      }
    }
  }
  return maxIndex;
}





/**
 * The range function from python, implemented in javascript.
 * This allows easy creation of arrays. For example, the following
 * creates an array of capital letters for the alphabet:
 * ```range(26).map(i => 'A' + i)```
 * @param {number} max the (exclusive) last index of the range
 */
function range(max) {
  return [...Array(max).keys()];
}