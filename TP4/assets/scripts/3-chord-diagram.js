"use strict";

/**
 * File allowing to draw the chord diagram.
 */


/**
 * Creates the groups for the chord diagram.
 *
 * @param g               The SVG group in which the bar chart has to be drawn.
 * @param data            Data from JSON file.
 * @param layout          The layout used by the chord diagram.
 * @param arc             Function that draws acrcs.
 * @param color           The color scale that associates a distinct color to a BIXI station.
 * @param total           The total number of trips made for the month of August 2015.
 * @param formatPercent   Function allowing to correctly format a percentage from a number.
 *
 * @see https://bl.ocks.org/mbostock/4062006
 */
function createGroups(g, data, layout, arc, color, total, formatPercent) {
  let id_generator = d => "group_no" + d.index;

  let group = g.selectAll("g.group")
    .data(layout.groups)
    .enter()
    .append("g")
    .classed("group", true)
    .attr("id", (d, i) => "chord-group" + i);

  group.append("path")
    .attr("fill", (d, i) => color(data[i].name))
    .attr("d", arc)
    .each(function(d,i) {
      // Get the outer arc only
      var firstArcSection = /(^.+?)L/;

      //The [1] gives back the expression between the () (thus not the L as well)
      //which is exactly the arc statement
      var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];

      //Create a new invisible arc that the text can flow along
      d3.select(this)
        .append("path")
        .attr("id", id_generator)
        .attr("d", newArc)
        .style("fill", "none");
    });
  
  // Cuts the text manually so that the displayed text fits in the area to render
  let cutText = (text) => {
    if (text == "Pontiac / Gilford") {
      return "Pontiac"
    }
    if (text == "Métro Mont-Royal (Rivard/Mont-Royal)") {
      return "Métro Mont-Royal";
    }
    return text;
  }

  group.append("text")
    .attr("dy", (+arc.outerRadius()() - +arc.innerRadius()()) / 2 + 5)
    .attr("x", 5)
    .append("textPath")
    .attr("href", d => "#" + id_generator(d))
    .text(d => cutText(data[d.index].name));

  let calculateTotalTripPercentage = (d) => {
    let trips = d.destinations.reduce((currentTotal, val) => currentTotal + val.count, 0 );
    return trips / total;
  } 

  group.append("title")
    .text((d, i) => data[i].name + ": " + formatPercent(calculateTotalTripPercentage(data[i])) + " of trips");
}

/**
 * Creates the chords for the chord diagram.
 *
 * @param g               The SVG group in which the bar chart has to be drawn.
 * @param data            Data from JSON file.
 * @param layout          The layout used by the chord diagram.
 * @param path            Function that draws acrcs.
 * @param color           The color scale that associates a distinct color to a BIXI station.
 * @param total           The total number of trips made for the month of August 2015.
 * @param formatPercent   Function allowing to correctly format a percentage from a number.
 *
 * @see https://beta.observablehq.com/@mbostock/d3-chord-dependency-diagram
 */
function createChords(g, data, layout, path, color, total, formatPercent) {
  // Computes the color of the station with the most depertures
  let computeColor = (d) => {
    let sourceDepartures = data[d.source.index].destinations[d.target.index].count;
    let targetDepartures = data[d.target.index].destinations[d.source.index].count;
    if (sourceDepartures > targetDepartures) {
      return color(data[d.source.index].name);
    }
    else {
      return color(data[d.target.index].name);
    }
  };

  // Computes the tooltip for a specific chord
  let computeTooltip = (d) => {
    return data[d.source.index].name
      + " \u2192 " 
      + data[d.target.index].name 
      + ": " 
      + formatPercent(data[d.source.index].destinations[d.target.index].count / total)
      + "\n"
      + data[d.target.index].name
      + " \u2192 " 
      + data[d.source.index].name 
      + ": " 
      + formatPercent(data[d.target.index].destinations[d.source.index].count / total);
  };

  g.selectAll("path.chord")
    .data(layout)
    .enter()
    .append("path")
      .each(function(d) { this.classList.add("chord-group" + d.target.index); this.classList.add("chord-group" + d.source.index); })
      .classed("chord", true)
      .attr("fill", computeColor)
      .attr("d", path)
      .append("title")
      .text(computeTooltip);

}

/**
 * initializes the logic when a chord from the chord diagram is hovered.
 *
 * @param g     The SVG group in which the bar chart is drawn.
 */
function initializeGroupsHovered(g) {
  g.selectAll("g.group")
    .on("mouseover", function() {
      g.selectAll(".chord")
        .classed("fade", true);
      g.selectAll(".chord." + this.id)
        .classed("fade", false);
    });
}
