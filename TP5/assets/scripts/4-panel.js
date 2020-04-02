"use strict";

/**
 * File to deal with the display of the information panel for a district
 */


/**
 * Update the X and Y domains used by the horizontal bar chart when the data is modified. 
 *
 * @param districtSource    The data associated to a district
 * @param x                 The X scale
 * @param y                 The Y scale
 */
function updateDomains(districtSource, x, y) {
  y.domain(districtSource.results.map(r => r.party));
  x.domain([0, d3.max(districtSource.results, r => r.votes)]);
}

/**
 * Update the textual information in the information panel based on the new data
 *
 * @param panel             The D3 element corresponding to the information panel.
 * @param districtSource    The data associated to a district.
 * @param formatNumber      Function to correctly format numbers. 
 */
function updatePanelInfo(panel, districtSource, formatNumber) {
  panel.select("#district-name").text(districtSource.name + " [" + districtSource.id + "]");
  panel.select("#elected-candidate").text(districtSource.results[0].candidate + " (" + districtSource.results[0].party + ")");
  panel.select("#votes-count").text(formatNumber(d3.sum(districtSource.results, r => r.votes)) + " votes");
}

/**
 * Met à jour le diagramme à bandes horizontales à partir des nouvelles données de la circonscription sélectionnée.
 * Updates the horizontal bar chart based on the new data from the selected district. 
 *
 * @param gBars             The group where the bars should be created. 
 * @param gAxis             The group where the Y axis of the graph should be created. 
 * @param districtSource    The data associated to a riding. 
 * @param x                 The X scale. 
 * @param y                 The Y scale. 
 * @param yAxis             The Y axis. 
 * @param color             The color scale associated to each political party. 
 * @param parties           The information to use on the different parties. 
 *
 * @see https://bl.ocks.org/hrecht/f84012ee860cb4da66331f18d588eee3
 */
function updatePanelBarChart(gBars, gAxis, districtSource, x, y, yAxis, color, parties) {
  function setBarParams(selection) {
    return selection
      .attr("y", (d) => y(d.party))
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", (d) => x(d.votes))
      .attr("fill", (d) => color(d.party));
  }
  function setTextParams(selection) {
    return selection
      .attr("y", (d) => y(d.party) + y.bandwidth() / 2)
      .attr("x", (d) => x(d.votes))
      .text((d) => d.percent);
  }
  function getPartyAbbrev(name) {
    if (name.startsWith("Indépendant")) {
      name = "Indépendant";
    }
    return (parties.find((r) => r.name == name) || {abbreviation: "Autre"}).abbreviation;
  }
  
  gAxis.call(yAxis);
  gAxis.selectAll("text")
    .text(getPartyAbbrev);

  let barsData = gBars.selectAll("g.bar")
    .data(districtSource.results);
  let barsEnter = barsData.enter()
    .append("g")
    .classed("bar", true);
  
  barsEnter.append("rect").call(setBarParams);
  barsEnter.append("text")
    .classed("label", true)
    .call(setTextParams);

  barsData.select("rect").call(setBarParams);
  barsData.select("text").call(setTextParams);
  
  barsData.exit().remove();
}

/**
 * Reinitialize the map display when the information panel is closed. 
 *
 * @param g     The group in which the traces for the circumsciptions is created. 
 */
function reset(g) {
  g.selectAll(".selected").classed("selected", false);
}
