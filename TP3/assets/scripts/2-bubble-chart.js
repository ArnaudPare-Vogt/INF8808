"use strict";
// test 2
/**
 * File used to draw the bubble chart.
 */


/**
 * Creates the bubble graph axis.
 *
 * @param g       The SVG group in which the bubble chart will be drawn.
 * @param xAxis   The X axis. 
 * @param yAxis   The Y axis.
 * @param height  The graphic's height.
 * @param width   The graphic's width.
 */
function createAxes(g, xAxis, yAxis, height, width) {
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .classed("x", true)
    .classed("axis", true)
    .call(xAxis)
    .append("text")
    .attr("x", width)
    .attr("y", 0)
    .attr("fill", "currentColor")
    .classed("label", true)
    .text("Life expectancy (years)");

  g.append("g")
    .classed("y", true)
    .classed("axis", true)
    .call(yAxis)
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("fill", "currentColor")
    .attr("transform", "rotate(-90)")
    .classed("label", true)
    .text("Income (USD)");
}

/**
 * Crée le graphique à bulles.
 *
 * @param g       The SVG group in which the bubble chart will be drawn.
 * @param data    Data to use.
 * @param x       Scale for the X axis.
 * @param y       Scale for the Y axis.
 * @param r       Scale for the circles' radiuses.
 * @param color   Scale for the circles' color.
 * @param tip     Tooltip to show when a circle is hovered.
 */
function createBubbleChart(g, data, x, y, r, color, tip) {
  // TODO: Draw the graph's circles by using the specified scales.
  //       Make sure you add the tooltip when a circle is hovered.
  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.lifeExpectancy))
    .attr("cy", (d) => y(d.income))
    .attr("r", (d) => r(d.population))
    .attr("fill", (d) => color(d.zone))
    .on("mouseover", tip.show)
    .on("mouseleave", tip.hide);
}
