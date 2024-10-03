# addon-bot - Discord Support Bot

addon-bot is a simple discord bot that I use for my personal support
discord server, it is based around product selling on bbb & sxc.

## Developing

To Develop on this bot, you need to install all required dependencies

```bash
git clone https://github.com/0x7d8/addon-bot.git

cd addon-bot/server

# make sure to have nodejs installed already
npm i -g pnpm
pnpm i

# fill out the .env file
cp .env.example .env

pnpm kit migrate

# start the bot
pnpm dev
```
