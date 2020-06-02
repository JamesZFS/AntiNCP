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
                deadCount: [],
                backup_activeCount: [],
                backup_confirmedCount: [],
                backup_curedCount: [],
                backup_deadCount: [],
                backup_labels: [],
                add_more_data: false
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
                            text: this.cur_superiorPlace + ' 疫情走势图',
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
            backup_data(){
                this.add_more_data = true;
                this.backup_activeCount = [];
                this.backup_confirmedCount = [];
                this.backup_curedCount = [];
                this.backup_deadCount = [];
                this.backup_labels = [];
                for(var index in this.activeCount)
                {
                    this.backup_activeCount.push(this.activeCount[index]);
                    this.backup_confirmedCount.push(this.confirmedCount[index]);
                    this.backup_curedCount.push(this.curedCount[index]);
                    this.backup_deadCount.push(this.deadCount[index]);
                }
                for(var labels_index in this.labels)
                {
                    this.backup_labels.push(this.labels[labels_index]);
                }
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
                this.labels = tmp_dataset.labels;
                this.activeCount = tmp_dataset.datasets.activeCount;
                this.confirmedCount = tmp_dataset.datasets.confirmedCount;
                this.curedCount = tmp_dataset.datasets.curedCount;
                this.deadCount = tmp_dataset.datasets.deadCount;
                if(this.add_more_data){
                    this.dataImport_backup();
                    this.add_more_data = false;
                }
                window.myChart.destroy();
                window.myChart = new Chart(document.getElementById('myChart'), this.myoption);
            },
            dataImport_backup(){
                for(var index in this.backup_activeCount)
                {
                    this.activeCount.push(this.backup_activeCount[index]);
                    this.confirmedCount.push(this.backup_confirmedCount[index]);
                    this.curedCount.push(this.backup_curedCount[index]);
                    this.deadCount.push(this.backup_deadCount[index]);
                }
                for(var labels_index in this.backup_labels)
                {
                    this.labels.push(this.backup_labels[labels_index]);
                }
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
