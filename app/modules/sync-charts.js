"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const highcharts_1 = require("highcharts");
(() => {
    highcharts_1.Pointer.prototype['_reset'] = highcharts_1.Pointer.prototype.reset;
    highcharts_1.Pointer.prototype.reset = () => {
        highcharts_1.charts.forEach(chart => chart.pointer['_reset']());
    };
})();
highcharts_1.Point.prototype['highlight'] = function (event) {
    event = this.series.chart.pointer.normalize(event);
    this.onMouseOver();
    this.series.chart.tooltip.refresh(this);
    this.series.chart.xAxis[0].drawCrosshair(event, this);
};
//# sourceMappingURL=sync-charts.js.map