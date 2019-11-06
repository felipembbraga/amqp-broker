/// <reference types="node" />
import { Options, Channel, ConsumeMessage } from "amqplib";
export declare const logger: any;
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
    sleep(ms: number): Promise<unknown>;
    /**
     * noAck
     */
    /**
    * noAck
    */
    noAck: boolean;
    /**
     * Conexão
     */
    readonly conn: any;
    /**
     * Canal
     */
    readonly channel: Channel | undefined;
    /**
     * Conecta com o rabbitmq
     */
    private connect;
    /**
     * Fecha a conexão
     */
    close(): Promise<void>;
    init(): Promise<void>;
    addConsume(queue: string, cb: (msg: ConsumeMessage) => Promise<Object>): void;
    private createQueue;
    private getMessageToSend;
    private consumeResponse;
    publishMessage(publishOptions: PublishOptions): Promise<string | undefined>;
    private publish;
    sendMessage(sendOptions: SendToQueueOptions): Promise<string | undefined>;
    private sendToQueue;
}
