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
  /* TODO: Update the domains according to the following specifications:
       - The domain in X varies between the minimum and the maximum of votes obtained by the candidates of the district;
       - The domain in Y correspongs to the name of the political parties associated to the winning candidates. Make sure the parties
         are sorted in decreasing order of votes obtained (i.e. the winner's party should be first)
   */
}

/**
 * Update the textual information in the information panel based on the new data
 *
 * @param panel             The D3 element corresponding to the information panel.
 * @param districtSource    The data associated to a district.
 * @param formatNumber      Function to correctly format numbers. 
 */
function updatePanelInfo(panel, districtSource, formatNumber) {
  /* TODO: Update the following textual information: 
       - The name and number of the district;
       - The name of the winning candidate and his or her party;
       - The total number of votes for all candidates (use the function "formatNumber" to format the number).
   */

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
     /* TODO: Create or update the graphic according to the following specifications:
       - The number of votes of the candidates must be shown in decreasing order
       - The percentage of votes received by each candidate must be shown to the right of the bar
       - The color of the bar must correspond to the candidate's party. If the party of the candidate is not
         in the domain of the color scale, the bar should be colored in grey
      - The name of the parties must be shown in shortened format. It is possible to obtain the shortened format of a party
        with the list "parties" passed as a parameter. Note that if the party is not in the list "parties", you must 
        write "Autre" as the shortened format. 
   */

}

/**
 * Reinitialize the map display when the information panel is closed. 
 *
 * @param g     The group in which the traces for the circumsciptions is created. 
 */
function reset(g) {
  // TODO: Reinitialize the map's display by removing the "selected" class from all elements

}
