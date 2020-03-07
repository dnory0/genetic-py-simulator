import { Point, Pointer, charts } from 'highcharts';

/**
 * Override the reset function, to reset all surrounding charts' tooltip
 */
(() => {
  Pointer.prototype['_reset'] = Pointer.prototype.reset;
  Pointer.prototype.reset = () => {
    charts.forEach(chart => chart.pointer['_reset']());
  };
})();

/**
 * Highlight a point by showing tooltip, setting hover state and draw crosshair
 */
Point.prototype['highlight'] = function(event) {
  event = this.series.chart.pointer.normalize(event);

  this.onMouseOver(); // Show the hover marker
  this.series.chart.tooltip.refresh(this); // Show the tooltip
  this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
};
