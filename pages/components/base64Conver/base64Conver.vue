<template>
	<view class="content">
		<view class="content-input">
			<textarea class="uni-input" cursor-spacing='100' v-model="currencyValue" auto-height placeholder="请输入内容" />
		</view>
		<view class="content-input">
			<button type="primary" @click="convertData(currencyValue)">base64转换</button>
		</view>
		<view class="content-input">
			<text selectable user-select>{{convertValue}}</text>
		</view>
		<button type="primary" :disabled="!isCopy" @click="clipboardData">点击复制</button>

		<div class="line"></div>

		<view class="content-input">
			<textarea class="uni-input" cursor-spacing='100' v-model="currencyValue1" auto-height placeholder="请输入内容" />
		</view>
		<view class="content-input">
			<button type="primary" @click="convertData1(currencyValue1)">base64解码</button>
		</view>
		<view class="content-input">
			<text selectable user-select>{{convertValue1}}</text>
		</view>
		<button type="primary" :disabled="!isCopy1" @click="clipboardData1">点击复制</button>

		<div class="line"></div>

		<view class="content-input">
			<textarea class="uni-input" cursor-spacing='100' v-model="currencyValue3" auto-height placeholder="请输入内容" />
		</view>
		<view class="content-input">
			<button type="primary" @click="convertData3(currencyValue3)">MD5计算</button>
		</view>
		<view class="content-input">
			<text selectable user-select>{{convertValue3}}</text>
		</view>
		<button type="primary" :disabled="!isCopy3" @click="clipboardData3">点击复制</button>

		<div class="line"></div>

	</view>
</template>

