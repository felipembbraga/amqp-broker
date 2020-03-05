import * as chalk from "chalk";
import * as winston from "winston";

const error = chalk.bold.red;
const info = chalk.rgb(150, 200, 255);
const warning = chalk.keyword("orange");

const format = winston.format.printf(({ level, message, label, timestamp}) => {
    switch (level) {
        case "error":
            return error(`${timestamp} [${label}] => ${message}`);
        case "info":
            return info(`${timestamp} [${label}] => ${message}`);
        case "warn":
            return warning(`${timestamp} [${label}] => ${message}`);
    
        default:
            return `${timestamp} [${label}] => ${message}`;
    }
    
})


export const factoryLogger = (label: string = "rabbitmq", options?: winston.LoggerOptions): winston.Logger => winston.createLogger({
    transports: [
        new winston.transports.Console({ format: winston.format.colorize()})
    ],
    format: winston.format.combine(
        winston.format.label({label}),
        winston.format.timestamp(),
        format
    ),
    ...options,
})