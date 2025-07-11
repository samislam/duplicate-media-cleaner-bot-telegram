import chalk from 'chalk'
import to from 'await-to-js'
import { bot } from './lib/bot'
import { configDotenv } from 'dotenv'
import { connectDb } from './db/connect-db'
import { headerLogs } from './service/header-logs'
import { setCommands } from './functions/set-commands'
import { helpListener } from './listeners/help.listener'
import { startListener } from './listeners/start.listener'
import { whoamiListener } from './listeners/whoami.listener'
import { registerBotListeners } from './utils/register-bot-listeners'
import { spyMediaGroupListener } from './listeners/spy-media.listener'
import { mediaDedupeListener } from './listeners/media-dedupe.listener'
import { processTerminateListener } from './service/process-terminate-listeners'
import { registerMessageListeners } from './utils/register-message-listeners'

async function main() {
  configDotenv({ path: '../.env.local' })
  console.log(`${chalk.blueBright.bold('[info]')} connecting to the database...`)
  const [err] = await to(connectDb())
  if (err) {
    console.log(`${chalk.red.bold('[Error]')} Failed to connect to the database!`)
    process.exit(-1)
  }
  console.log(`${chalk.greenBright.bold('[Success]')} connected`)
  registerBotListeners([startListener, whoamiListener, helpListener])
  registerMessageListeners([spyMediaGroupListener, mediaDedupeListener])
  setCommands()

  await bot.launch(headerLogs)

  processTerminateListener()
}
main()
