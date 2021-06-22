import winston from 'winston'
const processArgs = require('minimist')(process.argv.slice(2))

const loggerConsoleLevel =
    process.env.loggerConsoleLevel || processArgs.loggerConsoleLevel || 'error'

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({ level: loggerConsoleLevel }), //save errors on console
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
