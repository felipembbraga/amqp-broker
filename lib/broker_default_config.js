"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = {
    connection: {
        user: process.env.QUEUE_USERNAME,
        pass: process.env.QUEUE_PASSWORD,
        host: process.env.QUEUE_SERVER || 'localhost',
        port: process.env.QUEUE_PORT || '5672',
        protocol: process.env.QUEUE_PROTOCOL || 'amqp',
        certificate: Buffer.from(process.env.QUEUE_CERTIFICATE || ''),
        timeout: 2000,
        name: "rabbitmq"
    },
    exchanges: [],
    queues: [],
    binding: [],
    logging: {
        adapters: {
            stdOut: {
                level: 3,
                bailIfDebug: true
            }
        }
    }
};
