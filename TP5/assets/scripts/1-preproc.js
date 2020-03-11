"use strict";

/**
 * File to process data from the CSV. 
 */


/**
 * Specifies the domain and the range of colors for the scale to distinguish the political parties. 
 *
 * @param color     Color scale.
 * @param parties   The information to use for the different parties. 
 */
function colorScale(color, parties) {
  color
    .domain(parties.map(party => party.name))
    .range(parties.map(party => party.color));
}

/**
 * Converts each of the number from the CSV file to type "number"
 * @param data      Data from the CSV. 
 */
function convertNumbers(data) {
  data.map(row => {
    row.id = parseInt(row.id);
    row.votes = parseInt(row.votes);
  });
}

/**
 * Reorganizes the data to combine the results for a given district 
 *
 * @param data      Data from the CSV. 
 * @return {Array}  The reorganized data to usee. The return element must be a table of objects with 338 entries, meaning
 *                  one entry per riding. Each entry must present the results for each candidate in decreasing order (from
 *                  the candidate with the most votes to the one with the least votes). The returned object must look like: 
 *
 *                  [
 *                    {
 *                      id: number              // The number of the district 
 *                      name: string,           // The number of the district 
 *                      results: [              // the table with the results for the candidates
 *                                              // *** This table must be sorted in decreasing order of votes. ***
 *                        {
 *                          candidate: string,  // The name of the candidate
 *                          votes: number,      // The number of votes for the candidate
 *                          percent: string,    // The percentage of votes for the candidate
 *                          party: string       // The political party of the candidate
 *                        },
 *                        ...
 *                      ]
 *                    },
 *                    ...
 *                  ]
 */
function createSources(data) {
  // TODO: Return the object with the format described above. Make sure to sort the table "results" for each entry 
  // in decreasing order of the votes (the winning candidate must be the first element of the table)
  let get_result_from_row = (row) => {
    return {
      candidate: row.candidate,
      votes: row.votes,
      percent: row.percent,
      party: row.party
    };
  };

  return data.reduce((result, row) => {
    let element = result.find(result_row => result_row.id === row.id);
    if (element) {
      element.results.push(get_result_from_row(row));
      element.results.sort((a, b) => a.votes < b.votes);
    }
    else {
      result.push({
        id: row.id,
        name: row.name,
        results: [get_result_from_row(row)]
      });
    }
    return result;
  }, []);
}
