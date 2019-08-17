// ?=表示匹配模式
// ?!表示匹配非模式
'qihuangqihuang'.replace(/(?=i)/g, '#');
// "q#ihuangq#ihuang"
'qihuangqihuang'.replace(/(?!i)/g, '#');
// "#qi#h#u#a#n#g#qi#h#u#a#n#g#"
var reg1 = /(?=\d{3}$)/g;
var reg2 = /(?=(\d{3})+$)/g
var reg3 = /(?!^)(?=(\d{3})+$)/g
var reg4 = /(?!\b)(?=(\d{3})+\b)/g
var str1 = '12345678'
var str2 = '123456789'
var str3 = '12345678|123456789'
var str4 = '12345678.123456789'
str1.replace(reg1, ',')
// "12345,678"
// 只匹配一次，最后一个

str1.replace(reg2, ',')
"12,345,678"
// 匹配所有

str2.replace(reg2, ',')
// ",123,456,789"
// 匹配所有问题来了，开头不能有

str2.replace(reg3, ',')
// "123,456,789"
// ?!^表示模式，可以理解为非开头，?!和?=一个是表示不是模式，一个是是模式，?=^就匹配开头

str3.replace(reg3, ',')
// "12345678|,123,456,789"
// 问题来了，把非数字匹配进去了，这里主要是为了.演示，所以我们要把上面的非开头，替换成，非单词边界
// 单词边界就是单词和单词的中间，比如AB.C的单词边界就是[]AB[].[]C，有三个单词字母边界
// 单词边界是\b，那非单词边界就是?!\b，其中?!\b === \B，所以我这里的reg3和你发的那段，基本是一样的

str3.replace(reg4, ',')
// 12,345,678|123,456,789

function formatNumber(num) {
	return num
		.toFixed(2)
		.replace(/\B(?=(\d{3})+\b)/g, ",")
		.replace(/^/, '$$ ');
}
formatNumber(123456.75456)
// $ 123,456.75