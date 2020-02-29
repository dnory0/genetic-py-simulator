import { Options, chart, XAxisOptions, YAxisOptions } from 'highcharts';

import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
HighchartsMore(Highcharts);

module.exports = (containerId: string, options: Options) => {
  delete require.cache[require.resolve('./create-pyshell')];
  return chart(containerId, {
    chart: {
      // zoomType: 'x',
      spacingBottom: 3
    },
    tooltip: {
      useHTML: true,
      formatter: options.tooltip.formatter
    },
    title: {
      text: options.title.text,
      style: {
        padding: '80px'
      }
    },
    xAxis: {
      crosshair: {
        width: 1
      },
      title: {
        text: (<XAxisOptions>options.xAxis).title.text,
        align: 'high'
      },
      tickInterval: 1,
      min: (<XAxisOptions>options.xAxis).min
    },
    yAxis: {
      title: null,
      tickInterval: 1,
      endOnTick: false
    },
    series: options.series,
    plotOptions: {
      line: {
        lineWidth: 1.5
      },
      series: {
        clip: false,
        animation: false,
        states: {
          hover: {
            halo: {
              opacity: 0
            }
          }
        }
      }
    },
    subtitle: {
      text: (<YAxisOptions>options.yAxis).title.text,
      align: 'left'
    },
    legend: options.legend,
    credits: {
      enabled: false
    }
  });
};
