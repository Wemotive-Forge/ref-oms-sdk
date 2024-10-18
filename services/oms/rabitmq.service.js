import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const queueName = process.env.QUEUE_NAME;

class RabitmqService {

    async pushRabbitMQ(message) {
        try {
            // Create a connection to RabbitMQ
            const connection = await amqp.connect(RABBITMQ_URL);

            // Create a channel
            const channel = await connection.createChannel();

            // Ensure the queue exists
            await channel.assertQueue(queueName, { durable: false });

            // Send the message to the queue
            channel.sendToQueue(queueName, Buffer.from(message));
            console.log(`[x] Sent message to ${queueName}: ${message}`);

            // Close the connection after a short delay
            setTimeout(() => {
                connection.close();
            }, 500);

        } catch (error) {
            console.error('Error sending message to queue:', error);
        }
    }
}

module.exports = new RabitmqService();
