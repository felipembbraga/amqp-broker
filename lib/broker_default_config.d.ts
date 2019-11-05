/// <reference types="node" />
/**
 * Opções para conexão com o servidor rabbitmq
 */
export interface AmqpConnection {
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
    options: any;
}
/**
 * estrutura da queue
 */
export interface Queue {
    name: string;
    options: any;
}
/**
 * extrutura do encapsulamento de uma queue em uma exchange
 */
export interface Binding {
    exchange: string;
    target: string;
    keys: string;
}
/**
 * Estrutura de Logging de um broker
 */
export interface BrokerLogging {
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
export interface BrokerConfig {
    connection: AmqpConnection;
    exchanges: Exchange[];
    queues: Queue[];
    binding: Binding[];
    logging?: BrokerLogging;
}
export declare const defaultConfig: BrokerConfig;
