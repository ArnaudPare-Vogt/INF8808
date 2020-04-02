"use strict";

/**
 * File to generate the display of the map. 
 */


/**
 * Initializes the background of the map that must be used and the position of the initial display. 
 *
 * @param L     The Leaflet context.
 * @param map   The Leaflet map.
 *
 * @see https://gist.github.com/d3noob/9211665
 */
function initTileLayer(L, map) {
  map.setView([57.3, -94.7], 4);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Contributors',
    minZoom: 1,
    maxZoom: 10,
  }).addTo(map);
}

/**
 * Initializes the SVG context to be used on top of the Leaflet map. 
 *
 * @param map   The Leaflet map. 
 * @return      the created SVG element. 
 *
 * @see https://gist.github.com/d3noob/9211665
 */
function initSvgLayer(map) {
  let svg = d3.select(map.getPanes().overlayPane).append("svg");
  svg.append("g").attr("class", "leaflet-zoom-hide");
  return svg;
}

/**
 * Creates the traces for the districts on the SVF context aboove the Leaflet map. 
 *
 * @param g             The group where you should create the traces for the districts. 
 * @param path          The function used to trace the geometric entities according to the appropriate projection
 * @param canada        The geographic entities used to trace the districts. 
 * @param sources       The data containing the information on each district. 
 * @param color         The color scale mapping to each party. 
 * @param showPanel     The function called to display the panel. 
 */
function createDistricts(g, path, canada, sources, color, showPanel) {
  g.selectAll("path")
    .data(canada.features)
    .enter()
    .append("path")
    .each(function (d) { this.classList.add("district_no_" + d.properties.NUMCF); })
    .attr("opacity", "80%")
    .attr("fill", (d) => {
      let district = sources.find((row) => row.id === d.properties.NUMCF);
      return color(district.results[0].party);
    })
    .attr("stroke", "#333")
    .attr("stroke-width", "0.5")
    .on("click", (d) => selectDistrict(g, d.properties.NUMCF, showPanel));

}

/**
 * Selects a district from a districtId, also unselects all other districts. Will also call the showPanel method with the districtId.
 */
function selectDistrict(g, districtId, showPanel) {
  g.selectAll("path.selected").classed("selected", false);
  g.selectAll(".district_no_" + districtId).classed("selected", true);
  showPanel(districtId);
}

/**
 * Upate the position and the size of the SVG element, the position of the group "g" and the display of the traces
 * when the position or the zoom of the map is modified. 
 *
 * @param svg       The SVG element used to trace the elements over the Leaflet map. 
 * @param g         The group where the traces of the districts are created. 
 * @param path      The function that should be used to trace the geometric entities according to 
 *                  the correct projection. 
 * @param canada    The geographic entities that should be used to trace the districts. 
 *
 * @see https://gist.github.com/d3noob/9211665
 */
function updateMap(svg, g, path, canada) {
  let bounds = path.bounds(canada);
  let topLeft = bounds[0];
	let bottomRight = bounds[1];

	svg.attr("width", bottomRight[0] - topLeft[0])
			.attr("height", bottomRight[1] - topLeft[1])
			.style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px");

  g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
  g.selectAll("path").attr("d", path);
}
