<template>
	<view class="content">
		<view class="info">
			<view class="list">
				<view class="label">
					<text user-select>网络类型：</text><text user-select class="value">{{networkType || '-'}}</text>
				</view>
				<view class="label" v-if="networkType=='wifi'">
					<text user-select>Wifi名称：</text><text user-select class="value">{{wifiInfo.SSID || '-'}}</text>
				</view>
				<view class="label" v-if="networkType=='wifi'">
					<text user-select>BSSID：</text><text user-select class="value">{{wifiInfo.BSSID || '-'}}</text>
				</view>
				<view class="label">
					<text user-select>IP地址：</text><text user-select class="value">{{localip || '-'}}</text>
				</view>
			</view>
		</view>
		<button @click="getNetworkInfo">刷新网络信息</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				networkType: '',
				localip: '',
				wifiInfo: {}
			};
		},
		created() {
			this.getNetworkInfo()
		},
		methods: {
			async getNetworkInfo(){
				let network = await uni.getNetworkType()
				console.log(network);
				this.networkType = network.networkType
				
				let localip = await uni.getLocalIPAddress()
				console.log(localip);
				this.localip = localip.localip
				
				if(this.networkType=='wifi'){
					let wifiInfo = await uni.getConnectedWifi()
					console.log(wifiInfo);
					this.wifiInfo = wifiInfo.wifi
					// BSSID: "22:bc:5a:09:56:c8"
					// SSID: "GK_Ding"
					// autoJoined: true
					// justJoined: false
					// secure: true
					// signalStrength: 0
				}
			}
		}
	}
</script>

<style lang="less">
.content {
	padding: 20px;
	.info {
		.list {
			font-size: 14px;
			.label {
				padding: 8px 0;
				padding-right: 10px;
				.value{
					
				}
			}
		}
	}
}
</style>
