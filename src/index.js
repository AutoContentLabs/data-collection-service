const { collectData } = require('./services/dataCollector');

setInterval(() => {
  collectData();
}, 1000 * 30); // Her saat başı çalışacak (3600000 ms = 1 saat)

console.log("data-collection-service:start")
