<template>
	<view class="content">
		<view class="content-input">
			<input class="uni-input" v-model="currencyValue" type="digit" :maxlength="15" focus placeholder="请输入金额数字" />
		</view>
		<view class="content-input">
			<button type="primary" @click="convertData(currencyValue)">转换</button>
		</view>
		<view class="content-input">
			<text selectable user-select>{{convertValue}}</text>
		</view>
		<button type="primary" :disabled="!isCopy" @click="clipboardData">点击复制</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currencyValue: '',
				convertValue: '',
				isCopy: false
			};
		},
		methods: {
			convertData(value) {
				console.log(value);
				this.convertValue = this.convertCurrency(value)
			},
			clipboardData() {
				if (this.currencyValue === "") {
					uni.showToast({
						title: '输入框不能为空',
						duration: 1000
					});
				}
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
			convertCurrency(currencyDigits) {
				this.isCopy = false

				let integral, decimal, outputCharacters, parts, digits, radices, bigRadices, decimals, zeroCount, i, p, d,
					ds, quotient, modulus;
				if (typeof(currencyDigits) === 'number') currencyDigits = String(currencyDigits);
				if ("" == currencyDigits) {
					return "不能为空 请输入数字金额!如：123.23";
				}
				if (null != currencyDigits.match(/[^,.\d]/)) {
					return "输入字符串中的字符无效!";
				}
				if (null == currencyDigits.match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/)) {

					return "请输入正确的数字金额!";
				}
				if (currencyDigits = (currencyDigits = currencyDigits.replace(/,/g, "")).replace(/^0+/, ""), Number(
						currencyDigits) > 99999999999.99) {
					return "数字太大啦";
				}
				if ((parts = currencyDigits.split(".")).length > 1 ? (integral = parts[0], decimal = (decimal = parts[1])
						.substr(0,
							2)) : (integral = parts[0], decimal = ""), digits = new Array("零", "壹", "贰", "叁", "肆", "伍",
						"陆", "柒", "捌",
						"玖"), radices = new Array("", "拾", "佰", "仟"), bigRadices = new Array("", "万", "亿"), decimals =
					new Array(
						"角", "分"), outputCharacters = "", Number(integral) > 0) {
					for (zeroCount = 0, i = 0; i < integral.length; i++) quotient = (p = integral.length - i - 1) / 4,
						modulus = p %
						4, "0" == (d = integral.substr(i, 1)) ? zeroCount++ : (zeroCount > 0 && (outputCharacters +=
								digits[0]),
							zeroCount = 0, outputCharacters += digits[Number(d)] + radices[modulus]), 0 == modulus &&
						zeroCount < 4 &&
						(outputCharacters += bigRadices[quotient]);
					outputCharacters += "元"
				}
				if ("" != decimal)
					for (i = 0; i < decimal.length; i++) d = decimal.substr(i, 1), ds = decimal.substr(-1, 1),
						outputCharacters +=
						0 == d ? 0 == ds ? "" : digits[Number(d)] : digits[Number(d)] + decimals[i];
				this.isCopy = true
				return "" == outputCharacters && (outputCharacters = "零元"), "" == decimal && (outputCharacters += "整"),
					outputCharacters = "" + outputCharacters
			}
		}
	}
</script>

<style lang="less">
	.content {
		padding: 20px;

		.uni-input {
			border: 1px solid #ccc;
			border-radius: 5px;
			height: 45px;
			padding: 0 10px;
		}

		.content-input {
			margin-bottom: 20px;
		}
	}
</style>