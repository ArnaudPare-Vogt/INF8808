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
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);
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
  let total = currentData.destinations.reduce((currentTotal, val) => currentTotal + val.count, 0 );
  return d.count + " " + "(" + formatPercent(d.count/total) + ")";
}
