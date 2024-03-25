<template>
	<view class="content">
		<image class="logo" src="/static/dm-logo.png"></image>
		<view class="text-area">
			<text class="title">DM工具箱</text>
		</view>
		 <view class="tools-list">
			<view class="flex-item" v-for="(item,index) in toolsList" :key="index" @click="gotoPage(item)">{{item.title}}</view>
			<view class="flex-item">B</view>
			<view class="flex-item">C</view>
			<view class="flex-item">D</view>
			<view class="flex-item">E</view>
			<view class="flex-item">F</view>
			<view class="flex-item">G</view>
			<view class="flex-item">H</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',
				toolsList: [
					{
						title: '金额转大写',
						url: '/pages/components/convertCurrency/convertCurrency'
					},
					{
						title: '网络信息',
						url: '/pages/components/networkInfo/networkInfo'
					},
					{
						title: 'base64/MD5',
						url: '/pages/components/base64Conver/base64Conver'
					}
				]
			}
		},
		onLoad() {

		},
		methods: {
			gotoPage(list){
				if(!list.url) return
				uni.navigateTo({
					// url: 'test?id=1&name=uniapp'
					url: `${list.url}`
				});
			}
		}
	}
</script>

<style>
	.content {
		padding: 20px;
/* 		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center; */
	}

	.logo {
		height: 80rpx;
		width: 80rpx;
		padding: 5px;
		margin-bottom: 10rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
	.tools-list {
		display: flex;
		flex-wrap: wrap;
	}
	.flex-item {
		margin: 5px 10px;
		padding: 0 15px;
		background-color: #ebebeb;
		height: 35px;
		line-height: 35px;
		text-align: center;
		color: #777;
		font-size: 13px;
	}
</style>
