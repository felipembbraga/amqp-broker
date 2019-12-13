# AMQP-Broker

[![npm version](https://img.shields.io/npm/v/amqp-broker-lib.svg?style=flat-square)](https://www.npmjs.org/package/amqp-broker-lib)

Node.js broker lib for AMQP using [amqplib](https://github.com/squaremo/amqp.node).

## Installation

Via npm:

```
npm install amqp-broker-lib
```

Via yarn:

```
yarn add amqp-broker-lib
```

## Usage

```typescript
import { Broker, Config, logger } from "amqp-broker-lib";

// Consumer function
function plusOne(msg) {
  return parseInt(msg.content.toString()) + 1;
}


const config: Config = {
  // connection options
  connection: {
    protocol: "amqp",
    name: "rabbitmq",
    host: "localhost",
    port: "5672"
  },

  //   Exchanges
  exchanges: [
    {
      name: "exchange",
      type: "direct",
      options: {}
    }
  ],

  //   queues
  queues: [
    {
      name: "plusOne",
      exchange: "exchange",
      key: "exchange.plusOne",
      options: {}
    }
  ]
};

// Instantiate the broker service
const broker = new Broker(config);

// add Consumer to queue
broker.addConsume("plusOne", plusOne);

broker.init()
    .then(() => broker.publishMessage(
        {
            msg: "1",
            exchange: "exchange",
            key: "exchange.plusOne",
            rpc: true,
            options: {}
        }
    ))
    .then((response) => {
        console.log(response);
    })
```

## Broker Service

### Broker

Initialize the broker instance.
```typescript
const broker = new Broker(configs);
```

#### Configs
- `connection`: Connection data. Contain the following datas:
    - `user`: User name
    - `pass`: Password
    - `host`: RabbitMQ host
    - `port`: RabbitMQ port
    - `protocol`: **amqp** or **amqps**
    - `certificate`: Certificate data
    - `timeout`: number
    - `name`: service name
- `exchanges`: A list of exchanges data. Each data has the following attributes:
    - `name`: name of exchange
    - `type`: exchange type. options: **direct**, **topic** or **fanout**.
    - `options`: exchange options. See in [amqplib docs](http://www.squaremobius.net/amqp.node/channel_api.html#channel_assertExchange).
- `queues`: A list of queue data. Each data has the following attributes:
    - `name`: name of queue
    - `exchange` (Optional): name of exchange that queue will bind.
    - `key` (Optional): pattern key to queue
    - `options`: Queue options. See in [amqplib docs](http://www.squaremobius.net/amqp.node/channel_api.html#channel_assertQueue).

### Broker.addConsume(queue, callback)
Add a consumer to broker
```typescript
broker.addConsume('queue-name', consumeFunc);
```
Params:
- `queue`: Queue name.
- `callback`: consumer function. This function will receive a `ConsumeMessage` like this:
    ```typescript
    {
        content: Buffer,
        fields: Object,
        properties: Object
    }
    ```

### Broker.init()
Initialize the Broker service. This method returns a `Promise` instance.

```typescript
broker.init();
```

### Broker.publishMessage(publishOptions)
publish a message to a exchange key pattern. Returns a Promise

```typescript
let publishOptions = {
    exchange: "exchange",           // Exchange name
    key: "exchange.send-to-queue",  // Key pattern
    msg: "This is a message",       // Message to consumer. Can be a string or Object
    options: {
        replyTo: "q"
    }
}
await broker.publishMessage(publishOptions);

// If have "rpc" option, wait for a response.
publishOptions.rpc = true;

const response = await broker.publishMessage(publishOptions);

```

### Broker.sendMessage(sendOptions)
Send a message directaly to a queue. Returns a Promise.

```typescript
let sendOptions = {
    queue: "queue",           // queue name
    msg: "This is a message",       // Message to consumer. Can be a string or Object
    options: {
        replyTo: "q"
    }
}
await broker.publishMessage(sendOptions);

// If have "rpc" option, wait for a response.
sendOptions.rpc = true;

const response = await broker.publishMessage(sendOptions);

```

### Broker.close()

Close the channel connection.

## Testing

```
npm test
```