/**
 * @file src/app.js
 * @description Data Collector Application 
 */

const clusterManager = require('./cluster/clusterManager');

// Start with clustering unless in production environment
const withCluster = process.env.NODE_ENV !== "production";  // true for non-production environments
clusterManager.start(withCluster);

const http = require('http');
const promClient = require('prom-client');

// 
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

// 
const server = http.createServer((req, res) => {
    if (req.url === '/metrics') {
        res.setHeader('Content-Type', promClient.register.contentType);
        res.end(promClient.register.metrics());
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(3000, () => {
    console.log('Prometheus metrics listening on http://localhost:3000/metrics');
});
