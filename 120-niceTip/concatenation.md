```js
var combined = "";
for (var i = 0; i < 1000000; i++) {
    combined = combined + "hello ";
}
```

In JavaScript (and C# for that matter) strings are immutable. They can never be changed, only replaced with other strings. You're probably aware that combined + "hello " doesn't directly modify the combined variable - the operation creates a new string that is the result of concatenating the two strings together, but you must then assign that new string to the combined variable if you want it to be changed.

So what this loop is doing is creating a million different string objects, and throwing away 999,999 of them. Creating that many strings that are continually growing in size is not fast, and now the garbage collector has a lot of work to do to clean up after this.

所以当要做大量字符串拼接，一般在一个循环里做这样的操作时，

```js
var parts = [];
for (var i = 0; i < 1000000; i++) {
    parts.push("hello");
}
var combined = parts.join(" ");
```

测试链接：

https://jsperf.com/string-concatenation101