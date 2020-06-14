import { join } from 'path';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';

HighchartsMore(Highcharts);

require(join(__dirname, 'chart-preload'));
