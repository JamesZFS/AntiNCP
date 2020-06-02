<template>
  <canvas id="chartCanvas">
  </canvas>
</template>

<script>
    import Chart from 'chart.js';
    import {chartColors} from "../utils";

    function initChart(elemId, options) {
        return new Chart(document.getElementById(elemId), options);
    }

    export default {
        name: "MultiAxisChart",
        data: () => ({chart: null}),
        methods: {
            draw(labels, legends, series, borderWidth = 2) {
                if (this.chart) this.chart.destroy();
                let datasets = [];
                const colors = Object.values(chartColors);
                for (let i = 0; i < legends.length; ++i) {
                    let dataset = {
                        label: legends[i],
                        data: series[i],
                        borderWidth: borderWidth,
                        fill: false,
                    };
                    if (i < colors.length) {
                        Object.assign(dataset, {
                            borderColor: colors[i],
                        });
                    } // else: default
                    datasets.push(dataset);
                }
                if (datasets.length === 1) { // fill background
                    Object.assign(datasets[0], {
                        fill: true,
                        backgroundColor: Chart.helpers.color(colors[0]).alpha(0.5).rgbString()
                    });
                }
                this.chart = initChart('chartCanvas', {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets,
                    },
                });
            }
        },
    }
</script>

<style scoped>

</style>