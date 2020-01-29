"use strict";

/**
* File to handle zoom/brush
*/


/**
 * Permet de redessiner le graphique focus à partir de la zone sélectionnée dans le graphique contexte.
 * Allows to redraw the "focus" line chart based on the selected zome in the "conext" line chart
 *
 * @param brush     The selection zone in the context graphic
 * @param g         The SVG group in which the focus line chart is drawn
 * @param line      The function allowing to draw the lines of the graphic
 * @param xFocus    The X scale for the focus graphic
 * @param xContext  The X scale for the context graphic
 * @param xAxis     The X axis for the focus line chart
 * @param yAxis     The Y axis for the focus line chart
 *
 * @see http://bl.ocks.org/IPWright83/08ae9e22a41b7e64e090cae4aba79ef9       (en d3 v3)
 * @see https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172    ==> (en d3 v5) <==
 */
function brushUpdate(brush, g, line, xFocus, xContext, xAxis, yAxis) {
  // d3.event.selection: [xmin, xmax] of the seleciton
  let dates = d3.event.selection.map(xContext.invert, xContext);
  xFocus.domain(dates);
  g.selectAll(".line").attr("d", d => line(d.values));
  g.select(".x.axis").call(xAxis);
  
  // http://bl.ocks.org/AMDS/57e1daf9d5ef60b124d9
  // http://bl.ocks.org/Thanaporn-sk/4424853a81a4d00f822266f08aec6a98
  //line.select("path").attr("g", line);
  //g.call(d3.zoom().transform, d3.zoomIdentity.scale(0.3));
}
