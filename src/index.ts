import chalk from 'chalk'
import to from 'await-to-js'
import { bot } from './lib/bot'
import { configDotenv } from 'dotenv'
import { connectDb } from './db/connect-db'
import { env } from './service/validate-env'
import { headerLogs } from './service/header-logs'
import { setCommands } from './functions/set-commands'
import { helpListener } from './listeners/help.listener'
import { startListener } from './listeners/start.listener'
import { notificationsBot } from './lib/notifications-bot'
import { decoupleListener } from './listeners/decouple.listener'
import { registerBotListeners } from './utils/register-bot-listeners'
import { processTerminateListener } from './service/process-terminate-listeners'

async function main() {
  configDotenv({ path: '../.env.local' })
  console.log(`${chalk.blueBright.bold('[info]')} connecting to the database...`)
  const [err] = await to(connectDb())
  if (err) {
    console.log(`${chalk.red.bold('[Error]')} Failed to connect to the database!`)
    process.exit(-1)
  }
  console.log(`${chalk.greenBright.bold('[Success]')} connected`)
  registerBotListeners([startListener, helpListener, decoupleListener])

  setCommands()
  await Promise.all([
    env.NOTIFICATIONS_ENABLED
      ? notificationsBot.launch(() => {
          console.log(chalk.bold.greenBright('[Success]'), 'the notifications bot is running')
        })
      : undefined,
    bot.launch(headerLogs),
  ])

  processTerminateListener()
}
main()
