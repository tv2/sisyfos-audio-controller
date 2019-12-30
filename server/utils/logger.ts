const winston = require('winston')
const Elasticsearch = require('winston-elasticsearch')
const processArgs = require('minimist')(process.argv.slice(2))

const loggerIp = processArgs.loggerIp || "0.0.0.0"
const loggerPort = processArgs.loggerPort || 9200

console.log('Elastic Ip :', loggerIp)
console.log('Elastic Port :', loggerPort)

const esTransportOpts = {
  level: 'info',
  clientOpts: { node: 'http://'+ loggerIp + ':' + String(loggerPort) }
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "logfile.log", level: 'error' }), //save errors on file
    new Elasticsearch(esTransportOpts) //everything info and above goes to elastic
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ //we also log to console if we're not in production
    format: winston.format.simple()
  }))
}

export { logger }