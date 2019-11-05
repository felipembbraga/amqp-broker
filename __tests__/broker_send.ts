import { Broker, Config, logger } from "../src/index";
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
      name: "teste",
      type: "direct",
      options: {}
    }
  ],
  queues: [
    {
      name: "test-queue",
      exchange: "teste",
      key: "teste.test-queue",
      options: {}
    }
  ]
};

async function plusOne(msg: ConsumeMessage) {
    logger.info("plusOne!!!!!");
  let data: any = JSON.parse(msg.content.toString());
  console.log(data);
  return data.num + 1;
}

const broker = new Broker(config);

test("broker send", async function() {
  await broker.addConsume("test-queue", plusOne);
  await broker.init();
  let response = await broker.publishMessage({
    msg: { num: 1 },
    exchange: "teste",
    key: "teste.test-queue",
    rpc: true,
    options: {}
  });
  console.log(response);
  await broker.close();
}, 200000000);
