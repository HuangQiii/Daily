const url = require('url');
const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
	const path = url.parse(req.url).path.slice(1);
	if(path === 'data') {
		https.get('https://otherweb/api/v1/data', (resp) => {
			let data = "";
			resp.on('data', chunk => {
				data += chunk;
			});
			resp.on('end', () => {
				res.writeHead(200, {
					'Content-Type': 'application/json; charset=utf-8'
				});
				res.end(data);
			});
		})		
	}
}).listen(3000, '127.0.0.1');
