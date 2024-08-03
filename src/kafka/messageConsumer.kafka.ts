import { addMessageToDb } from "../controllers/message.controller.js";
import { kafka } from "./messageClient.kafka.js";

const group = "message-consumer-group";
const MAX_RETRY = 3;

const messageConsumer = kafka.consumer({ groupId: group });

export const initMessageConsumer = async () => {
  await messageConsumer.connect();

  await messageConsumer.subscribe({ topic: "messages" });

  await messageConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = JSON.parse(message.value!.toString());
      let retryCount = MAX_RETRY;
      while (retryCount--) {
        try {
          await addMessageToDb(value);
          break;
        } catch (err) {
          console.log((err as Error).message, `(${retryCount} retries left)`);
        }
      }
    },
  });
};

export default messageConsumer;
