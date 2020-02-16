import { Options, chart, XAxisOptions, YAxisOptions } from 'highcharts';

import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
HighchartsMore(Highcharts);

module.exports = (containerId: string, options: Options) => {
  delete require.cache[require.resolve('./create-pyshell')];
  return chart(containerId, {
    chart: {
      // zoomType: 'x'
    },
    tooltip: {
      useHTML: true,
      formatter() {
        return `
          <div style="text-align: right">
            Generation: <b>${
              Number.isSafeInteger(this.x)
                ? this.x
                : `${this.x - 0.5} - ${this.x + 0.5}`
            }</b><br>
            <span style="float: left;">
              ${Number.isSafeInteger(this.x) ? 'Fitness' : 'Deviation'}:&nbsp;
            </span>
            <b>${
              Number.isSafeInteger(this.x)
                ? this.y
                : Math.abs(this.point.high - this.point.low)
            }</b>
          </div>`;
      }
    },
    title: {
      text: options.title.text,
      style: {
        padding: '80px'
      }
    },
    xAxis: {
      tickInterval: 1,
      title: {
        text: (<XAxisOptions>options.xAxis).title.text,
        align: 'high'
      }
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
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    }
  });
};
