import { kafka } from "./messageClient.kafka.js";

const messageProducer = kafka.producer();

export const initMessageProducer = async () => {
  await messageProducer.connect();
};

export default messageProducer;
