"use strict";

/**
 * File preprocessing the data from the CSV file.
 */


/**
 * 
 * Specifies the color domain for each BIXI station.
 *
 * @param color   Color scale.
 * @param data    Data from JSON file.
 */
function domainColor(color, data) {
  color
    .domain(data)
}
/**
 * Specifies the scale for the X axis of the bar chart.
 *
 * @param x       X scale to use.
 * @param data    Data from JSON file.
 */
function domainX(x, data) {
  // TODO: Specify the domain for variable "x" by associating only the used BIXI stations.
  x.domain(data.map(d => d.name));
}

/**
 * Specifies the Y axis for the bar chart.
 *
 * @param y             Y scale.
 * @param currentData   Data currently used by the bar chart.
 */
function domainY(y, currentData) {
  // TODO: Specifies the domain for the "y" axis by taking the minimum and maximum values as the number of trips to a BIXI station.
  y.domain(d3.extent(currentData.destinations, d => d.count))
}

/**
 * Returns an adjacency matrix from the data in order to create the cord diagram.
 *
 * @param data        Data frlom JSON file.
 * @return {Array}    A 10x10 matrix indicating the number of trips from a station to another.
 */
function getMatrix(data) {
  // M[i][j] : trips from station i to station j
  return data.map((d) => {
    return d.destinations.map(destination => destination.count);
  });
}

/**
 * Get the total number of trips during August 2015.
 *
 * @param data    Data from JSON file.
 */
function getTotal(data) {
  let adder = (val, accumulator) => val + accumulator;
  return getMatrix(data).map(r => r.reduce(adder)).reduce(adder);
}
