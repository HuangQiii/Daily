## get和post的区别

先上结论，get和post的本质区别就是语义。

从[RFC7231](https://tools.ietf.org/html/rfc7231)(RFC: Request For Comments, 征求意见稿, 简单理解为规范或者协议)的[Section 4](https://tools.ietf.org/html/rfc7231#section-4.1)中：

> The request method token is the primary source of request semantics; it indicates the purpose for which the client has made this request and what is expected by the client as a successful result.

对于HTTP请求来说，(get和post都是HTTP请求)，语法是请求响应的格式，比如要求第一行是`方法名 URI 协议/版本`这样的格式，凡是符合这个格式的请求都是合法的。

语义则定义了这一类型的请求具有什么样的性质。比如GET的语义就是「获取资源」，POST的语义是「处理资源」，那么在具体实现这两个方法时，就必须考虑其语义，做出符合其语义的行为。

### RFC7231中定义了HTTP方法的几个特性：

1. Safe: 如果一个方法的语义在本质上是「只读」的，那么这个方法就是安全的。客户端向服务端的资源发起的请求如果使用了是安全的方法，就不应该引起服务端任何的状态变化，因此也是无害的。 RFC定义，GET, HEAD, OPTIONS 和 TRACE 这几个方法是安全的。
2. Idempotent：同一个请求方法执行多次和仅执行一次的效果完全相同。按照RFC规范，PUT，DELETE和安全方法都是幂等的。引入幂等主要是为了处理同一个请求重复发送的情况，比如在请求响应前失去连接，如果方法是幂等的，就可以放心地重发一次请求。这也是浏览器在后退/刷新时遇到POST会给用户提示的原因：POST语义不是幂等的，重复请求可能会带来意想不到的后果。
3. Cacheable：是否可以被缓存，此RFC里GET，HEAD和某些情况下的POST都是可缓存的，但是绝大多数的浏览器的实现里仅仅支持GET和HEAD。

这三个特性里一直在表达一个事实，`协议不等于实现`。

所以对比一些常见的回答，

- get请求被认为是无害的，post是'有害'的，这是从Safe的角度看的
- post请求后退或刷新时被有提示，这是从Idempotent角度看的
- get可以被收藏，可以被缓存，而post都不行，这是从Cacheable角度看的
- get参数保留在历史纪录中，这是从Cacheable角度看的
- get发送数据时，URL长度受限制，这是从浏览器实现角度来看的
- get只允许ASCII字符，但是其实从协议看，get的body中也是可以传入信息的
- 与post相比，get的安全性更差，因为数据在url中，这里的安全性和上面的Safe不是一个，其实get和post的安全性来说基本相同，都是透明的

### 结论

所以到最后，get和post的区别本质上是语义的不同，不同的语义选择了不同的方法，不同的方法有不同的特性，不同的特性有不同的表现（比如上面的表现），而浏览器的实现又带来了进一步的不同。

get语义：

> The GET method requests transfer of a current selected representation for the target resource. GET is the primary mechanism of information retrieval and the focus of almost all performance optimizations. Hence, when people speak of retrieving some identifiable information via HTTP, they are generally referring to making a GET request.
A payload within a GET request message has no defined semantics; sending a payload body on a GET request might cause some existing implementations to reject the request.

post语义：

> The POST method requests that the target resource process the representation enclosed in the request according to the resource's own specific semantics.

GET的语义是请求获取指定的资源。GET方法是安全、幂等、可缓存的（除非有 Cache-Control Header的约束）,GET方法的报文主体没有任何语义。

POST的语义是根据请求负荷（报文主体）对指定的资源做出处理，具体的处理方式视资源类型而不同。POST不安全，不幂等，（大部分实现）不可缓存。

参考：

- [问题来源](https://zhuanlan.zhihu.com/p/32565654)
- [RFC](https://tools.ietf.org/html/rfc7231#section-4)
- [99%的人都理解错了HTTP中GET与POST的区别](https://mp.weixin.qq.com/s?__biz=MzI3NzIzMzg3Mw==&mid=100000054&idx=1&sn=71f6c214f3833d9ca20b9f7dcd9d33e4#rd)
- [听说『99% 的人都理解错了 HTTP 中 GET 与 POST 的区别』？？](https://zhuanlan.zhihu.com/p/25028045)
- [《图解HTTP》读书笔记](https://sunshinevvv.coding.me/blog/2017/01/26/%E5%9B%BE%E8%A7%A3HTTP-%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0/)
- [MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP)
- [HTTP协议中GET和POST方法的区别](https://sunshinevvv.coding.me/blog/2017/02/09/HttpGETv.s.POST/)
- [HTTP/2](https://www.zhihu.com/question/24774343/answer/96586977)
- [HTTP/2.0相比1.0有哪些重大改进](https://www.zhihu.com/question/34074946/answer/75364178)