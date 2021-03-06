"use strict";

/**
 * File to draw the "focus" and "context" line charts.
 */


/**

 * Creates an SVG line using the specified X and Y domains
 * This function is used by the "focus" and "context" line charts
 *
 * @param x               X domain
 * @param y               Y domain
 * @return d3.svg.line    SVG line
 *
 * @see https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89      (see line generator)
 */
function createLine(x, y) {
  // TODO: Return an SVG line (see "d3.line"). For the curve option, use a curveBasisOpen.
  return d3.line()
  .x(function(d) {
    return x(d.date);
  })
  .y(function (d) {
    return y(d.count);
  })
  .curve(d3.curveBasisOpen);
}

/**
 * Creates the "focus" line chart
 *
 * @param g         The SVG group where you draw the graphic. 
 * @param sources   The data to use. 
 * @param line      The function to draw the lines of the graphic. 
 * @param color     Color scale with street names associated to colors
 */
function createFocusLineChart(g, sources, line, color) {

  // TODO: Draw the "focus" line chart in the "g" group
  // For each "path" you draw, specify this attribute : .attr("clip-path", "url(#clip)").
  // console.log(sources);

  let paths = g.selectAll("path").data(sources);
  paths.enter()
    .append("path")
    .attr("d", d => line(d.values))
    .attr("clip-path", "url(#clip)")
    .attr("data-legend", d => d.name)
    .classed("line", true)
    .style("stroke", d => color(d.name));
}

/**
 * Creates the "context" line chart
 *
 * @param g         The SVG group where you draw the graphic. 
 * @param sources   The data to use. 
 * @param line      The function to draw the lines of the graphic. 
 * @param color     Color scale with street names associated to colors
 */
function createContextLineChart(g, sources, line, color) {
  let paths = g.selectAll("path").data(sources);
  paths.enter()
    .append("path")
    .attr("d", d => line(d.values))
    .attr("data-legend", d => d.name)
    .classed("line", true)
    .style("stroke", d => color(d.name));
}
