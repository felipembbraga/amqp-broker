import { Broker, Config } from "../src/index";

const config: Config = {
  connection: {
    protocol: "amqp",
    name: "rabbitmq",
    host: "localhost",
    port: "5672"
  }
};

async function sendMessage() {
  const broker = new Broker(config);
  await broker.init();
  console.log("sending message");
  const response = await broker.publishMessage({
    msg: "1",
    exchange: "exchange",
    key: "exchange.plusOne",
    rpc: true
  });

  console.log(response);
  return response;
}

sendMessage().catch(console.error).finally(process.exit);
