"use strict";
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
var chalk = require("chalk");
var winston = require("winston");
var error = chalk.bold.red;
var info = chalk.rgb(150, 200, 255);
var warning = chalk.keyword("orange");
var format = winston.format.printf(function (_a) {
    var level = _a.level, message = _a.message, label = _a.label, timestamp = _a.timestamp;
    switch (level) {
        case "error":
            return error(timestamp + " [" + label + "] => " + message);
        case "info":
            return info(timestamp + " [" + label + "] => " + message);
        case "warn":
            return warning(timestamp + " [" + label + "] => " + message);
        default:
            return timestamp + " [" + label + "] => " + message;
    }
});
exports.factoryLogger = function (label, options) {
    if (label === void 0) { label = "rabbitmq"; }
    return winston.createLogger(__assign({ transports: [
            new winston.transports.Console({ format: winston.format.colorize() })
        ], format: winston.format.combine(winston.format.label({ label: label }), winston.format.timestamp(), format) }, options));
};
