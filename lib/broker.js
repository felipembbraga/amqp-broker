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
var amqplib_1 = require("amqplib");
var uuid_1 = require("uuid");
/**
 * Configurações padrões
 */
exports.defaultConfig = {
    connection: {
        user: process.env.QUEUE_USERNAME,
        pass: process.env.QUEUE_PASSWORD,
        host: process.env.QUEUE_SERVER || "localhost",
        port: process.env.QUEUE_PORT || "5672",
        protocol: process.env.QUEUE_PROTOCOL || "amqp",
        certificate: Buffer.from(process.env.QUEUE_CERTIFICATE || ""),
        timeout: 2000,
        name: "rabbitmq"
    },
    exchanges: [],
    queues: [],
    logging: {
        adapters: {
            stdOut: {
                level: 3,
                bailIfDebug: true
            }
        }
    }
};
/**
 * Classe principal do mensageiro
 */
var Broker = /** @class */ (function () {
    /**
     * Construtor
     * @param _config Configurações do Broker
     */
    function Broker(_config) {
        var _this = this;
        this._queues = []; // Queues do Broker
        this._exchanges = []; // Exchanges do Broker
        this._noAck = false; // Acknowledgement (confirmação)
        this._consumes = new Map(); // Funções que consomem as mensagens
        /**
         * Connect with RabbitMQ
         */
        this.connect = function () { return __awaiter(_this, void 0, void 0, function () {
            var port, url, options, _a, _b, e_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!!this._connection) return [3 /*break*/, 7];
                        port = this._config.connection.port
                            ? parseInt(this._config.connection.port)
                            : 5672;
                        url = {
                            protocol: this._config.connection.protocol,
                            hostname: this._config.connection.host,
                            port: port,
                            username: this._config.connection.user,
                            password: this._config.connection.pass
                        };
                        options = this._config.connection.protocol == "amqps"
                            ? {
                                ca: [this._config.connection.certificate]
                            }
                            : {};
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 7]);
                        console.info("[connect] going to connect to " + this._config.connection.host + ":" + this._config.connection.port);
                        _a = this;
                        return [4 /*yield*/, amqplib_1.connect(url, options)];
                    case 2:
                        _a._connection = _c.sent();
                        // Connection events
                        this._connection.on("error", function (err) {
                            _this._connection = undefined;
                            if (err.message !== "connection closing") {
                                console.error("Conn error: ", err.message);
                            }
                            else {
                                console.error("reconnecting ..");
                            }
                            setTimeout(_this.connect, 1000);
                        });
                        this._connection.on("close", function () {
                            _this._connection = undefined;
                            console.error("Connection closed!");
                            console.error("reconnecting ..");
                            // Try to reconnect
                            setTimeout(_this.connect, 1000);
                        });
                        console.info("[connect] connected to " + this._config.connection.host + ":" + this._config.connection.port + " is ok!");
                        // Save the channel
                        _b = this;
                        return [4 /*yield*/, this._connection.createChannel()];
                    case 3:
                        // Save the channel
                        _b._channel = _c.sent();
                        console.log(this._channel);
                        if (!this._channel) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._channel.prefetch(1)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_1 = _c.sent();
                        console.error("Error trying to connection to " + url);
                        console.error(e_1.message);
                        this._connection = undefined;
                        // Try to reconnect
                        setTimeout(this.connect, 1000);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, this._connection];
                }
            });
        }); };
        /**
         * Assert a queue and bind to a exchange
         *
         * @param q Queue options
         */
        this.createQueue = function (q) { return __awaiter(_this, void 0, void 0, function () {
            var queue, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._channel) {
                            throw new Error("channel not initialized");
                        }
                        if (!this._consumes.get(q.name)) {
                            throw new Error("Consumer to queue " + q.name + " not defined.");
                        }
                        console.info("Creating queue " + q.name);
                        return [4 /*yield*/, this._channel.assertQueue(q.name, q.options)];
                    case 1:
                        queue = _a.sent();
                        if (!q.exchange) return [3 /*break*/, 3];
                        key = q.key || q.name;
                        return [4 /*yield*/, this._channel.bindQueue(queue.queue, q.exchange, key)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        console.log(this._consumes);
                        console.log(queue.queue);
                        return [4 /*yield*/, this._channel.consume(queue.queue, this._consumes.get(queue.queue), q.options)];
                    case 4:
                        _a.sent();
                        console.info("initQueue: consume - " + q.key + " is ok");
                        return [2 /*return*/];
                }
            });
        }); };
        /**
         * send a message to a queue
         */
        this.sendToQueue = function (queue, content, options) {
            if (!_this._channel) {
                throw new Error("channel not initialized");
            }
            var msgToSend = _this.getMessageToSend(content);
            _this._channel.sendToQueue(queue, Buffer.from(msgToSend), options);
        };
        this._config = Object.assign({}, exports.defaultConfig, _config);
        this._exchanges = this._config.exchanges;
        this._queues = this._config.queues;
    }
    /**
     * Set a sleep time
     *
     * @param ms miliseconds
     */
    Broker.prototype.sleep = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    Object.defineProperty(Broker.prototype, "noAck", {
        /**
         * noAck
         */
        get: function () {
            return this._noAck;
        },
        /**
         * noAck
         */
        set: function (_noAck) {
            this._noAck = _noAck;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Broker.prototype, "conn", {
        /**
         * Connection
         */
        get: function () {
            return this._connection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Broker.prototype, "channel", {
        /**
         * Channel
         */
        get: function () {
            return this._channel;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Close the channel connection connection
     */
    Broker.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._channel) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._channel.close()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        console.info("Connection is closed!");
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize the Broker service
     */
    Broker.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_2, _i, _a, v;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: 
                    // Connect to RabbitMQ
                    return [4 /*yield*/, this.connect()];
                    case 1:
                        // Connect to RabbitMQ
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, Promise.all(this._exchanges.map(function (ex) {
                                if (_this._channel) {
                                    _this._channel.assertExchange(ex.name, ex.type, ex.options);
                                }
                            }))];
                    case 3:
                        _b.sent();
                        console.info("init exchanges ok");
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _b.sent();
                        console.info(e_2);
                        return [3 /*break*/, 5];
                    case 5:
                        _i = 0, _a = this._queues;
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
                    case 9:
                        console.info("Initialization is done");
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add the consumer into the broker
     *
     * @param queue queue name
     * @param cb Consumer function
     */
    Broker.prototype.addConsume = function (queue, cb) {
        var _this = this;
        this._consumes.set(queue, function (msg) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.info("Running consumer " + queue);
                        return [4 /*yield*/, cb(msg)];
                    case 1:
                        response = _a.sent();
                        // Verify if exists a replyTo queue to send back
                        if (this._channel) {
                            this._channel.ack(msg);
                            if (msg.properties.replyTo) {
                                console.info("Replying to " + msg.properties.replyTo);
                                // Send back to broker sender
                                this._channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)));
                            }
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Broker.prototype.getMessageToSend = function (msg) {
        return typeof msg === "object" ? JSON.stringify(msg) : msg;
    };
    /**
     * Create a consumer to receive response from a worker
     *
     * @param replyTo queue to reply
     * @param exchange Exchange to queue
     */
    Broker.prototype.consumeResponse = function (replyTo, exchange) {
        return __awaiter(this, void 0, void 0, function () {
            var q, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._channel) {
                            throw new Error("channel not initialized");
                        }
                        return [4 /*yield*/, this._channel.assertQueue(replyTo, {
                                durable: false,
                                autoDelete: true
                            })];
                    case 1:
                        q = _a.sent();
                        if (!exchange) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._channel.bindQueue(q.queue, exchange, replyTo)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this._channel.get(q.queue)];
                    case 4:
                        response = _a.sent();
                        if (!!response) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.sleep(100)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, this.consumeResponse(replyTo, exchange)];
                    case 6: return [4 /*yield*/, this._channel.cancel(q.queue)];
                    case 7:
                        _a.sent();
                        // return the string value
                        return [2 /*return*/, response.content.toString()];
                }
            });
        });
    };
    /**
     * publish a message to a exchange key pattern
     *
     * @param publishOptions options to publish
     */
    Broker.prototype.publishMessage = function (publishOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var response, replyTo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        replyTo = "";
                        if (!publishOptions.options) {
                            publishOptions.options = {};
                        }
                        if (publishOptions.rpc) {
                            replyTo = uuid_1.v4();
                            publishOptions.options.replyTo = replyTo;
                            response = this.consumeResponse(replyTo, publishOptions.exchange);
                        }
                        console.log("publishing...");
                        console.log(publishOptions.msg);
                        // publish the message
                        this.publish(publishOptions.exchange, publishOptions.key, publishOptions.msg, publishOptions.options);
                        return [4 /*yield*/, response];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Publish a message
     * @param exchange Exchange name
     * @param key key
     * @param msg Data to send
     * @param options Exchange publish options
     */
    Broker.prototype.publish = function (exchange, key, msg, options) {
        if (!this._channel) {
            throw new Error("channel not initialized");
        }
        var msgToSend = this.getMessageToSend(msg);
        return this._channel.publish(exchange, key, Buffer.from(msgToSend), options);
    };
    /**
     * Send a message to a especific queue
     *
     * @param sendOptions Options to send
     */
    Broker.prototype.sendMessage = function (sendOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var response, replyTo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // if rpc is setted, wait from the response to return
                        if (sendOptions.rpc) {
                            replyTo = uuid_1.v4();
                            response = this.consumeResponse(replyTo);
                        }
                        this.sendToQueue(sendOptions.queue, sendOptions.msg, sendOptions.options);
                        return [4 /*yield*/, response];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Broker;
}());
exports.Broker = Broker;
