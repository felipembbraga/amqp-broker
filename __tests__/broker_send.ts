import { Broker, Config } from "../src/index";

import { ConsumeMessage } from "amqplib";
import { doesNotReject } from "assert";

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

test("broker send", async function(done) {
  // await broker.addConsume("test-queue", plusOne);
  // await broker.init();
  // let response = await broker.publishMessage({
  //   msg: { num: 1 },
  //   exchange: "teste",
  //   key: "teste.test-queue",
  //   rpc: true,
  //   options: {}
  // });
  // console.log(response);
  // await broker.close();

  const broker = new Broker(config);
  broker.addConsume("plusOne", plusOne);
  console.log("initializating broker...");
  await broker.init();
  console.log("sending message");
  const response = await broker.publishMessage({
    msg: "1",
    exchange: "exchange",
    key: "exchange.plusOne",
    rpc: true
  });
  console.log(response);
}, 200000000);
