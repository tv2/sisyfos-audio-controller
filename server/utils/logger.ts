import winston from 'winston'
import Elasticsearch from 'winston-elasticsearch'
const processArgs = require('minimist')(process.argv.slice(2))

const loggerIp = process.env.loggerIp || processArgs.loggerIp || '0.0.0.0'
const loggerPort = process.env.loggerPort || processArgs.loggerPort || 9200
const loggerLevel = process.env.loggerLevel || processArgs.loggerLevel || 'info'
const loggerFileLevel =
    process.env.loggerFileLevel || processArgs.loggerFileLevel || 'error'
const loggerConsoleLevel =
    process.env.loggerConsoleLevel || processArgs.loggerConsoleLevel || 'error'

console.log('Elastic Ip :', loggerIp)
console.log('Elastic Port :', loggerPort)

const esTransportOpts = {
    level: loggerLevel,
    indexPrefix: 'sisyfos',
    clientOpts: { node: 'http://' + loggerIp + ':' + String(loggerPort) },
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({
            filename: 'logfile.log',
            level: loggerFileLevel,
        }), //save errors on file
        new winston.transports.Console({ level: loggerConsoleLevel }), //save errors on file
        new Elasticsearch.ElasticsearchTransport(esTransportOpts), //everything info and above goes to elastic
    ],
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            //we also log to console if we're not in production
            format: winston.format.simple(),
        })
    )
}

export { logger }
