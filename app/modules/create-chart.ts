import {
  stockChart,
  Options,
  XAxisOptions,
  YAxisOptions
} from 'highcharts/highstock';

module.exports = (containerId: string, options: Options) => {
  delete require.cache[require.resolve('./create-chart')];
  return stockChart(containerId, {
    chart: {
      // zoomType: 'x',
      events: {
        redraw: () => {
          var chartSVG: SVGSVGElement = document.querySelector(
            '.highcharts-root'
          );
          var yAxisLabels: NodeListOf<SVGTextElement> = document.querySelectorAll(
            'g.highcharts-axis-labels.highcharts-yaxis-labels > text'
          );
          if (yAxisLabels == null || !yAxisLabels.length) return;

          var matrix = chartSVG.createSVGMatrix();
          yAxisLabels[yAxisLabels.length - 1].x.baseVal.getItem(
            0
          ).value = yAxisLabels[0].x.baseVal.getItem(0).value;
          var y = 9999;

          Array.from(
            <NodeListOf<SVGPathElement>>(
              document.querySelectorAll(
                '.highcharts-grid.highcharts-yaxis-grid > .highcharts-grid-line'
              )
            )
          ).forEach(
            (path: SVGPathElement) =>
              (y = y < path.getBBox().y ? y : path.getBBox().y)
          );
          matrix = matrix.translate(0, 9996 + y);
          yAxisLabels[yAxisLabels.length - 1].transform.baseVal
            .getItem(0)
            .setMatrix(matrix);
        }
      }
    },
    title: {
      text: options.title.text,
      style: {
        padding: '80px'
      }
    },
    subtitle: {
      text: (<YAxisOptions>options.yAxis).title.text,
      align: 'left',
      y: 20
    },
    xAxis: {
      crosshair: false,
      title: {
        text: (<XAxisOptions>options.xAxis).title.text,
        align: 'high'
      },
      type: 'category',
      labels: {
        formatter: function() {
          return this.value;
        } as any
      }
    },
    yAxis: {
      minRange: 1,
      maxRange: 26,
      opposite: false,
      tickInterval: (<YAxisOptions>options.yAxis).tickInterval,
      endOnTick: false
    },
    rangeSelector: {
      enabled: false,
      inputEnabled: false,
      buttons: [
        {
          text: '10',
          count: 9,
          type: 'millisecond'
        },
        {
          text: '50',
          count: 49,
          type: 'millisecond'
        },
        {
          text: '100',
          count: 99,
          type: 'millisecond'
        },
        {
          text: '200',
          count: 199,
          type: 'millisecond'
        },
        {
          text: 'all',
          type: 'all'
        }
      ],
      buttonPosition: {
        align: 'right',
        x: -30,
        y: -30
      },
      labelStyle: {
        fontSize: '0px'
      }
    },
    series: options.series,
    navigator: {
      xAxis: {
        labels: {
          formatter: function() {
            return this.value;
          } as any
        }
      },
      margin: 3,
      height: 25
    },
    scrollbar: {
      enabled: false
    },
    plotOptions: {
      series: {
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
    tooltip: {
      formatter: function() {
        return (
          `${(<XAxisOptions>options.xAxis).title.text} <b>` +
          this.x +
          `</b><br>${(<YAxisOptions>options.yAxis).title.text} <b>` +
          this.y +
          '</b>'
        );
      } as any
    },
    boost: {
      allowForce: true,
      enabled: true,
      useGPUTranslations: true
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    }
  });
};
