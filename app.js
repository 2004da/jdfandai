const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');


// 从 config.json 文件读取配置
let config;
try {
  const configPath = path.join(__dirname, 'config.json');
  const configData = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configData);
} catch (error) {
  console.error('Error reading or parsing config.json:', error);
  process.exit(1); // 遇到错误直接退出
}


const proxyRoutes = config.proxyRoutes;


const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World');
    return;
  }
    // 匹配反向代理路由
    for (const path in proxyRoutes) {
        if (req.url.startsWith(path)) {
            const proxy = createProxyMiddleware({
                target: proxyRoutes[path],
                changeOrigin: true,
                ws: true,
              });
              proxy(req, res, (error) => {
                  if (error) {
                    console.error('Proxy error:', error);
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.end('Proxy error');
                   }

              });
              return;
        }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
