<template>
  <el-container style="height: 100%;">
    <section style="padding: 10px; width: 100%">
      <div>
        <el-card class="box-card">
          <div class="order-pro">订单状态</div>
          <div class="elRow">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="grid-content bg-purple-complete" :style="{height: (screenHeight/4) +'px'}">
                  <div class="probability">{{orderProbability.complete}}个</div>
                  <div class="desc">已完成</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="grid-content bg-purple-effective" :style="{height: (screenHeight/4) +'px'}">
                  <div class="probability">{{orderProbability.effective}}个</div>
                  <div class="desc">已生效</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="grid-content bg-purple-notEffective" :style="{height: (screenHeight/4) +'px'}">
                  <div class="probability">{{orderProbability.notEffective}}个</div>
                  <div class="desc">未生效</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>
      <div style="margin-top: 20px; height: 58%">
        <div style="height: 100%">
          <el-row :gutter="20" style="height: 100%">
            <el-col :span="12" style="height: 100%">
              <div class="echartsPic" style="height: 100%">
                <el-card :style="{width:100+ '%',height:(screenHeight/2+15)+ 'px'}">
                  <div class="order-pro">全年产品进/出口量</div>
                  <div id="myChart" :style="{width:100+ '%',height:(screenHeight/2-20)+ 'px'}"></div>
                </el-card>
              </div>
            </el-col>
            <el-col :span="12" style="height: 100%">
              <el-card :style="{width:100+ '%',height:(screenHeight/2+15)+ 'px'}">
                <div class="order-pro">今日订单</div>
                <div style="overflow: auto; margin-top: 5px;height: 100%;">
                  <el-table :data="orderData" border :style="{width:100+ '%',height:(screenHeight/2-20)+ 'px'}" highlight-current-row>
                    <el-table-column prop="code" :label="$t('order.code')" width="150"/>
                    <el-table-column prop="productName" :label="$t('product.name')" width="120"/>
                    <el-table-column prop="name" :label="$t('customer.name')"/>
                    <el-table-column :label="$t('order.cabinPosition')" width="120">
                      <template slot-scope="scope">
                        <span v-if="scope.row.cabinPosition == 0">直接订舱</span>
                        <span v-if="scope.row.cabinPosition == 1">舱位预留</span>
                      </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.operation')" width="130">
                      <template slot-scope="scope">
                        <el-button type="text" size="small" @click="view(scope.row.id)">{{$t('common.ViewDetails')
                          }}</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </section>
  </el-container>
</template>

<script>
  export default {
    name: 'Home',
    data () {
      return {
        tableData: [],
        orderData: [], //订单信息
        orderProbability: [],
        screenHeight: document.documentElement.clientHeight,   // 这里是给到了一个默认值 （这个很重要）

        currentPage: 1,
        pageSize: 50,
      }
    },
    computed: {},
    mounted () {
      //获取页面高度
      window.onresize = () => {
        return (() => {
          window.screenHeight = document.documentElement.clientHeight;
          this.screenHeight = window.screenHeight;
        })()
      },
      this.getOrderProbability();
      this.drawLine();
      this.loadOrderTable();
    },
    methods: {
      view (data) {
        this.$router.push({
          name: 'OrderForm',
          query: {
            orderId: data,
          }
        })
      },
      getOrderProbability () {
        this.$http.get('/api/orderForm/getCount').then(resp => {
          if (resp.success) {
            this.orderProbability = resp.data
          }
        })
      },
      drawLine () {
        // 基于准备好的dom，初始化echarts实例
        let myChart = this.$echarts.init(document.getElementById('myChart'))
        // 绘制图表
        myChart.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '4%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          legend: {
            data: ['进口', '出口']
          },
          xAxis: {
            type: 'category',
            axisTick: { show: false },
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
          },
          yAxis: {
            name: '单位/箱',
            type: 'value'
          },
          series: [{
            name: '进口',
            data: [120, 200, 150, 80, 70, 110, 130, 200, 150, 80, 70, 110],
            type: 'bar',
            itemStyle: {
              normal: {
                label: {
                  show: true
                }
              }
            }
          }, {
            name: '出口',
            data: [120, 200, 150, 80, 70, 110, 130, 200, 150, 80, 70, 110],
            type: 'bar',
            itemStyle: {
              normal: {
                label: {
                  show: true
                }
              }
            }
          }
          ]
        })
      },
      loadOrderTable () {
        this.$http.get('/api/orderForm/getPage', {
          offset: (this.currentPage - 1) * this.pageSize,
          length: this.pageSize,
        }).then(resp => {
          this.orderData = resp.data.content
        })
      },
    }
  }
</script>

<style scoped>
  .order-pro {
    display: inline-block;
    padding: 1px 0 1px 10px;
    font-size: 17px;
    font-weight: 700;
    border-left: 4px solid #2491ef;
  }

  .elRow {
    margin: 10px 0 0 10px;
  }

  .grid-content {
    border-radius: 15px;
    min-height: 130px;
  }

  .bg-purple-complete{
    background: url("../assets/complete.png") no-repeat;
    background-size:cover;
  }
  .bg-purple-effective{
    background: url("../assets/effective.png") no-repeat;
    background-size:cover;
  }
  .bg-purple-notEffective{
    background: url("../assets/notEffective.png") no-repeat;
    background-size:cover;
  }

  .probability {
    text-align: center;
    padding-top: 10%;
    font-weight: bold;
    font-size: 35px;
    color: white;
  }
  .desc {
    color: white;
    text-align: center;
    margin-left: 30%;
    margin-top: 5%;
  }
</style>
