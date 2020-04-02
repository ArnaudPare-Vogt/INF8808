Array.prototype.min = function(valueof) {
  let values = this;
  let min;
  let minIndex = -1;
  let index = -1;
  if (valueof === undefined) {
    for (const value of values) {
      ++index;
      if (value != null
          && (min > value || (min === undefined && value >= value))) {
        min = value, minIndex = index;
      }
    }
  } else {
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (min > value || (min === undefined && value >= value))) {
        min = value, minIndex = index;
      }
    }
  }
  return values[minIndex];
}





function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}





class SvgPathSelector {
  constructor() {
    this._svg_path = null;
    this._points = null;
    this.search_radius = 1;
  }
  set_path(svg_path) {
    this._svg_path = svg_path;
    this.recalculate_points();
  }
  recalculate_points() {
    this._points = [];
    
    let step_size = this.search_radius;
    let number_of_points = this._svg_path.getTotalLength() / step_size;

    for(let i = 0; i < number_of_points; ++i) {
      this._points.push({
        x: this._svg_path.getPointAtLength(step_size * i).x,
        y: this._svg_path.getPointAtLength(step_size * i).y,
        path_length: step_size * i});
    }
  }
  get_lenght_from_point(point) {
    // IDEA : Create point iteratively on the path using getPointAtLength.
    // Then, find the closest point (but keep all points in a radius of the length fragment)
    // Iteratvely regenerate points on the line and diminish the length fragment length, until the closest
    // point is found.

    // Current implementation: Just create a ton of points and find the closest.

    let distance = (p) => Math.sqrt(Math.pow(p.x - point[0], 2) + Math.pow(p.y - point[1], 2));
    return this._points.min(distance).path_length;
  }
}
