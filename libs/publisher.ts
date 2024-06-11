import { RabbitInstance } from "./amqp";
import chalk from "chalk";
import { ErrorPayload } from "./types";

const publishLog = async (url: string, error: ErrorPayload): Promise<void> => {
    const rbmq = new RabbitInstance();
    rbmq.conect(url);
    rbmq.on('connected', async (EventListener) => {
        const { channel, conn } = EventListener;
        const targetQueue = rbmq.getExchangeConfig.queue;
        const targetRoutingKey = rbmq.getExchangeConfig.routingKey;
        const exchange = await rbmq.initiateExchange({
            name: rbmq.getExchangeConfig.name,
            type: 'direct',
            durable: true,
            autoDelete: false,
            internal: false,
            channel: channel
        });
        rbmq.createQueue({
            name: targetQueue,
            channel: channel,
            options: {
                durable: true,
                arguments: { 
                    'x-queue-type': 'classic', 
                    'x-dead-letter-exchange': rbmq.getExchangeConfig.name 
                }
            }
        });
        await channel.bindQueue(targetQueue, exchange, targetRoutingKey);
        await channel.publish(exchange, targetRoutingKey, Buffer.from(JSON.stringify({ message: error })));
        rbmq.setClosingState(true);
        await channel.close();
        await conn.close();
    });
    rbmq.on('error', error => {
        console.info(chalk.red(`[RBMQ] Error: ${error.message}`));
    })
    rbmq.on('reconnect', attempt => {
        console.info(`[RBMQ] Retrying connect to: ${chalk.yellow(url.split('#')[0])}, attempt: ${chalk.green(attempt)}`);
    })
    rbmq.on('ECONNREFUSED', () => {
        console.error(chalk.red(`[RBMQ] Connection to ${url.split('#')[0]} refused`))
        return;
    })
    rbmq.on('access_refused', error => {
        console.info(chalk.red(`[RBMQ] Error: ${error.message}`));
    })
}

export { publishLog }