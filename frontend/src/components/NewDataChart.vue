import ecStat from "echarts-stat";
<!-- chart.js实现的预测图组件 -->
<template>
    <v-container id="NewDataChart" style="width: 85%;height: 100%" class="mx-auto">
        <canvas id="myChart" style="width: 90%;height: 80vh;"></canvas>
    </v-container>
</template>

<script>
    import Chart from 'chart.js';

    export default {
        name: 'NewDataChart',
        externals: {
            moment: 'moment'
        },
        data() {
            return {
                cur_superiorProvince: '',
                cur_superiorCountry: '',
                cur_superiorLevel: 'world',
                labels: [],
                activeCount: [],
                confirmedCount: [],
                curedCount: [],
                deadCount: []
            }
        },
        computed: {
            cur_superiorPlace: function () {
                if (this.cur_superiorLevel === 'world') {
                  return 'world';
                }
                else if(this.cur_superiorLevel === 'country'){
                  return this.cur_superiorCountry;
                }
                else if(this.cur_superiorLevel === 'province'){
                  return this.cur_superiorProvince;
                }
                else{
                  console('cur_superiorPlace undefined\n');
                  return undefined;
                }
            },
            myoption: function () {
                var color = Chart.helpers.color;
                window.chartColors = {
                    red: 'rgb(255, 99, 132)',
                    orange: 'rgb(255, 159, 64)',
                    yellow: 'rgb(255, 205, 86)',
                    green: 'rgb(75, 192, 192)',
                    blue: 'rgb(54, 162, 235)',
                    purple: 'rgb(153, 102, 255)',
                    grey: 'rgb(201, 203, 207)'
                };
                return {
                    type: 'line',
                    data: {
                        labels: this.labels,
                        datasets: [{
                            label: '活跃',
                            fontSize: 25,
                            backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                            borderColor: window.chartColors.red,
                            fill: false,
                            data: this.activeCount,
                        }, {
                            label: '确诊',
                            backgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(),
                            borderColor: window.chartColors.blue,
                            fill: false,
                            data: this.confirmedCount,
                        }, {
                            label: '治愈',
                            backgroundColor: color(window.chartColors.green).alpha(0.5).rgbString(),
                            borderColor: window.chartColors.green,
                            fill: false,
                            data: this.curedCount,
                        }, {
                            label: '死亡',
                            backgroundColor: color(window.chartColors.grey).alpha(0.5).rgbString(),
                            borderColor: window.chartColors.grey,
                            fill: false,
                            data: this.deadCount,
                        }]
                    },
                    options: {
                        title: {
                            display: true,
                            text: this.cur_superiorPlace + '新冠疫情走势图',
                            fontStyle: "normal",
                            fontSize: 25
                        },
                        scales: {
                            xAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: '日期'
                                }
                            }],
                            yAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: '人数'
                                },
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                }
            }
        },
        methods: {
            placechange(tmp_superiorCountry, tmp_superiorProvince, tmp_superiorLevel) {
                this.cur_superiorLevel = tmp_superiorLevel;
                this.cur_superiorCountry = tmp_superiorCountry;
                this.cur_superiorProvince = tmp_superiorProvince;
            },
            dataImport(res) {
                var tmp_dataset = res;
                if (this.cur_superiorLevel === 'country') {
                    tmp_dataset = res.data.countryTimeline
                } else if (this.cur_superiorLevel === 'world') {
                    tmp_dataset = res.data.worldTimeline
                } else if (this.cur_superiorLevel === 'province') {
                    tmp_dataset = res.data.provinceTimeline
                }
                console.log('this.cur_superiorLevel: ',this.cur_superiorLevel);
                this.labels = tmp_dataset.labels;
                this.activeCount = tmp_dataset.datasets.activeCount;
                this.confirmedCount = tmp_dataset.datasets.confirmedCount;
                this.curedCount = tmp_dataset.datasets.curedCount;
                this.deadCount = tmp_dataset.datasets.deadCount;
                window.myChart.destroy();
                window.myChart = new Chart(document.getElementById('myChart'), this.myoption);
            },
            drawTimeAxis() {
                // window.myChart.update();
            },
            initechart() {
                window.myChart = new Chart(document.getElementById('myChart'), this.myoption);
            }
        },
        mounted() {
            this.initechart();
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h1, h2 {
        font-weight: normal;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }
</style>
