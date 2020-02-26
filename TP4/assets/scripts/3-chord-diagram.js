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
  /* TODO:
     - Créer les groupes du diagramme qui sont associés aux stations de BIXI fournies.
     - Utiliser un "textPath" pour que les nom de stations suivent la forme des groupes.
     - Tronquer les noms des stations de BIXI qui sont trop longs (Pontiac et Métro Mont-Royal).
     - Afficher un élément "title" lorsqu'un groupe est survolé par la souris.
  */
  let id_generator = d => "group_no" + d.index;

  let group = g.selectAll("g.group")
    .data(layout.groups)
    .enter()
    .append("g")
    .classed("group", true);

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

  group.append("text")
    .attr("dy", (+arc.outerRadius()() - +arc.innerRadius()()) / 2 + 5)
    .attr("x", 5)
    .append("textPath")
    .attr("href", d => "#" + id_generator(d))
    .text(d => data[d.index].name);

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
  /* TODO:
     - Créer les cordes du diagramme avec une opacité de 80%.
     - Create the diagram's chords with an 80% opacity.
     - Create the diagram's chords with an 80% opacity.
     - Show a "title" element when a chord is hovered by the user's mouse.
  */
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
  g.selectAll("path.chord")
    .data(layout)
    .enter()
    .append("path")
      .classed("chord", true)
      .attr("fill", (d) => computeColor(d))
      .attr("opacity", "80%")
      .attr("d", path);

}

/**
 * initializes the logic when a chord from the chord diagram is hovered.
 *
 * @param g     The SVG group in which the bar chart is drawn.
 */
function initializeGroupsHovered(g) {
  /* TODO:
     - When a group is hovered, show the incoming and outgoing chords for this groups with an 80% opacity. 
       The other chords have to drawn with an 10% opacity.
     - Reset the default style for the diagram when the user mouse's leaves the diagram's group.
  */

}
