import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "abyss",
  brokers: ["localhost:9092"],
});
