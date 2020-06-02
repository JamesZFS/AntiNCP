import Vue from "vue";
import api from "../../api";
import deepcopy from 'deepcopy';
import {processArticles, colorLerp} from "../../utils";

const colorGrey = [217, 217, 217];
const colorGreen = [16, 173, 16];
const colorDark = [110, 110, 110];

export function valueToDegree(value) {
    return Math.round(value * 1e5 + Number.EPSILON) / 1e2;
}

export async function fetchTrendBubbles(lastDate, timeWindow, n_bubble, n_trend) {
    const today = new Date();
    let date = {
        max: lastDate,
        min: lastDate.addDay(-timeWindow + 1),
    };
    let bubbles = [];
    let jobs = [];
    for (let i = 0; i < n_bubble; i++, date.min = date.min.addDay(-timeWindow), date.max = date.max.addDay(-timeWindow)) {
        jobs.push(new Promise(async (resolve, reject) => {
            let curIdx = i;
            let curDate = deepcopy(date);
            try {
                var res = await Vue.axios.get(api.GET_TRENDS_TIMELINE
                    .replace(':dateMin', curDate.min.format('yyyy-mm-dd'))
                    .replace(':dateMax', curDate.max.format('yyyy-mm-dd')), {
                    params: {limit: n_trend}
                });
                if (res.data.length === 0) {
                    resolve();
                    return;
                }
                let bubble = {
                    title: (timeWindow === 1
                        ? `${curDate.min.format('mm/dd')}`
                        : `${curDate.min.format('mm/dd')} - ${curDate.max.format('mm/dd')}`)
                        + ' 热词',
                    date: curDate,
                    trends: res.data,
                };
                { // compute color of bubble, suggested by @Suiyi
                    let alpha = Math.tanh(today.dayDiff(curDate.max) / 10.0); // [0, 1)
                    let color = colorLerp(alpha, window.colorPrimary, window.colorAccent);
                    bubble.color = `rgb(${color})`;
                }
                for (let trend of bubble.trends) { // render color
                    trend.value = valueToDegree(trend.value);
                    trend.incr = valueToDegree(trend.incr);
                    let alpha = Math.tanh(trend.incr); // (-1, 1)
                    let a2 = alpha * alpha;
                    let color = alpha > 0 ? colorLerp(a2, colorGrey, colorGreen) : colorLerp(a2, colorGrey, colorDark);
                    let textColor = a2 > 0.6 ? 'white' : 'black';
                    Object.assign(trend, {color: `rgb(${color})`, textColor});
                }
                // star the first
                Object.assign(bubble.trends[0], {star: true, color: 'orange', textColor: 'white'});
                bubbles[curIdx] = bubble;
                resolve();
            } catch (err) {
                console.error(`Cannot fetch trends timeline data from backend with ${err}`);
                reject(err);
            }
        }));
    }
    await Promise.all(jobs);
    bubbles = bubbles.filter(x => x.trends && x.trends.length > 0);
    return bubbles;
}

export async function fetchArticlesByWords(words, mode, dateMin, dateMax, articlesLimit = 50) {
    try {
        var res = await Vue.axios.get(api.GET_TRENDS_ARTICLE_IDS
            .replace(':dateMin', dateMin.format('yyyy-mm-dd'))
            .replace(":dateMax", dateMax.format('yyyy-mm-dd')), {
            params: {words, mode}
        });
    } catch (e) {
        console.error('error fetching articles ids by words:', e);
        return [];
    }
    let ids = res.data.articleIds;
    if (ids.length === 0) {
        return [];
    }
    try {
        res = await Vue.axios.post(api.GET_ARTICLES_POST, {ids: ids.slice(0, articlesLimit)});
    } catch (e) {
        console.error('error fetching articles by ids:', e);
        return [];
    }
    return processArticles(res.data.articles);
}

export async function fetchTrendsCurve(words, dateMin, dateMax) {
    try {
        var res = await Vue.axios.get(api.GET_TRENDS_CURVE
            .replace(':dateMin', dateMin.format('yyyy-mm-dd'))
            .replace(":dateMax", dateMax.format('yyyy-mm-dd')), {
            params: {words}
        });
    } catch (e) {
        console.error('error fetching articles ids by words:', e);
        return {labels: [], series: [], stems: []};
    }
    return res.data;
}
