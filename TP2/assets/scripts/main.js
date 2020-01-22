/**
 * Main file allowing to draw both graphs. This file uses the other files that you have to fill.
 *
 * /!\ No modification is needed in this file!
 * /!\ IMPORTANT : DO NOT MODIFY THIS FILE
 */
(function(d3, localization) {
  "use strict";

  /***** Configuration *****/

  // Main graphic (focus)
  var marginFocus = {
    top: 10,
    right: 10,
    bottom: 100,
    left: 60
  };
  var widthFocus = 1200 - marginFocus.left - marginFocus.right;
  var heightFocus = 500 - marginFocus.top - marginFocus.bottom;

  // Secondary graphic allowing the choose the vizualisation scale (context)
  var marginContext = {
    top: 430,
    right: 10,
    bottom: 30,
    left: 60
  };
  var widthContext = widthFocus;
  var heightContext = 500 - marginContext.top - marginContext.bottom;

  /***** Scales *****/
  var xFocus = d3.scaleTime().range([0, widthFocus]);
  var yFocus = d3.scaleLinear().range([heightFocus, 0]);

  var xContext = d3.scaleTime().range([0, widthContext]);
  var yContext = d3.scaleLinear().range([heightContext, 0]);

  var xAxisFocus = d3.axisBottom(xFocus).tickFormat(localization.getFormattedDate);
  var yAxisFocus = d3.axisLeft(yFocus);

  var xAxisContext = d3.axisBottom(xContext).tickFormat(localization.getFormattedDate);

  /***** Creation of SVG elements *****/
  var svg = d3.select("body")
    .append("svg")
    .attr("width", widthFocus + marginFocus.left + marginFocus.right)
    .attr("height", heightFocus + marginFocus.top + marginFocus.bottom);

  // Group showing the main graphic (focus)
  var focus = svg.append("g")
    .attr("transform", "translate(" + marginFocus.left + "," + marginFocus.top + ")");

  // Group showing the secondaray graphic (context)
  var context = svg.append("g")
    .attr("transform", "translate(" + marginContext.left + "," + marginContext.top + ")");

  // Add a clip path
  svg.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", widthFocus)
    .attr("height", heightFocus);

  // Create the focus and context lines
  var lineFocus = createLine(xFocus, yFocus);
  var lineContext = createLine(xContext, yContext);

  // Allows to redraw the main graphic when the zoom/brush is modified
  var brush = d3.brushX()
    .extent([[0, 0], [widthContext, heightContext]])
    .on("brush", function () {
      brushUpdate(brush, focus, lineFocus, xFocus, xContext, xAxisFocus, yAxisFocus);
    });

  /***** Data loading *****/
  d3.csv("./data/2016.csv").then(function(data) {
    /***** Data preprocessing *****/
    // Scale allowing to map 10 values to 10 different colors
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    domainColor(color, data);
    parseDate(data);

    var sources = createSources(color, data);
    domainX(xFocus, xContext, data);
    domainY(yFocus, yContext, sources);

    /***** Creation of the focus graphic *****/
    createFocusLineChart(focus, sources, lineFocus, color);

    // Axes focus
    focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + heightFocus + ")")
      .call(xAxisFocus);

    focus.append("g")
      .attr("class", "y axis")
      .call(yAxisFocus);

    /***** Creation of the context graphic *****/
    createContextLineChart(context, sources, lineContext, color);

    // Context's axes
    context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + heightContext + ")")
      .call(xAxisContext);

    context.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", -6)
      .attr("height", heightContext + 7);

    /***** Creation of the legend *****/
    legend(svg, sources, color);
  });
})(d3, localization);