<script>
	import EncodeUtils from "./endecode-lib.js";
	export default {
		data() {
			return {
				currencyValue: '',
				convertValue: '',
				isCopy: false,
				currencyValue1: '',
				convertValue1: '',
				isCopy1: false,
				currencyValue3: '',
				convertValue3: '',
				isCopy3: false
			};
		},
		methods: {


			/**
			 FeHelper
			 
			 if (this.urlResult = null,
			 "uniEncode" === this.selectedType)
				 this.resultContent = EncodeUtils.uniEncode(this.sourceContent);
			 else if ("uniDecode" === this.selectedType)
				 this.resultContent = EncodeUtils.uniDecode(this.sourceContent.replace(/\\U/g, "\\u"));
			 else if ("utf8Encode" === this.selectedType)
				 this.resultContent = encodeURIComponent(this.sourceContent);
			 else if ("utf8Decode" === this.selectedType)
				 this.resultContent = decodeURIComponent(this.sourceContent);
			 else if ("utf16Encode" === this.selectedType)
				 this.resultContent = EncodeUtils.utf8to16(encodeURIComponent(this.sourceContent));
			 else if ("utf16Decode" === this.selectedType)
				 this.resultContent = decodeURIComponent(EncodeUtils.utf16to8(this.sourceContent));
			 else if ("base64Encode" === this.selectedType)
				 this.resultContent = EncodeUtils.base64Encode(EncodeUtils.utf8Encode(this.sourceContent));
			 else if ("base64Decode" === this.selectedType)
				 this.resultContent = EncodeUtils.utf8Decode(EncodeUtils.base64Decode(this.sourceContent));
			 else if ("md5Encode" === this.selectedType)
				 this.resultContent = EncodeUtils.md5(this.sourceContent);
			 else if ("hexEncode" === this.selectedType)
				 this.resultContent = EncodeUtils.hexEncode(this.sourceContent);
			 else if ("hexDecode" === this.selectedType)
				 this.resultContent = EncodeUtils.hexDecode(this.sourceContent);
			 else if ("html2js" === this.selectedType)
				 this.resultContent = EncodeUtils.html2js(this.sourceContent);
			 else if ("sha1Encode" === this.selectedType)
				 this.resultContent = EncodeUtils.sha1Encode(this.sourceContent);
			 else if ("htmlEntityEncode" === this.selectedType)
				 this.resultContent = he.encode(this.sourceContent, {
					 useNamedReferences: !0,
					 allowUnsafeSymbols: !0
				 });
			 else if ("htmlEntityFullEncode" === this.selectedType)
				 this.resultContent = he.encode(this.sourceContent, {
					 encodeEverything: !0,
					 useNamedReferences: !0,
					 allowUnsafeSymbols: !0
				 });
			 else if ("htmlEntityDecode" === this.selectedType)
				 this.resultContent = he.decode(this.sourceContent, {
					 isAttributeValue: !1
				 });
			 else if ("urlParamsDecode" === this.selectedType) {
				 let e = EncodeUtils.urlParamsDecode(this.sourceContent);
				 e.error ? this.resultContent = e.error : this.urlResult = e
			 }
			 */



			// 转码
			convertData(value) {
				console.log(value);
				if (value === "") {
					uni.showToast({
						icon: 'none',
						title: '输入框不能为空',
						duration: 1000
					});
					return false;
				}
				this.convertValue = this.convertCurrency(value)
			},
			convertCurrency(value) {
				this.isCopy = false
				console.log(value);
				const encodeString = EncodeUtils.base64Encode(EncodeUtils.utf8Encode(value));
				console.log(encodeString);
				this.convertValue = encodeString;
				this.isCopy = true
				return encodeString
			},
			clipboardData() {
				if (!this.isCopy) {
					return
				}
				uni.setClipboardData({
					data: this.convertValue,
					success: function() {
						console.log('success');
						uni.showToast({
							title: '复制成功',
							duration: 1000
						});
					}
				});
			},


			// 解码
			convertData1(value) {
				console.log(value);
				if (value === "") {
					uni.showToast({
						icon: 'none',
						title: '输入框不能为空',
						duration: 1000
					});
					return false;
				}
				this.convertValue1 = this.convertCurrency1(value)
			},
			convertCurrency1(value) {
				this.isCopy1 = false
				console.log(value);
				const decodeString = EncodeUtils.utf8Decode(EncodeUtils.base64Decode(value));
				console.log(decodeString);
				if (decodeString) {
					this.convertValue1 = decodeString;
					this.isCopy1 = true
					return decodeString
				} else {
					uni.showToast({
						icon: 'error',
						title: '无法解码',
						duration: 1000
					});
				}
			},
			clipboardData1() {
				if (!this.isCopy1) {
					return
				}
				uni.setClipboardData({
					data: this.convertValue1,
					success: function() {
						console.log('success');
						uni.showToast({
							title: '复制成功',
							duration: 1000
						});
					}
				});
			},

			// md5
			convertData3(value) {
				console.log(value);
				// if (value === "") {
				// 	uni.showToast({
				// 		icon: 'none',
				// 		title: '输入框不能为空',
				// 		duration: 1000
				// 	});
				// 	return false;
				// }
				this.convertValue3 = this.convertCurrency3(value)
			},
			convertCurrency3(value) {
				this.isCopy3 = false
				console.log(value);
				const decodeString = EncodeUtils.md5(value);
				console.log(decodeString);
				if (decodeString) {
					this.convertValue3 = decodeString;
					this.isCopy3 = true
					return decodeString
				} else {
					uni.showToast({
						icon: 'error',
						title: '无法解码',
						duration: 1000
					});
				}
			},
			clipboardData3() {
				if (!this.isCopy3) {
					return
				}
				uni.setClipboardData({
					data: this.convertValue3,
					success: function() {
						console.log('success');
						uni.showToast({
							title: '复制成功',
							duration: 1000
						});
					}
				});
			},
		}
	}
</script>

<style lang="less">
	.content {
		padding: 20px;

		.uni-input {
			border: 1px solid #ccc;
			border-radius: 5px;
			min-height: 25px;
			width: 93.333%;
			padding: 10px;
		}

		.content-input {
			margin-bottom: 20px;
		}

		.line {
			border-bottom: 1px solid #000;
			width: 100%;
			margin: 50px 0;
		}
	}
</style>