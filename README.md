# FIFA league
A FIFA league application using Slack as frontend

## Setup
- Install [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/)
- Setup [ngrok](https://ngrok.com/) and run a http tunnel e.g: `ngrok http 8000`
- Run `npm install` and `node server.js`
- Setup a Slack app and create an event subscription pointing to the https domain provided by ngrok followed by `/api/user`
- Set the event subscription to post when a user joins and when a user changes information
- Create a Boy user in the Slack app
- Save the Bot User OAuth Access Token in root folder `echo -n TOKEN > bot-token`

## Slack commands
In the Slack app, setup the following slash commands, all pointing to the https domain provided by ngrok followed by `/api/command-name`
Admin commands:
- `/admin` sets current user and channel to admin channel, only works once
- `/public` sets current channel to the official channel for results, so that private chats wont work
- `/drop` @team removes team and all results from league
Public commands:
- `/rules` displays all commands and league rules
- `/signup` registers user with slack user handle as team name
- `/result @hometeam @awayteam result(e.g 3-1)` registers a game result
- `/games` @team displays available games for team
- `/table` prints league table
- `/stats` @team prints more details about a team

## Setup league
- In your private channel with Slack app write `/admin`
- In the desired public league channel write `/public`
- Users can now execute commands and play games