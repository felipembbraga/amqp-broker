"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var broker_default_config_1 = require("./broker_default_config");
var logging_1 = require("logging");
var uuidv4 = require("uuid/v4");
var amqplib_1 = require("amqplib");
exports.logger = logging_1.default('broker');
var Broker = /** @class */ (function () {
    function Broker(_config) {
        var _this = this;
        this._bindings = [];
        this._queues = [];
        this._exchanges = [];
        this._noAck = false;
        this._connection = null;
        this._consumes = new Map();
        this.createQueue = function (q) { return __awaiter(_this, void 0, void 0, function () {
            var queue, needed_binding, _i, needed_binding_1, b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._channel) {
                            throw new Error('channel not initialized');
                        }
                        exports.logger.info("createQueue q = " + JSON.stringify(q));
                        return [4 /*yield*/, this._channel.assertQueue(q.name, q.options)];
                    case 1:
                        queue = _a.sent();
                        needed_binding = this._config.binding.filter(function (b) { return b.target === queue.queue; });
                        _i = 0, needed_binding_1 = needed_binding;
                        _a.label = 2;
                    case 2:
                        if (!(_i < needed_binding_1.length)) return [3 /*break*/, 5];
                        b = needed_binding_1[_i];
                        exports.logger.info("initQueueCB: binding - " + JSON.stringify(b));
                        return [4 /*yield*/, this._channel.bindQueue(b.target, b.exchange, b.keys)];
                    case 3:
                        _a.sent();
                        this._channel.consume(b.target, this._consumes.get(b.target), { noAck: !this.noAck });
                        exports.logger.info("initQueueCB: consume - " + b.target + " is ok");
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.sendToQueue = function (queue, content, options) {
            if (!_this._channel) {
                throw new Error('channel not initialized');
            }
            _this._channel.sendToQueue(queue, content, options);
        };
        this._config = Object.assign({}, broker_default_config_1.defaultConfig, _config);
    }
    Object.defineProperty(Broker.prototype, "noAck", {
        get: function () {
            return this._noAck;
        },
        set: function (_noAck) {
            this._noAck = _noAck;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Broker.prototype, "conn", {
        get: function () {
            return this._connection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Broker.prototype, "channel", {
        get: function () {
            return this._channel;
        },
        enumerable: true,
        configurable: true
    });
    Broker.prototype.close = function () {
        if (this._channel) {
            this._channel.close();
        }
    };
    Broker.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, options, _a, _b, e_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this._connection !== null) {
                            exports.logger.info("[connect] looks like broker is already connected, skip");
                            return [2 /*return*/];
                        }
                        if (!this._config.connection.host) {
                            throw "rabbitMQ host name is undefined! unable to connect";
                        }
                        if (!this._config.connection.port) {
                            this._config.connection.port = '5672';
                        }
                        url = {
                            protocol: this._config.connection.protocol,
                            hostname: this._config.connection.host,
                            port: parseInt(this._config.connection.port),
                            username: this._config.connection.user,
                            password: this._config.connection.pass
                        };
                        options = this._config.connection.protocol == 'amqps' ? {
                            ca: [this._config.connection.certificate],
                        } : {};
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        exports.logger.info("[connect] going to connect to " + this._config.connection.host + ":" + this._config.connection.port);
                        _a = this;
                        return [4 /*yield*/, amqplib_1.connect(url, options)];
                    case 2:
                        _a._connection = _c.sent();
                        _b = this;
                        return [4 /*yield*/, this._connection.createChannel()];
                    case 3:
                        _b._channel = _c.sent();
                        this._connection.on("error", function (err) {
                            _this._connection = null;
                            if (err.message !== "connection closing") {
                                exports.logger.error("[Broker-AMQP] conn error: ", err.message);
                            }
                        });
                        this._connection.on("close", function () {
                            _this._connection = null;
                            exports.logger.error("[Brokeurlr-AMQP] reconnecting ..");
                            setTimeout(_this.connect, 1000);
                        });
                        exports.logger.info("[connect] connected to " + this._config.connection.host + ":" + this._config.connection.port + " is ok!");
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _c.sent();
                        exports.logger.error(e_1.message);
                        exports.logger.info('ERROR! [connect] on trying to connection to ' + url);
                        this._connection = null;
                        setTimeout(this.connect, 1000);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Broker.prototype.addConsume = function (queue, cb, init) {
        if (init === void 0) { init = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._consumes.set(queue, cb);
                        if (!init) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        if (!this._channel) {
                            throw new Error('channel not initialized');
                        }
                        return [4 /*yield*/, this._channel.consume(queue, cb, { noAck: !this.noAck })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Broker.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_2, _i, _a, v;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, Promise.all(this._config.exchanges.map(function (ex) {
                                if (_this._channel) {
                                    _this._channel.assertExchange(ex.name, ex.type, ex.options);
                                }
                            }))];
                    case 3:
                        _b.sent();
                        exports.logger.info("init exchanges ok");
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _b.sent();
                        exports.logger.info(e_2);
                        return [3 /*break*/, 5];
                    case 5:
                        _i = 0, _a = this._config.queues;
                        _b.label = 6;
                    case 6:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        v = _a[_i];
                        return [4 /*yield*/, this.createQueue(v)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 6];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Broker.prototype.addExchange = function (name, type, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._channel) {
                            throw new Error('channel not initialized');
                        }
                        return [4 /*yield*/, this._channel.assertExchange(name, type, options)];
                    case 1:
                        _a.sent();
                        this._exchanges.push({ name: name, type: type, options: options });
                        return [2 /*return*/];
                }
            });
        });
    };
    Broker.prototype.deleteExchange = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._channel) {
                            throw new Error('channel not initialized');
                        }
                        return [4 /*yield*/, this._channel.deleteExchange(name)];
                    case 1:
                        _a.sent();
                        this._exchanges = this._exchanges.filter(function (e) { return e.name !== name; });
                        return [2 /*return*/];
                }
            });
        });
    };
    Broker.prototype.addQueue = function (name, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._channel) {
                            throw new Error('channel not initialized');
                        }
                        return [4 /*yield*/, this._channel.assertQueue(name, options)];
                    case 1:
                        _a.sent();
                        this._queues.push({ name: name, options: options });
                        return [2 /*return*/];
                }
            });
        });
    };
    Broker.prototype.deleteQueue = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._channel) {
                            throw new Error('channel not initialized');
                        }
                        return [4 /*yield*/, this._channel.purgeQueue(name)];
                    case 1:
                        _a.sent();
                        this._queues = this._queues.filter(function (q) { return q.name !== name; });
                        return [2 /*return*/];
                }
            });
        });
    };
    Broker.prototype.addBinding = function (target, exchange, keys) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._channel) {
                            throw new Error('channel not initialized');
                        }
                        return [4 /*yield*/, this._channel.bindQueue(target, exchange, keys)];
                    case 1:
                        _a.sent();
                        this._bindings.push({ target: target, exchange: exchange, keys: keys });
                        return [2 /*return*/];
                }
            });
        });
    };
    Broker.prototype.send = function (ex, key, msg, options, noAck) {
        if (options === void 0) { options = null; }
        if (noAck === void 0) { noAck = true; }
        if (!this._channel) {
            throw new Error('channel not initialized');
        }
        var _options = {
            persistent: false,
            noAck: noAck,
            timestamp: Date.now(),
            contentEncoding: "utf-8",
            contentType: "application/json",
            headers: {
                messageId: uuidv4(),
                source: ex + ":" + key
            }
        };
        options = options === null ? _options : options;
        var msgToSend = typeof msg === 'object' ? JSON.stringify(msg) : msg;
        this._channel.publish(ex, key, Buffer.from(msgToSend), options);
    };
    return Broker;
}());
exports.Broker = Broker;
