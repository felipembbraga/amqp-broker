/// <reference types="node" />
import { BrokerConfig } from './broker_default_config';
import { Options, Channel, ConsumeMessage } from 'amqplib';
export declare const logger: any;
/**
 * Opções para exchange
 */
export interface BrokerExchangeOptions {
    publishTimeout: number;
    persistent: boolean;
    durable: boolean;
    autoDelete: boolean;
    alternateExchange: string;
    arguments: any;
}
/**
 * Opções para queue
 */
export interface BrokerQueueOptions {
    exclusive: boolean;
    durable: boolean;
    autoDelete: boolean;
    arguments: any;
    limit: number;
    queueLimit: number;
}
/**
 * Configurações
 */
export declare type BrokerExchangeType = 'fanout' | 'direct' | 'topic';
export declare class Broker {
    private _config;
    private _bindings;
    private _queues;
    private _exchanges;
    private _noAck;
    private _connection;
    private _channel?;
    private _consumes;
    constructor(_config: BrokerConfig);
    noAck: boolean;
    readonly conn: any;
    readonly channel: Channel | undefined;
    close(): void;
    connect(): Promise<void>;
    addConsume(queue: string, cb: (msg: ConsumeMessage | null) => any, init?: boolean): Promise<void>;
    private createQueue;
    init(): Promise<void>;
    addExchange(name: string, type: BrokerExchangeType, options: BrokerExchangeOptions): Promise<void>;
    deleteExchange(name: string): Promise<void>;
    addQueue(name: string, options: BrokerQueueOptions): Promise<void>;
    deleteQueue(name: string): Promise<void>;
    addBinding(target: string, exchange: string, keys: string): Promise<void>;
    send(ex: string, key: string, msg: string | Object, options?: any, noAck?: boolean): void;
    sendToQueue: (queue: string, content: Buffer, options?: Options.Publish | undefined) => void;
}
