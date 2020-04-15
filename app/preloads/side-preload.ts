import { join } from 'path';
import * as Highcharts from 'highcharts';
import Heatmap from 'highcharts/modules/heatmap';

Heatmap(Highcharts);

require(join(__dirname, 'chart-preload'));
