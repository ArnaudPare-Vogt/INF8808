"use strict";

/**
 * File allowing to define the text to be shown in the tooltip.
 */


/**
 * Retrieves the text associated with the tooltip.
 *
 * @param d               Data associated to the currently hovered circle.
 * @param formatNumber    Function that allows you to correctly format numbers.
 * @return {string}       The text to show in the tooltip.
 */
function getToolTipText(d, formatNumber) {
  // TODO: Return the text to show in the tooltip, in the required format.
  //       Make sure you use the function "formatNumber" to correctly format the numbers.
  return "Country : <b>" + d.name + "</b><br>"
    + "Life expectancy: <b>" + formatNumber(d.lifeExpectancy) + "</b> years<br>"
    + "Income: <b>" + formatNumber(d.income) + "</b> USD<br>"
    + "Population: <b>" + formatNumber(d.population) + " inhabitants</b><br>"
    + "World region: <b>" + d.zone + "</b>";
}
