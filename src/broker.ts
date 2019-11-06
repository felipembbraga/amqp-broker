import createLogger from "logging";
import * as uuidv4 from "uuid/v4";
import { connect, Options, Channel, ConsumeMessage } from "amqplib";

export const logger = createLogger("broker");

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
export const defaultConfig: Config = {
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
export type ExchangeType = "fanout" | "direct" | "topic";

export type PublishOptions = {
  exchange: string;
  key: string;
  msg: string | Object;
  options: Options.Publish;
  rpc: boolean;
};

export type SendToQueueOptions = {
  queue: string;
  msg: string | Object;
  options: Options.Publish;
  rpc: boolean;
};

/**
 * Classe principal do mensageiro
 */
export class Broker {
  private _config: Config; // Configurações
  private _queues: Queue[] = []; // Queues do Broker
  private _exchanges: Exchange[] = []; // Exchanges do Broker
  private _noAck: boolean = false; // Acknowledgement (confirmação)
  private _connection: any = null; // Conexão com o Rabbitmq
  private _channel?: Channel; // Canal criado para o Rabbitmq
  private _consumes = new Map<string, any>(); // Funções que consomem as mensagens

  /**
   * Construtor
   * @param _config Configurações do Broker
   */
  public constructor(_config: Config) {
    this._config = Object.assign({}, defaultConfig, _config);
    this._exchanges = this._config.exchanges;
    this._queues = this._config.queues;
  }

  /**
   * Set a sleep time
   * 
   * @param ms miliseconds
   */
  public sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * noAck
   */
  public get noAck() {
    return this._noAck;
  }

  /**
   * noAck
   */
  public set noAck(_noAck: boolean) {
    this._noAck = _noAck;
  }

  /**
   * Connection
   */
  public get conn() {
    return this._connection;
  }

  /**
   * Channel
   */
  public get channel() {
    return this._channel;
  }

  /**
   * Connect with RabbitMQ
   */
  private connect = async () => {
    // Verify if is already connected
    if (this._connection !== null) {
      logger.info("[connect] your broker is already connected.");
      return;
    }

    // Connection options
    const port: number = this._config.connection.port
      ? parseInt(this._config.connection.port)
      : 5672;

    const url: Options.Connect = {
      protocol: this._config.connection.protocol,
      hostname: this._config.connection.host,
      port: port,
      username: this._config.connection.user,
      password: this._config.connection.pass
    };

    // Verify if have a SSL certificate
    const options: any =
      this._config.connection.protocol == "amqps"
        ? {
            ca: [this._config.connection.certificate]
          }
        : {};

    // Try connect
    try {
      logger.info(
        `[connect] going to connect to ${this._config.connection.host}:${this._config.connection.port}`
      );

      this._connection = await connect(
        url,
        options
      );
      // Save the channel
      this._channel = await this._connection.createChannel();

      // Connection events
      this._connection.on("error", (err: any) => {
        this._connection = null;
        if (err.message !== "connection closing") {
          logger.error("Conn error: ", err.message);
        }
      });

      this._connection.on("close", () => {
        this._connection = null;
        logger.error("Connection closed!");
        logger.error("reconnecting ..");

        // Try to reconnect
        setTimeout(this.connect, 1000);
      });
      logger.info(
        `[connect] connected to ${this._config.connection.host}:${this._config.connection.port} is ok!`
      );
    } catch (e) {
      logger.error("Error trying to connection to " + url);
      logger.error(e.message);
      this._connection = null;
      
      // Try to reconnect
      setTimeout(this.connect, 1000);
    }
  }

  /**
   * Close the channel connection connection
   */
  public async close() {
    if (this._channel) {
      await this._channel.close();
    }

    logger.info("Connection is closed!");
  }

  /**
   * Initialize the Broker service
   */
  public async init() {

    // Connect to RabbitMQ
    await this.connect();

    // Assert all exchanges
    try {
      await Promise.all(
        this._exchanges.map((ex: any) => {
          if (this._channel) {
            this._channel.assertExchange(ex.name, ex.type, ex.options);
          }
        })
      );

      logger.info("init exchanges ok");
    } catch (e) {
      logger.info(e);
    }

    // assert and bind all queues
    for (let v of this._queues) {
      await this.createQueue(v);
    }

    logger.info("Initialization is done");
    return
  }

  /**
   * Add the consumer into the broker
   * 
   * @param queue queue name
   * @param cb Consumer function
   */
  public addConsume(queue: string, cb: (msg: ConsumeMessage) => Promise<Object>) {

    this._consumes.set(queue, async (msg: ConsumeMessage) => {
      logger.info("Running consumer " + queue);
      // Call the consumer function
      let response = await cb(msg);

      // Verify if exists a replyTo queue to send back
      if (this._channel) {
        this._channel.ack(msg);
        if (msg.properties.replyTo) {
          logger.info("Replying to " + msg.properties.replyTo);

          // Send back to broker sender
          this._channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response))
          );
        }
      }
    });
  }

  /**
   * Assert a queue and bind to a exchange
   * 
   * @param q Queue options
   */
  private createQueue = async (q: Queue) => {
    if (!this._channel) {
      throw new Error("channel not initialized");
    }
    if (!this._consumes.get(q.name)) {
      throw new Error(`Consumer to queue ${q.name} not defined.`);
    }

    logger.info("Creating queue " + q.name);
    let queue = await this._channel.assertQueue(q.name, q.options);
    if (q.exchange) {
      const key: string = q.key || q.name;
      await this._channel.bindQueue(queue.queue, q.exchange, key);
    }

    console.log(this._consumes)
    console.log(queue.queue)
    await this._channel.consume(queue.queue, this._consumes.get(queue.queue), q.options);
    logger.info(`initQueue: consume - ${q.key} is ok`);
  };

  private getMessageToSend(msg: string | Object) {
    return typeof msg === "object" ? JSON.stringify(msg) : msg;
  }

  /**
   * Create a consumer to receive response from a worker
   * 
   * @param replyTo queue to reply
   * @param exchange Exchange to queue
   */
  private async consumeResponse(
    replyTo: string,
    exchange? : string
  ): Promise<string> {
    if (!this._channel) {
      throw new Error("channel not initialized");
    }
    // create a queue with replyTo name
    const q = await this._channel.assertQueue(replyTo, {
      durable: false,
      autoDelete: true
    });

    // bind the queue with exchange
    if(exchange) {
      await this._channel.bindQueue(q.queue, exchange, replyTo);
    }

    // wait for response
    const response = await this._channel.get(q.queue);

    // If is false, try again
    if (!response) {
      await this.sleep(100);
      return this.consumeResponse(replyTo, exchange);
    }

    // return the string value
    return response.content.toString();
  }

  /**
   * publish a message to a exchange key pattern
   * 
   * @param publishOptions options to publish
   */
  public async publishMessage(publishOptions: PublishOptions) {
    let response;
    let replyTo = ""
    if (publishOptions.rpc) {
      replyTo = uuidv4();
      publishOptions.options.replyTo = replyTo;
    }
    console.log("publishing...");
    console.log(publishOptions.msg);
    
    // publish the message
    this.publish(
      publishOptions.exchange,
      publishOptions.key,
      publishOptions.msg,
      publishOptions.options
    );

    // if rpc is setted, wait from the response to return
    if(publishOptions.rpc) {
      response = this.consumeResponse(replyTo, publishOptions.exchange);
    }
    
    return await response;
  }

  /**
   * Publish a message
   * @param exchange Exchange name
   * @param key key
   * @param msg Data to send
   * @param options Exchange publish options
   */
  private publish(
    exchange: string,
    key: string,
    msg: string | Object,
    options: Options.Publish
  ) {
    if (!this._channel) {
      throw new Error("channel not initialized");
    }

    let msgToSend = this.getMessageToSend(msg);

    return this._channel.publish(
      exchange,
      key,
      Buffer.from(msgToSend),
      options
    );
  }

  /**
   * Send a message to a especific queue
   * 
   * @param sendOptions Options to send
   */
  public async sendMessage(sendOptions : SendToQueueOptions) {
    let response;

    // if rpc is setted, wait from the response to return
    if (sendOptions.rpc) {
      const replyTo = uuidv4();
      response = this.consumeResponse(replyTo);
    }
    this.sendToQueue(
      sendOptions.queue,
      sendOptions.msg,
      sendOptions.options
    );

    return await response;
  }

  /**
   * send a message to a queue
   */
  private sendToQueue = (
    queue: string,
    content: string | Object,
    options?: Options.Publish
  ) => {
    if (!this._channel) {
      throw new Error("channel not initialized");
    }

    let msgToSend = this.getMessageToSend(content);

    this._channel.sendToQueue(queue, Buffer.from(msgToSend), options);
  };
}
