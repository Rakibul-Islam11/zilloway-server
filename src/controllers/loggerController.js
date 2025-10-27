const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.simple()
    ),
    transports: [
        new transports.Console({
            format: format.combine(format.colorize(), format.simple())
        }),
    ],
});

module.exports = logger;
