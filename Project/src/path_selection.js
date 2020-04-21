/**
 * This class implements the path seleciton mechanism. It allows one to subscribe
 * to the datum selection and to subscribe to the change in the selection range.
 * Datum selection: Seleciton on a single timestamp
 * Seleciton range: Selection on a range of timestamp (min, max)
 */
class Selection {
  constructor(all_messages) {
    this._messages = all_messages;
    this._currently_selected_datum = new rxjs.BehaviorSubject(undefined);
    this._currently_selected_range = new rxjs.BehaviorSubject(undefined);
  }

  subscribe_to_selected_datum(message_names, subscriber) {
    this._currently_selected_datum.pipe(
      rxjs.operators.map((timestamp) => {
        if (!timestamp) return undefined;
        return message_names.map((message_name) => {
          // TODO: Optimize this shit
          let data = this._messages[message_name];
          let datum = data[
            data.min_index((d) => Math.abs(d.timestamp - timestamp))
          ];
          return datum;
        });
      }))
      .subscribe(subscriber);
  }

  next_selected_datum(timestamp) {
    this._currently_selected_datum.next(timestamp);
  }

  get_selected_datum(message_names) {
    let current_tiestamp = this._currently_selected_datum.getValue();
    if (!current_tiestamp) { return undefined; }
    return message_names.map((message_name) => {
      // TODO: Optimize this shit
      let data = this._messages[message_name];
      let datum = data[
        data.min_index((d) => Math.abs(d.timestamp - current_tiestamp))
      ];
      return datum;
    });
  }
}