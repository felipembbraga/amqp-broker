import { Broker, Config } from "../src/index";

import { ConsumeMessage } from "amqplib";

const config: Config = {
  connection: {
    protocol: "amqp",
    name: "rabbitmq",
    host: "localhost",
    port: "5672"
  },
  exchanges: [
    {
      name: "exchange",
      type: "direct",
      options: {}
    }
  ],
  queues: [
    {
      name: "plusOne",
      exchange: "exchange",
      key: "exchange.plusOne",
      options: {}
    }
  ]
};

async function plusOne(msg: ConsumeMessage) {
  return parseInt(msg.content.toString()) + 1;
}

async function initialize() {
  const broker = new Broker(config);
  broker.addConsume("plusOne", plusOne);
  await broker.init();
}

initialize();
