/** This file handles tabs */
function tab_change(event, id) {
  // Show out tab
  d3.selectAll(".tabcontent")
    .classed("tabselected", false);
  d3.select(`#${id}`)
    .classed("tabselected", true);
  // Select our button
  d3.selectAll(".tablink")
    .classed("tabselected", false);
  d3.select(event.currentTarget)
    .classed("tabselected", true);
}