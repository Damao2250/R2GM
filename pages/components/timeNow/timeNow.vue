<template>
  <view class="content">
    <view class="time-now">
      <view class="time-content">
        <text>{{timeNow}}</text>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      timeNow: '',
      timer: null
    }
  },
  created(){
    this.getTimeNow()
    // 每10毫秒更新一次时间
    this.timer = setInterval(() => {
      this.getTimeNow()
    }, 10)
  },
  beforeDestroy(){
    // 组件销毁前清除定时器
    if(this.timer) {
      clearInterval(this.timer)
    }
  },
  methods:{
    getTimeNow(){
      const now = new Date()
      this.timeNow = this.formatTime(now)
    },
    formatTime(time){
      const year = time.getFullYear()
      const month = String(time.getMonth() + 1).padStart(2, '0')
      const day = String(time.getDate()).padStart(2, '0')
      const hours = String(time.getHours()).padStart(2, '0')
      const minutes = String(time.getMinutes()).padStart(2, '0')
      const seconds = String(time.getSeconds()).padStart(2, '0')
      const milliseconds = String(time.getMilliseconds()).padStart(3, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
    },
  }
}
</script>
<style scoped lang="less">
.content {
  padding: 20px;
  .time-now {
    font-size: 20px;
    font-weight: bold;
    display: flex;
    justify-content: center;
    .time-content {
      width: 260px;
      text-align: left;
    }
  }
}
</style>
