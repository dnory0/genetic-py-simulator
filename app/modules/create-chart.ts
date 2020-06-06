import { Options, chart, XAxisOptions, YAxisOptions, getOptions } from 'highcharts';

module.exports = (containerId: string, options: Options) => {
  delete require.cache[require.resolve('./create-chart')];
  return chart(containerId, {
    chart: {
      resetZoomButton: {
        theme: {
          style: {
            pointerEvents: 'none',
            opacity: 0,
          },
        },
      },
      spacingBottom: 3,
      marginRight: 3,
      backgroundColor: 'white',
      events: options.chart.events,
      panning: {
        enabled: true,
      },
      panKey: 'ctrl',
    },
    tooltip: options.tooltip,
    title: {
      text: options.title.text,
    },
    xAxis: {
      crosshair: {
        width: 1,
      },
      title: {
        text: (<XAxisOptions>options.xAxis).title.text,
        align: 'high',
      },
      tickInterval: 1,
      min: (<XAxisOptions>options.xAxis).min,
      labels: (<XAxisOptions>options.xAxis).labels,
      minRange: (<XAxisOptions>options.xAxis).minRange,
    },
    colorAxis: {
      minColor: getOptions().colors[8],
      maxColor: getOptions().colors[2],
    },
    yAxis: {
      title: null,
      tickInterval: 1,
      labels: (<YAxisOptions>options.yAxis).labels,
      gridLineWidth: (<YAxisOptions>options.yAxis).gridLineWidth,
    },
    exporting: {
      enabled: false,
    },
    series: options.series,
    plotOptions: {
      series: {
        lineWidth: options.plotOptions.series.lineWidth,
        animation: false,
        states: {
          hover: {
            halo: {
              opacity: 0,
            },
            lineWidth: 1,
          },
        },
      },
    },
    subtitle: {
      text: (<YAxisOptions>options.yAxis).title.text,
      align: 'left',
    },
    legend: options.legend,
    credits: {
      enabled: false,
    },
  });
};
