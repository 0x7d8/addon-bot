# bot - Discord Support Bot

bot is a simple discord bot that is used on the 0x7f6 support
discord server, it is based around product selling on bbb & sxc.

## Developing

To Develop on this bot, you need to install all required dependencies

```bash
git clone https://github.com/0x7f6/bot.git

cd bot

# make sure to have nodejs installed already
npm i -g pnpm
pnpm i

# fill out the .env file
cp .env.example .env

pnpm kit migrate

# start the bot
pnpm dev
```
