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

const broker = new Broker(config);

test("broker send", function(done) {
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
  broker.addConsume("plusOne", plusOne);

  broker
    .init()
    .then(() =>
      broker.publishMessage({
        msg: "1",
        exchange: "exchange",
        key: "exchange.plusOne",
        rpc: true,
        options: {}
      })
    )
    .then(response => {
      console.log(response);
      done();
    });
}, 200000000);
