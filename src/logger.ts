import * as chalk from "chalk";
import * as winston from "winston";

const error = chalk.bold.red;
const info = chalk.rgb(0, 200, 200);
const warning = chalk.keyword("orange");

const format = winston.format.printf(({ level, message, label, timestamp}) => {
    switch (level) {
        case "error":
            return error(`${timestamp} [${label}] ${level}: ${message}`);
        case "info":
            return info(`${timestamp} [${label}] ${level}: ${message}`);
        case "warn":
            return warning(`${timestamp} [${label}] ${level}: ${message}`);
    
        default:
            return `${timestamp} [${label}] ${level}: ${message}`;
    }
    
})


export const factoryLogger = (options?: winston.LoggerOptions): winston.Logger => winston.createLogger({
    transports: [
        new winston.transports.Console({ format: winston.format.colorize()})
    ],
    format: winston.format.combine(
        winston.format.label({label: "rabbitmq"}),
        winston.format.timestamp(),
        format
    ),
    ...options,
})