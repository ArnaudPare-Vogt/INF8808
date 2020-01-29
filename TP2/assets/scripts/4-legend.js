"use strict";

/**
 * File used for generating the legend and controlling the interactions with it.
 */


/**
 * Create a legend from the given source.
 *
 * @param svg       SVG element to use in order to create the legend.
 * @param sources   Data sorted by street name and by date.
 * @param color     The 10-color scale to use.
 */
function legend(svg, sources, color) {
  var size = 20;
  let legend_entry = svg.append("g")
    .attr("transform", "translate(60, 10)")
    .selectAll(".legend-dots")
    .data(sources)
    .enter()
    .append("g")
    .attr("transform", (d, i) => "translate(" + 10 + "," + i*(size+5) + ")");
  legend_entry.append("rect")
    .classed(".legend-dots", true)
    .attr("x", 0)
    .attr("y", -size / 2)
    .attr("width", size)
    .attr("height", size)
    .style("fill", d => color(d.name))
    .attr("stroke", "black")
    .on("click", (d, i, g) => displayLine(g[i], color(d.name), d.name));
  legend_entry.append("text")
    .attr("x", size + 2) // 2 pixels pour le padding
    .attr("y", 0)
    .attr("dominant-baseline", "middle")
    .text(d => d.name);
}

/**
 * Allows for show/hide whether the line that corresponding to the clicked square.
 *
 * By clicking on a square, we display/hide the corresponding line and the square's interior becomes white/goes back to its original color.
 *
 * @param element   The square that was clicked
 * @param color     The 10-color scale
 */
function displayLine(element, color, name) {
  // TODO: Complete the code to show or hide a line depending on the selected item
  let isVisible = d3.select(element).style("fill") != "white";
  d3.select(element).style("fill", isVisible ? "white" : color);
  d3.select('[data-legend="' + name + '"]').style("visibility", isVisible ? "hidden" : "visible");
}
