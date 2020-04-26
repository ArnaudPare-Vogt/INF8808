/** Event handlers for tab changes */
const ON_TAB_FIRST_OPEN = {};

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
  
  if (ON_TAB_FIRST_OPEN[id]) {
    ON_TAB_FIRST_OPEN[id]();
    ON_TAB_FIRST_OPEN[id] = undefined;
  }
}

document.addEventListener("DOMContentLoaded", function(e) {
  tab_change({
    currentTarget: d3.select(".tablink.tabselected").node()
  }, d3.select(".tabcontent.tabselected").attr("id"));
});