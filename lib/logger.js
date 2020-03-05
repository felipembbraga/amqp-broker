"use strict";
// import {Category, CategoryConfiguration, CategoryLogger, CategoryServiceFactory, LogLevel} from "typescript-logging";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
// CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info));
// // Create categories, they will autoregister themselves, one category without parent (root) and a child category.
// export const factoryLogger = (name: string): CategoryLogger => new Category(name);
// import {LFService, LogGroupRule, LogLevel, Logger, LoggerFactoryOptions} from "typescript-logging";
// // Create options instance and specify 2 LogGroupRules:
// // * One for any logger with a name starting with model, to log on debug
// // * The second one for anything else to log on info
// const options = new LoggerFactoryOptions()
// .addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Info));
// // Create a named loggerfactory and pass in the options and export the factory.
// // Named is since version 0.2.+ (it's recommended for future usage)
// export const factory = LFService.createNamedLoggerFactory("LoggerFactory", options);
// export const factoryLogger = (name: string): Logger => factory.getLogger(name);
var winston = require("winston");
exports.factoryLogger = function (options) { return winston.createLogger(__assign({ transports: [
        new winston.transports.Console({ format: winston.format.colorize() })
    ], format: winston.format.colorize() }, options)); };
