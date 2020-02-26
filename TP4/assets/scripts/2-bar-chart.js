"use strict";

/**
 * File allowing the create the bar chart.
 */


/**
 * Creates the axis for the bar chart.
 *
 * @param g       The SVG group in which the bar chart has to be drawn.
 * @param yAxis   Y axis.
 * @param height  Height of the graphic.
 */
function createAxes(g, xAxis, yAxis, height) {
  // TODO: Draw the X and Y axis of the graphic. 
  //       Make sure you put a title for the Y axis.
  g.append("g")
    .classed("x", true)
    .classed("axis", true)
    .attr("transform", "translate(0, " + height + ")")
    .call(xAxis);
  g.append("g")
    .classed("y", true)
    .classed("axis", true)
    .call(yAxis)
    .append("text")
    .text("Number of trips")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "ideographic")
    .attr("font-size", 14)
    .attr("x", 0)
    .attr("y", 0)
    .attr("fill", "currentColor");
}

/**
 * Bar chart.
 *
 * @param g             The SVG group in which the bar chart has to be drawn.
 * @param currentData   Data to use.
 * @param x             Scale to use for the X axis.
 * @param y             Scale to use for the Y axis.
 * @param color         Color scale associating a color to a BIXI station name.
 * @param tip           Tooltip to show when a bar has been hovered.
 * @param height        Height of the graphic.
 */
function createBarChart(g, currentData, x, y, color, tip, height) {
  // TODO: Draw the bars for the bar charts using the specified scales.
  //       Make sure you show a tooltip when a bar in the bar chart is hovered.
  g.append('g')
    .selectAll('bar')
    .data(currentData.destinations)
    .enter()
    .append('rect')
    .classed('bar', true)
    .attr('fill', (s) => color(s.name))
    .attr('x', (s) => x(s.name))
    .attr('y', (s) => y(s.count))
    .attr('height', (s) => height - y(s.count))
    .attr('width', x.bandwidth())
}

/**
 * Completes a transition from the currently used data to the new data to be shown.
 *
 * @param g         The SVG group in which the bar chart has to be drawn.
 * @param newData   The new data to use.
 * @param y         Scale for the Y axis.
 * @param yAxis     Y axis.
 * @param height    Height of the graphic.
 */
function transition(g, newData, y, yAxis, height) {
  /* TODO:
   - Complete a transition to update the Y axis and the height of the bar chart, taking into account the new data.
   - The transition has to complete in 1 second.
   */

  var bars = g.selectAll('.bar')
    .data(newData.destinations)

  // If new data gets added
  bars.enter().append('rect')
    .classed('bar', true)
    .attr('fill', (s) => color(s.name));

  // If bars get deleted, remove them smoothly
  bars.exit().transition().duration(1000).attr('height', 0).remove();

  // Update data
  bars
    .transition()
    .duration(1000)
    .attr('y', (s) => y(s.count))
    .attr('height', (s) => height - y(s.count))
}

/**
 * Returns the appropriate text for the tooltip.
 *
 * @param d               Data associated to the currently hovered bar.
 * @param currentData     Data currently used.
 * @param formatPercent   Function allowing to correctly format a percentage.
 * @return {string}       Tooltip's text to be shown.
 */
function getToolTipText(d, currentData, formatPercent) {
  // TODO: Return the text in the tooltip, correctly formatted as specified.
  //       Make sure you use the function "formatPercent" to correctly format the percentage.

  return "";
}
