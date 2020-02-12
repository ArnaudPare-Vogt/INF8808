"use strict";

/**
 * File that generates a search result's display.
 */


/**
 * 
 * Allows the highlight the country that was selected via the search bar.
 *
 * @param countrySelected     Name of the selected country.
 * @param g                   The SVG group in which the bubble chart will be drawn.
 */
var selectedElem;
function search(countrySelected, g) {
  g.selectAll("circle").attr("opacity", 0.15)
  g.select("#" + CSS.escape(btoa(countrySelected)))
  .attr("fill", "#000000")
  .attr("opacity", 1.0)
}

/**
 * Resets the display to its default state.
 *
 * @param g   The SVG group in which the bubble chart will be drawn.
 * @param color The function to get the color for a specified zone
 */
function reset(g, color) {
  g.selectAll("circle")
  .attr("opacity", 1.0)
  .attr("fill", (d) => color(d.zone))
}
