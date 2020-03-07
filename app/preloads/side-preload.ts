import { join } from 'path';
import Heatmap from 'highcharts/modules/heatmap';
import * as Highcharts from 'highcharts';
Heatmap(Highcharts);

require(join(__dirname, 'chart-preload'));
