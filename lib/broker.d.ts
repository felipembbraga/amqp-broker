/// <reference types="node" />
import { Options, Channel, ConsumeMessage } from "amqplib";
/**
 * Opções para conexão com o servidor rabbitmq
 */
export interface Connection {
    user?: string;
    pass?: string;
    host?: string;
    port?: string;
    protocol?: string;
    certificate?: Buffer;
    timeout?: Number;
    name?: string;
}
/**
 * estrutura do exchange
 */
export interface Exchange {
    name: string;
    type: string;
    options?: any;
}
/**
 * estrutura da queue
 */
export interface Queue {
    name: string;
    exchange?: string;
    key?: string;
    options: any;
}
/**
 * Estrutura de Logging de um broker
 */
export interface Logging {
    adapters?: {
        stdOut?: {
            level?: Number;
            bailIfDebug?: Boolean;
        };
    };
}
/**
 * Estrutura de configuração do Broker
 */
export interface Config {
    connection: Connection;
    logging?: Logging;
    exchanges: Exchange[];
    queues: Queue[];
}
/**
 * Configurações padrões
 */
export declare const defaultConfig: Config;
/**
 * Opções para exchange
 */
export interface ExchangeOptions {
    publishTimeout: number;
    persistent: boolean;
    durable: boolean;
    internal: boolean;
    autoDelete: boolean;
    alternateExchange: string;
    arguments: any;
}
/**
 * Opções para queue
 */
export interface QueueOptions {
    exclusive: boolean;
    durable: boolean;
    autoDelete: boolean;
    arguments: any;
    messageTtl: number;
    expires: number;
    deadLetterExchange: string;
    maxLength: number;
    maxPriority: number;
    limit: number;
    queueLimit: number;
}
/**
 * tipos de exchanges
 */
export declare type ExchangeType = "fanout" | "direct" | "topic";
export declare type PublishOptions = {
    exchange: string;
    key: string;
    msg: string | Object;
    options: Options.Publish;
    rpc: boolean;
};
export declare type SendToQueueOptions = {
    queue: string;
    msg: string | Object;
    options: Options.Publish;
    rpc: boolean;
};
/**
 * Classe principal do mensageiro
 */
export declare class Broker {
    private _config;
    private _queues;
    private _exchanges;
    private _noAck;
    private _connection;
    private _channel?;
    private _consumes;
    /**
     * Construtor
     * @param _config Configurações do Broker
     */
    constructor(_config: Config);
    /**
     * Set a sleep time
     *
     * @param ms miliseconds
     */
    sleep(ms: number): Promise<unknown>;
    /**
     * noAck
     */
    /**
    * noAck
    */
    noAck: boolean;
    /**
     * Connection
     */
    readonly conn: any;
    /**
     * Channel
     */
    readonly channel: Channel | undefined;
    /**
     * Connect with RabbitMQ
     */
    private connect;
    /**
     * Close the channel connection connection
     */
    close(): Promise<void>;
    /**
     * Initialize the Broker service
     */
    init(): Promise<void>;
    /**
     * Add the consumer into the broker
     *
     * @param queue queue name
     * @param cb Consumer function
     */
    addConsume(queue: string, cb: (msg: ConsumeMessage) => Promise<Object>): void;
    /**
     * Assert a queue and bind to a exchange
     *
     * @param q Queue options
     */
    private createQueue;
    private getMessageToSend;
    /**
     * Create a consumer to receive response from a worker
     *
     * @param replyTo queue to reply
     * @param exchange Exchange to queue
     */
    private consumeResponse;
    /**
     * publish a message to a exchange key pattern
     *
     * @param publishOptions options to publish
     */
    publishMessage(publishOptions: PublishOptions): Promise<string | undefined>;
    /**
     * Publish a message
     * @param exchange Exchange name
     * @param key key
     * @param msg Data to send
     * @param options Exchange publish options
     */
    private publish;
    /**
     * Send a message to a especific queue
     *
     * @param sendOptions Options to send
     */
    sendMessage(sendOptions: SendToQueueOptions): Promise<string | undefined>;
    /**
     * send a message to a queue
     */
    private sendToQueue;
}
