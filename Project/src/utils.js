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
    this._points = d3.quadtree()
      .x((d) => d.x)
      .y((d) => d.y);
    
    let step_size = this.search_radius;
    let number_of_points = this._svg_path.getTotalLength() / step_size;

    let points_array = [];
    for(let i = 0; i < number_of_points; ++i) {
      let pt = this._svg_path.getPointAtLength(step_size * i); // This call is expensive :(
      points_array.push({
        x: pt.x,
        y: pt.y,
        path_length: step_size * i});
    }
    this._points.addAll(points_array);
  }
  get_lenght_from_point(point) {
    // IDEA : Create point iteratively on the path using getPointAtLength.
    // Then, find the closest point (but keep all points in a radius of the length fragment)
    // Iteratvely regenerate points on the line and diminish the length fragment length, until the closest
    // point is found.

    // Current implementation: Just create a ton of points and find the closest.

    return this._points.find(point[0], point[1]).path_length;
  }
}
