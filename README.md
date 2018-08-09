# FIFA league
A FIFA league application using Slack as frontend.

## TODO list
- [x] Save "who registered" a game in result
- [ ] Continous backup of the data file
- [ ] Stop writing everything in one file (:sweat_smile:)
- [ ] Implement team remove
- [ ] Fix Final game remove
- [ ] Inform about team and game removed
- [ ] Add a game canceled feature to be able to have a league deadline (without giving points to a team)
- [ ] Set a threshold for number of teams in one group, then split into two (or three etc.) groups in the league stage
- [ ] Add a star difference feature that gives players in the lower part of the table a handicap versus teams in the higher part of the table <br>_This can be implemented so that the table shows exactly how many stars a team should have in next game or show the difference in stars for the teams in a specific game_ <br>_This also allows for more interesting games between new players versus more experienced players_
- [x] Add `/history @team` to show only games played by one team
- [x] Change `/games` to show all games left instead of yourself
- [ ] Change from winners/losers bracket to upper/lower bracket
- [ ] Dont allow signup after league stage is done (or have a manual close signup)

## Game Format
The league is played in two stages, the league stage and the final stage.

### League stage
In the league stage all teams meet each other twice (home and away) a win gives three (3) points and a draw gives one (1) point, the teams are sorted in a table primarily based on points, then goal difference and goals made. The league table rank determines the entry point in the final stage of the game.

Games in the League stage are played full time, no extra time or tie-breaks. The two players can choose teams however they want, the suggestion is that both play the same league team between 2-4 stars.

### Final stage
When all league games are played the teams are sorted in the final brackets for the final stage. A [double elimination bracket](https://en.wikipedia.org/wiki/Double-elimination_tournament) is used where the top eight (8) teams is sorted in the winners bracket and the rest of the teams in the losers bracket, a losing team in the winners bracket can lose one game and end up in the losers bracket, a losing team in the losers bracket is eliminated from the finals. the winner from the winners and losers bracket plays the final game and determines the winner.

Games in the Final stage are played full time, classic extra time followed by penalties for tie-breaks. The two players can choose teams however they want, the suggestion is that both play the same (any) team between 4-5 stars.

## Setup
- Install [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/)
- Setup [ngrok](https://ngrok.com/) and run a http tunnel e.g: `ngrok http 8000`
- Run `npm install` and `node server.js`
- Setup a Slack app and create an event subscription pointing to the https domain provided by ngrok followed by `/api/user`
- Set the event subscription to post when a user joins and when a user changes information
- Create a Bot user in the Slack app
- Save the Bot User OAuth Access Token in root folder `echo -n TOKEN > bot-token`

## Slack commands
In the Slack app, setup the following slash commands, all pointing to the https domain provided by ngrok followed by `/api/command-name`

Admin commands:
- `/admin` sets current user and channel to admin channel, only works once
- `/public` sets current channel to the official channel for results, so that private chats wont work
- `/drop` @team removes team and all results from league
- `/undo @hometeam @awayteam result(e.g 3-1)` removes a game result

Public commands:
- `/rules` displays all commands and league rules
- `/signup` registers user with slack user handle as team name
- `/result @hometeam @awayteam result(e.g 3-1)` registers a game result
- `/games (@team)` displays all available games (or for a specified team)
- `/table` prints league table
- `/finals` prints final brackets
- `/stats @team` prints more details about a team
- `/history (@team)` prints all games played in order (or for a specified team)

## Setup league
- In your private channel with Slack app write `/admin`
- In the desired public league channel write `/public`
- Users can now execute commands and play games