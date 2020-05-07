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
        props: {
            labels: Array, // ['1-1', '2-2']
            legends: Array, // ['Word1', 'Word2']
            series: Array, // [[1, 2], [3, 4]]
            borderWidth: {
                type: Number,
                default: 2,
            }
        },
        data: () => ({chart: null}),
        mounted() {
            let datasets = [];
            const colors = Object.values(chartColors);
            for (let i = 0; i < this.legends.length; ++i) {
                let dataset = {
                    label: this.legends[i],
                    data: this.series[i],
                    borderWidth: this.borderWidth,
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
                    labels: this.labels,
                    datasets,
                },
            });
        }
    }
</script>

<style scoped>

</style>