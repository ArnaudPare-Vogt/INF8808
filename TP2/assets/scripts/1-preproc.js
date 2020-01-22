  "use strict";

/**
 * File to process CSV data. 
 */


/**
 * Specifies the domain  by associating a street name to a specific color. 
 *
 * @param color   10 color scale
 * @param data    CSV data
 */
function domainColor(color, data) {
  color.domain(data.columns.slice(1, 0));
}

/**
 * Converts dates in the CSV file to Date objects. 
 *
 * @param data    CSV data
 * @see https://www.w3schools.com/jsref/jsref_obj_date.asp
 */
function parseDate(data) {
  for(var i = 0; i< data.length; i++) {
    data[i].Date = d3.timeParse("%d/%m/%y")(data[i].Date)
  }
}

/**
 * Sorts data by street name and then by date
 * 
 * @param color     10 color scale (its domain contains the street names)
 * @param data      Data from CSV file
 *
 * @return Array    The sorted data which will be used to generate the graphic. 
 *                  The returned element should be a table with 10 entries, one of each street and one for the average. 
  *                 It should be of the following form: 
 *
 *                  [
 *                    {
 *                      name: string      // Street name
 *                      values: [         // A table with 365 entries, one for each day
 *                        date: Date,     // The date
 *                        count: number   // The quantity of bikes on that day (convert it with parseInt)
 *                      ]
 *                    },
 *                     ...
 *                  ]
 */
function createSources(color, data) {
  var streetEntries = [];
  var dataCols = data.columns;

  for(var i=0; i< data.length; i++) {
    for(var j=1; j<dataCols.length; j++) { // [0] = Date
      if(!streetEntries[j-1]){
        streetEntries[j-1] = {
          name: dataCols[j],
          values: []
        };
      }

      streetEntries[j-1].values.push({date: data[i][dataCols[0]], count: data[i][dataCols[j]]});
    }
  }

  return streetEntries;
}

/**
 * Specifies the domain of the scales used for the "focus" and "context" line charts for the X axis
 *
 * @param xFocus      X scale used for the "focus" line chart
 * @param xContext    X scale used for the "context" line chart
 * @param data        Data from the CSV file
 */
function domainX(xFocus, xContext, data) {
  xFocus.domain(d3.extent(data, function(element) { return element.Date; }));
  xContext.domain(d3.extent(data, function(element) { return element.Date; }));
}

/**
 * Specifies the domain of the scales used for the "focus" and "context" line charts for the X axis
 *
 * @param yFocus      Y scale used for the "focus" line chart
 * @param yContext    Y scale used for the "context" line chart
 * @param sources     Data sorted by street and date (see function "createSources").
 */
function domainY(yFocus, yContext, sources) {
  var max = d3.max(sources, function(station) {
    return d3.max(station.values, function(elem) {
      return +elem.count;
    });
  })
  yFocus.domain([0, max])
  yContext.domain([0, max])
}
