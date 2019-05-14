require('http').createServer((req, res) => {
	res.writeHead(200, {
		'Access-Control-Allow-Origin': 'http://localhost:8080',
		'Content-Type': 'text/html;charset=utf-8',
	});
	res.end('data to send');

}).listen(3000, '127.0.0.1');
