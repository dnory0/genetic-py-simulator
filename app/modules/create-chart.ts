import {
  Options,
  chart,
  XAxisOptions,
  YAxisOptions,
  getOptions
} from 'highcharts';

module.exports = (containerId: string, options: Options) => {
  delete require.cache[require.resolve('./create-chart')];
  return chart(containerId, {
    chart: {
      // zoomType: 'x',
      spacingBottom: 3,
      backgroundColor: 'transparent'
    },
    tooltip: {
      useHTML: true,
      formatter: options.tooltip.formatter,
      positioner: options.tooltip.positioner
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
      min: (<XAxisOptions>options.xAxis).min,
      labels: (<XAxisOptions>options.xAxis).labels
    },
    colorAxis: {
      minColor: getOptions().colors[2],
      maxColor: getOptions().colors[8]
    },
    yAxis: {
      title: null,
      tickInterval: 1,
      endOnTick: false,
      labels: (<YAxisOptions>options.yAxis).labels,
      gridLineWidth: (<YAxisOptions>options.yAxis).gridLineWidth
    },
    exporting: {
      enabled: false
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
