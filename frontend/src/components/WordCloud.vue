<!-- 词云图组件 -->
<template>
  <div>
    <h1>WordCloud</h1>
    <div id="wordcloud" style="width: 50vw;height: 50vh;"></div>
  </div>
</template>

<script>
  import echarts from 'echarts'
  import china from 'echarts/map/js/china'
  import 四川 from 'echarts/map/js/province/sichuan'
  import 陕西 from 'echarts/map/js/province/shanxi1'
  import 'echarts/lib/component/visualMap'
  import wordcloud from 'echarts-wordcloud'
  export default {
    name: 'wordcloud',
    data () {
      return {
        count: 0,
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArQAAAGqCAYAAAD6CtesAAAZfklEQVR4nO3dfWxd5Z0n8HtTO7bzBnkZaJREQ5E64LxMV2066rSqWCgkEZgCoUxKlq3YIjlqRVHTMkhkKTgwO1JnykxbFaj9x8ygqi0VVKXCbawmEE27XarVZOhkFKzQwLYJDQTchPja4BuHeHWDQ2/useO3e+3zPOfzkSzbz7Hic56TOF8/93d+Tw4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACqJ28uc7mhoaHEWFqtXbv2n4I52Rpqbm7+z+985zv/GO0FAsAMyOfDjIZ1iRFSbc+ePR8p5Tl3KffPiRGYRj/+8Y8XHTt2bNHRo0eXHDt27E+G3y8qe/8nx44dW/LGG28sevvtt2eVzuy+++77UltbW9d0nmdnZ+eCxGBkWlpaemO/RuDcBFogs7q6upoqA2kphA6H0fJwumRgYKBphHlK9S+X995779UPPPDA1yL/Jbj7uuuue+zJJ5+8P3EEyAyBFgja7t27Z1UE0EQgPTPW29t73gglRtGGveXLl/8uA6/oNL/88ssXJUaBTBFogVQovTQ+HDzPesm+4vPT4XRwcLDyZ5cynBEsX778t6UVzNjnR6AFBFqganbu3NlwjpfuS58vOvPyfn9//9wRvq9gWkVXX311fzQXcw6vvfbae0c/CmSBQAskPPnkk2cF0pFWSkufHz9+/N0HnsoIpUyrEcpIgIwRaCFSO3bsmDvWS/dnxkJ84InxmTt3bn9/fyYWaoEME2ghxZ555plZI7SEGrFFVKFQyNQDT4xP6cGw/fv3r419ur73ve+t2Lx586HEASATBFpIgUsvvfSJUjgt9Sz1wBPVVHowbP/+/bHP6ZlOBwItZJRACymwf//+lYIrtTDc6SB6w4H2F9W+zixsTEH4GhoaildddVUxy7dSoAWI2HAv2ui9/PLLf1rta2xra9uwffv2f/DLJgHoPnOKs2fPPvGxj33smU9+8pOPffGLX/y/Wbl5lU8nAxCRjK3Q1oIwSwiaz7ydOHHiA7t37966devWf8nn889fdtllX8/CHRRoASI2vELbHfs9rsUKLQTudMD9+c9/vq4UbD/1qU9ti/mGCrQAEWtpaenNwv09cuTI0sQgkDsTbH/4wx/ecv755z/7gx/8YFmMsyLQAhC8U6dO+f8Mzq35+PHjH/n0pz+98/777193zq8MkB8AAJFramp6yz0GhjXfd999X//qV796WUwTItACRC4rnQ4ee+yxKF9KhRpovvvuux/50Y9+tCSWyRVoASKXkU4HzTXsdADRGRoaar711lufiuW6BFqAyOlFC4ykt7f3vI9+9KOPjHAoOAItwPSYsdZZK1asyEQv2kOHDl2cGATOpfnZZ5+97OGHH/7AOb4mCHYKA5iYs4JpPp/PzZ8///jixYtfX7x48WvD73vKPn73/bp162Zka8oMba6wIjEIjKX0kNg3Pv/5z//XMb4u1QRaIMvOCqd1dXUnh8PokUWLFvWUhdMj5SH1hhtu6Alpzso2V4h61ys1tDA5PT09F3zta1/72J133vnLUKdQoAVikHg5f968eYWKMPp6xarp6WMbNmyIvqXVtdde+0ZiMEJHjhzR5QAmp/nb3/72Xwu0ANVzVjh9z3vec2rhwoU9Y4XTG2+88Yh7kG1vv/2250Jgkl588cU/C3nuBFpgunSXGvyPVWdaGr/mmmsysV3rdGpsbHxrYGAgOxcMTNjwZgv/GuLMCbTAtHnzzTc/ZLZnRqmO9sCBAx+M/TpL+9Rv2rTp94kDwFian3vuub8INdB6eQYgA5YvX34wA5dpcwWYgoMHDwbb+s4K7SjuuuuuG48fP7545KMz480335ybpvOZSb/73e8u3rJlS2vazuvjH//4z2655ZZMtEgiLBnbXCHYB1tgJvX19S0I9QYItKP47ne/23r48OF1Ix9lpvX09FzW0dFxWQpvxJZbbrmlIzEKMyxDvWit0MIk1dXVDYY6dwItQAZkaIW22psrJFrCEY2o+zJPxqxZs06Fd9bvEGgBMmB4hdbmChPQ1tbWVXqbjvNmej3zzDOzDhw40Lx79+6rn3jiif9+8uTJOgE3bB4KA8iA66677mgWrvOVV16x/S1juuKKK061trbu+/73v//3g4ODf37BBRe8atbCJtACEA2bKzAZjzzyyF8pLwmbf/gAGdHQ0HDCvYakjRs39nz4wx/+P4kDBEOgBciIZcuWZaLTweOPP740MQhj2LRp0z+f+ytIM4EWICMy0rqrebgXLUzIJZdc8p9mLFwCLUBGLF++/FAWrlQvWiYjn8+bt4AJtAAZsWLFipeycKWHDh0SaJmwoaEhkxYwgRYgIzK2/S2QIQItQEaUba4QNSUHkD0CLUBGXH/99VnZXGFZYhCImkALQFSGtzEFMkSgBciQ2bNn21wBiI5AC5Ahy5YtO5iFq33iiScuTAwC0RJoATIkI50ObK4AGSPQAmRIRnYL0+kAMkagBciQDAVaK7SQIZ4EHcWXvvSl+wuFwj+OfBRG9qEPfehXIx6AlMjQ5gpWaCFDBNpRfPnLX/7lyEcAwlW2uUJzzLdRoIVsUXIAkCEbN27sycLVHj58eEViEIiWQAtAdAYHB70CCRki0AJkTH19/Un3HIiJ32ABMqazs/PDJ06caHDfgVgItAAZs27dumIulyu670AslBwAABA0K7TjtGvXrvqXXnrpz4I42XFYuHDh0ZtuuumV6f6+HR0dqxKDAWttbd0X0/UAQIgE2nHq6uq64cEHH/xBECc7DgsWLPjVTTfd9JfT/X23bNnyeCz9L88777xftba2TvscAgBnE2jHaeXKlb+OqRl5b2/veYnBGnv44Yc/MN3fs5ZWrVr17zFdD2RFZ2fnAjc721paWnqzPgexEWjH6bOf/ewLt912WxDnOl5dXV1NGzZseGu6vt++ffs+GNPuRKtXr/6PxCCQaqUwe+211/4q9p3SOKfu1tbWr7e3t3ec64sIi4fCJiCfzwdzruPQPBwwp83zzz8f1Qrt6tWrrdBCmITZbHP/IyTQTsCKFSv+XzAnOw7THTD37dv3XxKD4eoWaAEgHQTaCVi5cuXeYE52HPbt2zetgfb111+/IDEYsMsvv/xUTNcDAKESaCdg1apVzwVzsuPQ3d3956k/yZR673vf+/uszwEApIWHwiZAp4PJi63DgQfCCFUWn/D3RDvET6CdAJ0OJi/CDgfqZwlSBp/w725vb7/JJigQNyUHE6TTweRE1uGg9EBYVOUnEDFPtEMGCLQTpNPB5ETW4SB32223dScGAYAZIdBOkE4HkxNTh4PIVukBIHgC7QTpdMBFF110IPOTAAApItBOUFmngyhMR6eDCDscqJ8FgBQRaCeo1OkgqBMeh1Kng1r++TocAAC1JNBOgk4HExNhhwOBFgBSRKCdBJ0OJia2DgebN28+lBgEAGaMQDsJOh1MTEwdDurr608mBgGAGSXQToJOB9n1/ve/325DAJAyAu0k6HQwfrF1OFizZo36WQBIGYF2EnQ6GL8IOxxo2QUAKVPnhkxOqdPB0NBQiKc+ktOdDjZs2PDLEY5NiQ4HQAqd6xW2aH4BL3N/YmRs987MqVbdue41ERFoJ6nU6eDgwYPR/OAbDp5VD7SxdTi4/vrrjyYGgWC0tLT0Dg0NrRzpfNetW/d3O3fujDHQlhZg7ksMjiKfz28f+Uh4Hn300ZbPfOYzL8VyPYxOycEk6XQwPjF1OJgzZ05/YhCIRkNDQ9HdjMuiRYt6sj4HWSHQTpJOB9mzcuXK/8j6HABAGgm0k6TTwdhi63CwevXqXycGAYAZJ9BOkk4HY9PhAACYDgLtFJQ6HUSkeTiAVo0OBwDAdBBop6DU6SDYkx9BtQNobB0O1q9f/1ZiEACYcQLtFOh0cG4xdTjwpCwApJc+tFNQ6nTQ1dUV7PlX0ulgdKtWrdLhoAra2to2BH8RVXTJJZfsu/nmmw9Fc0EAM0SgnYKyTgdRPPhUzU4HEXY4UD87dc3bt2/fEfpFVFNLS8vf3HzzzV+J54oAZoaSgynQ6WB0kXU46F6zZo1ACwApJdBOkU4HI4usw0Huc5/7nJIDAEgpgXaKdDoYWWwdDgCA9BJop0ing5HF1OFg2bJlHtoBgBQTaKeo1Okg6AuooNNBkgfCACDdBNopKut0EIVqdDqIsMOBLW8BIMUE2inS6SAptg4HVmgBIN0E2irQ6eBssXU4uPXWWw8kBgGA1BBoq0Cng7PF1OFg1qxZpxKDAECqCLRVoNPB2WLqcHDxxRdHV1ICALERaKtAp4N4rV69+tdZnwMASDuBtgp0OvgjHQ4AgOkm0FaBTgd/pMMBADDdBNoq0engHbF1ONi0adPvE4MAQKoItFWi08E7YupwMHv27BOJQQAgderckuoodTo4ePDg+2K4ltwUOh0MdziIop740ksvjap7BQDESqCtkh07dtydy+XujuJipmBoaGhlsCcPEKktW7ac397e/sZYV7d58+YViUEIgEALAHG7t6OjI1d6G6d7/X0gNAItMF26ly5dOuZDdq+88sqyGDplNDY2/vvChQuPJg6UWbRoUU9iEGpDSCVqAi0wbQ4fPnzVWN8rn88/nxgM0JVXXvnTp5566iv+dgHUni4HAAAETaAFACBoAi0AAEETaAEACJpACwBA0HQ5yOVyW7du3fyLX/ziysQBmKRt27bdtXHjRi2ZAGAaCLS5XO7FF1+8ZM+ePf8jcQAmqaen58HSO/MHALWn5AAAgKAJtAAABE2gBQAgaAItAABBE2gBAAiaQAsAQNAEWgAAgibQAgAQNIEWAICg2SkMAOL2N0uWLDlSX19/YqyrLBaLTUePHl2Sy+XuSRyEFBNoASByr7/++rfGe4X5fP6BxCCknJIDAACCJtACABA0gRYAgKAJtAAABE2gBQAgaAItAABBE2gBAAiaPrS5XG7hwoVHly5duitxICB9fX0LCoXCX4R8DaPovvDCC1+dNWvW2yMfTqc5c+b0h3S+ABAygTaXyz366KPfyOVy30gcCEhbW9uG7du37wj5Gkbz6quvXjHKIQAAJQcAAIRNoAUAIGgCLQAAQRNoAQAImkALAEDQBFoAAIIm0AIAEDSBFgCAoAm0AAAETaAFACBoAi0AAEETaAEACJpACwBA0ARaAACCJtACABA0gRYAgKAJtADAabfffnuTmSBEde4aAMQtn88/MIELvCcxAikn0AJA3ARUoqfkAACAoAm0AAAETaAFACBoAi0AAEETaAEACJpACwBA0LTtKvPQQw99sKur64bEgQC88MILzSGe93isW7fu7xoaGorpP9PRPfXUU18Z9SAAMCUCbZm9e/eu7ezs1K8vXZp37twZeljvzuVyAi0A1IiSAwAAgibQAgAQNIEWAICgCbQAAARNoAUAIGgCLQAAQRNoAQAImkALAEDQbKwAAHH72wle3bbECKScQAsAkRsaGvqf47nC22+/vemhhx7KCbWERskBAHDat771rbfMBCESaAEACJpACwBA0ARaAACCJtACABA0gRYAgKAJtAAABE2gBQAgaDZWSOpOjISjOeBzH03I9wMAmAYCbZn29vaO0lviQADa2to2bN++fUeI5z6WoaGhlWN8CQCQYUoOAAAImkALAEDQBFoAAIIm0AIAEDSBFgCAoAm0AAAETaAFACBoAi0AAEETaAEACJpACwBA0ARaAACCVuf2JeXz+ecTgyn0wAMP3HHPPffsCuFcqy2Ue7RmzZrn9u7d+98SBwCAqhFoR9c86pGUaGxsfCvt51hjqb9HhULhQGIQAKgq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"
      }
    },
    methods: {
      drawwordcloud (id) {
        var maskImage = new Image()
        maskImage.src = require('../assets/newslogo.png')
        //maskImage.width = maskImage.width*0.3
        //maskImage.height = maskImage.height*0.3
        console.log(maskImage.src)
        this.charts = echarts.init(document.getElementById(id))
        this.charts.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{b}词频{c} (次)'
          },
          visualMap: {
            show: true,
            min: 0,
            max: 200,
            text: ['High', 'Low'],
            realtime: false,
            calculable: true,
            inRange: {
              color: ['lightskyblue', 'yellow', 'orangered']
            }
          },
          series: {
            type: 'wordCloud',
            //maskImage: maskImage,
            drawOutOfBound:true,
            gridsize: 2,
            shape:'smooth',
            size: ['200%','200%'],
            width: '150%',
            height: '150%',
            textStyle: {
              //悬停上去的颜色设置
              emphasis: {
                shadowBlur: 10,
                shadowColor: '#333'
              }
            },
            data: [{name: '钟南山', value: '160'}, {name: '论文', value: '3'},
              {name: '防护服', value: '24'}, {name: '捐款', value: '35'},
              {name: '体温', value: '5'}, {name: '睡眠不足', value: '3'},
              {name: '护士', value: '20'}, {name: '辽宁', value: '15'},
              {name: '火神山', value: '88'}, {name: '雷神山', value: '75'},
              {name: '封城', value: '52'}, {name: '阳性', value: '10'},
              {name: '阴性', value: '38'}, {name: '治愈', value: '11'},
              {name: 'nCoV', value: '80'}, {name: '确诊', value: '20'},
              {name: '感染', value: '34'}, {name: '14天', value: '6'},
              {name: '28天', value: '4'}, {name: '试剂', value: '30'},
              {name: '死亡', value: '21'}, {name: '新增', value: '84'},
              {name: '预测', value: '70'}, {name: '交通', value: '4'},
              {name: '指示', value: '29'}, {name: '辟谣', value: '53'},
              {name: '肺炎', value: '70'}, {name: '口罩', value: '4'},
              {name: '疫情', value: '3'}, {name: '防控', value: '29'},
              {name: '隔离', value: '53'}, {name: '医院', value: '50'}
            ]
          }
        })
      }
    },
    //调用
    mounted () {
      this.$nextTick(function () {
        this.drawwordcloud('wordcloud')
      })
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
