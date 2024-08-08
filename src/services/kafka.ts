import { Consumer, Kafka, Producer } from "kafkajs";
import { MongoServerError } from "mongodb";
import { addMessageToDb } from "../controllers/message.controller.js";

const TOPIC = "MESSAGES";
const MAX_RETRY = 3;

const kafka = new Kafka({
  clientId: "abyss",
  brokers: ["localhost:9092"],
});

export async function initializeKafka() {
  const admin = kafka.admin();
  admin.connect();
  const existingTopics = await admin.listTopics();

  if (existingTopics.includes(TOPIC)) {
    console.log(`Topic [${TOPIC}] already exists`);
  } else {
    console.log(`Creating Topic [${TOPIC}]`);
    await admin.createTopics({
      topics: [
        {
          topic: TOPIC,
          numPartitions: 1,
        },
      ],
    });
    console.log(`Topic Created Success [${TOPIC}]`);
  }

  await admin.disconnect();
}

let producer: null | Producer = null;

export async function createMessageProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createMessageProducer();
  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });
  return true;
}

let consumer: null | Consumer = null;
export async function createMessageConsumer() {
  if (consumer) return consumer;

  const _consumer = kafka.consumer({ groupId: "default" });
  await _consumer.connect();
  await _consumer.subscribe({ topic: TOPIC, fromBeginning: true });

  await _consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;
      const value = JSON.parse(message.value!.toString());
      console.log(`New Message Recv..................`);
      console.log("Processing message", value);

      let retryCount = MAX_RETRY;
      while (retryCount--) {
        try {
          await addMessageToDb(value);
          break;
        } catch (err) {
          console.log("Failed to process message");
          if (err instanceof MongoServerError) {
            pause();
            setTimeout(() => {
              _consumer.resume([{ topic: TOPIC }]);
            }, 60 * 1000);
            break;
          }

          console.log((err as Error).message, `(${retryCount} retries left)`);
        }
      }
    },
  });

  consumer = _consumer;
  return consumer;
}

// export async function startMessageConsumer() {
//   console.log("Consumer is running..");
//   const consumer = kafka.consumer({ groupId: "default" });
//   await consumer.connect();
//   await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

//   await consumer.run({
//     autoCommit: true,
//     eachMessage: async ({ message, pause }) => {
//       if (!message.value) return;
//       const value = JSON.parse(message.value!.toString());
//       console.log(`New Message Recv..................`);
//       console.log("Processing message", value);

//       try {
//         await addMessageToDb(value);
//       } catch (err) {
//         console.log("Failed to process message", err);
//         pause();
//         setTimeout(() => {
//           consumer.resume([{ topic: TOPIC }]);
//         }, 60 * 1000);
//       }
//     },
//   });
// }

export default kafka;
