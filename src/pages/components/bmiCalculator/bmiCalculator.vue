<template>
  <view class="container">
    <PageHeader title="BMI计算器" />
    <view class="form-group">
      <view class="input-item">
        <text class="label">身高 (cm)</text>
        <input class="input" type="number" v-model="height" placeholder="请输入身高" @input="calculateBMI" />
      </view>
      <view class="input-item">
        <text class="label">体重 (kg)</text>
        <input class="input" type="number" v-model="weight" placeholder="请输入体重" @input="calculateBMI" />
      </view>
    </view>

    <view v-if="bmi" class="result-card">
      <view class="bmi-value">{{ bmi }}</view>
      <view class="bmi-status" :class="statusClass">{{ status }}</view>
      <view class="bmi-range">标准范围: 18.5 - 24.9</view>
    </view>

    <view class="info-card">
      <view class="title">BMI 指数分类</view>
      <view class="table">
        <view class="row header">
          <view class="col">分类</view>
          <view class="col">BMI 范围</view>
        </view>
        <view class="row">
          <view class="col">偏瘦</view>
          <view class="col">&lt; 18.5</view>
        </view>
        <view class="row highlight">
          <view class="col">正常</view>
          <view class="col">18.5 - 24.9</view>
        </view>
        <view class="row">
          <view class="col">超重</view>
          <view class="col">25 - 29.9</view>
        </view>
        <view class="row">
          <view class="col">肥胖</view>
          <view class="col">≥ 30</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import PageHeader from '@/components/PageHeader.vue';

export default {
  components: {
    PageHeader
  },
  data() {
    return {
      height: '',
      weight: '',
      bmi: null,
      status: '',
      statusClass: ''
    };
  },
  methods: {
    calculateBMI() {
      if (this.height && this.weight) {
        const height = parseFloat(this.height);
        const weight = parseFloat(this.weight);

        if (isNaN(height) || height <= 0 || isNaN(weight) || weight <= 0) {
          if (this.height && this.weight) {
            uni.showToast({
              title: '请输入有效的身高和体重',
              icon: 'none'
            });
          }
          this.bmi = null;
          this.status = '';
          this.statusClass = '';
          return;
        }

        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        this.bmi = bmi;
        this.updateStatus(bmi);
      } else {
        this.bmi = null;
        this.status = '';
        this.statusClass = '';
      }
    },
    updateStatus(bmi) {
      if (bmi < 18.5) {
        this.status = '偏瘦';
        this.statusClass = 'underweight';
      } else if (bmi >= 18.5 && bmi < 25) {
        this.status = '正常';
        this.statusClass = 'normal';
      } else if (bmi >= 25 && bmi < 30) {
        this.status = '超重';
        this.statusClass = 'overweight';
      } else {
        this.status = '肥胖';
        this.statusClass = 'obese';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  background-color: #f8f8f8;
  min-height: 100vh;
}

.form-group {
  background: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .input-item {
    margin-bottom: 30rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-size: 28rpx;
      color: #666;
      display: block;
      margin-bottom: 10rpx;
    }

    .input {
      height: 80rpx;
      border-radius: 8rpx;
      border: 2rpx solid #eee;
      padding: 0 20rpx;
      font-size: 32rpx;
    }
  }
}

.result-card {
  background: #fff;
  padding: 40rpx;
  border-radius: 16rpx;
  text-align: center;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .bmi-value {
    font-size: 80rpx;
    font-weight: bold;
    color: #333;
    line-height: 1;
  }

  .bmi-status {
    font-size: 36rpx;
    margin: 20rpx 0;
    font-weight: 500;

    &.underweight {
      color: #f1c40f;
    }

    &.normal {
      color: #2ecc71;
    }

    &.overweight {
      color: #e67e22;
    }

    &.obese {
      color: #e74c3c;
    }
  }

  .bmi-range {
    font-size: 24rpx;
    color: #999;
  }
}

.info-card {
  background: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .title {
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }

  .table {
    .row {
      display: flex;
      padding: 20rpx 0;
      border-bottom: 2rpx solid #f0f0f0;
      font-size: 26rpx;

      &.header {
        font-weight: bold;
        color: #666;
      }

      &.highlight {
        background-color: rgba(46, 204, 113, 0.1);
        color: #2ecc71;
      }
    }

    .col {
      flex: 1;
      text-align: center;
    }
  }
}
</style>
