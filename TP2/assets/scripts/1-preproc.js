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
  // TODO: Define the domain of variable "color" by associating a street name to a specific color

}

/**
 * Converts dates in the CSV file to Date objects. 
 *
 * @param data    CSV data
 * @see https://www.w3schools.com/jsref/jsref_obj_date.asp
 */
function parseDate(data) {
  // TODO: Convert the dates from the CSV file to date objects
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
  // TODO: Return the object with the given format

}

/**
 * Specifies the domain of the scales used for the "focus" and "context" line charts for the X axis
 *
 * @param xFocus      X scale used for the "focus" line chart
 * @param xContext    X scale used for the "context" line chart
 * @param data        Data from the CSV file
 */
function domainX(xFocus, xContext, data) {
  // TODO: specify the domains for the "xFocus" and "xContext" variables for the X axis

}

/**
 * Specifies the domain of the scales used for the "focus" and "context" line charts for the X axis
 *
 * @param yFocus      Y scale used for the "focus" line chart
 * @param yContext    Y scale used for the "context" line chart
 * @param sources     Data sorted by street and date (see function "createSources").
 */
function domainY(yFocus, yContext, sources) {
  // TODO: specify the domains for the "xFocus" and "xContext" variables for the Y axis

}
