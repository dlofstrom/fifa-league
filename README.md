# FIFA league
A FIFA league application using Slack as frontend

## Setup
- Setup [ngrok](https://ngrok.com/) and run a http tunnel e.g: `ngrok http 3000`
- Setup a Slack app with two slash commands `/signup` and `/result @hometeam @awayteam result` following (this guide)[https://girliemac.com/blog/2016/10/24/slack-command-bot-nodejs/] with Request URL set to `ngrok-url/api/command-name`
- Save the Bot User OAuth Access Token in `echo -n TOKEN > bot-token` and channel name as `echo -n CHANNEL > bot-token`
- Install [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) and run `npm install` and `node server.js`

## Slack commands
- `/signup` registers user with slack user handle as team name
- `/result @hometeam @awayteam result(e.g 3-1)` registers a game result

