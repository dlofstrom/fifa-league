var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");

var app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
var path = __dirname;

//Get requests from frontend
app.get("/", function(req, res) {
    res.sendFile(path + "/index.html");
    console.log("/");
});

app.get("/:any", function(req, res) {
    var any = req.params.any;
    res.sendFile(path + "/" + any);
    console.log(any);
});



var getJSON = function() {
    var json = {};
    if (fs.existsSync(path + "/data.json")) {
        console.log("File exists parsing json: " + json);
        var data = fs.readFileSync(path + "/data.json");
        json = JSON.parse(data);
    } else console.log("No file, creating empty json");

    //Handle non existing fields
    if (!json.hasOwnProperty("teams")) {
        console.log("No field named teams, creating: " + json);
        json.teams = [];
    }
    if (!json.hasOwnProperty("league")) {
        console.log("No field named league, creating: " + json);
        json.league = {};
    }
    if (!json.hasOwnProperty("finals")) {
        console.log("No field named finals, creating: " + json);
        json.finals = {};
    }
    if (!json.hasOwnProperty("table")) {
        console.log("No field named table, creating: " + json);
        json.table = {};
    }
    
    return json;
}

var writeJSON = function(json) {
    fs.writeFileSync(path + "/data.json", JSON.stringify(json));
}

var generateTable = function(json) {
    //Generate empty table
    var table = {};
    json.teams.map(function(t) {
        //Generate empty table row (Pos GP W D L F A GD Pts Form)
        table[t] = {}
        table[t].name = t; //Team name
        table[t].pos = 0; //Position
        table[t].gp = 0; //Games played
        table[t].w = 0; //Wins
        table[t].d = 0; //Draws
        table[t].l = 0; //Loses
        table[t].f = 0; //Goals for
        table[t].a = 0; //Goals against
        table[t].gd = 0; //Goal difference
        table[t].pts = 0; //Points
        table[t].form = 0; //Form
    });

    //Iterate over league matches and add to table fields
    Object.values(json.league).map(function(m) {
        //games played
        if (m.played) {
            table[m.teams.home].gp += 1;
            table[m.teams.away].gp += 1;
            
            //win, lose, draw, points
            if (m.goals.home > m.goals.away) {
                //Home wins
                table[m.teams.home].w += 1;
                table[m.teams.away].l += 1;
                table[m.teams.home].pts += 3;
            } else if (m.goals.home < m.goals.away) {
                //Away wins
                table[m.teams.away].w += 1;
                table[m.teams.home].l += 1;
                table[m.teams.away].pts += 3;
            } else {
                //Draw
                table[m.teams.home].d += 1;
                table[m.teams.away].d += 1;
                table[m.teams.home].pts += 1;
                table[m.teams.away].pts += 1;
            }
            
            //goals for, against, difference
            table[m.teams.home].f += m.goals.home;
            table[m.teams.home].a += m.goals.away;
            table[m.teams.home].gd = table[m.teams.home].f - table[m.teams.home].a;
            table[m.teams.away].f += m.goals.away;
            table[m.teams.away].a += m.goals.home;
            table[m.teams.away].gd = table[m.teams.away].f - table[m.teams.away].a;
        }
    });
    
    //Then sort teams based on points, goal difference, goals scored
    table = Object.values(table).sort(function(a,b) {
        if (b.pts != a.pts) {
            return b.pts - a.pts; //Sorting high scores up
        } else if (b.gd != a.gd) {
            return b.gd - a.gd; //Sorting high goal difference up
        } else {
            return b.f - a.f; //Else sort most goals made up
        }
    });

    //Assign position in table
    table.map(function(t,i){t.pos = i+1});
    
    //if (Object.values(json.league).filter(function(m){return !m.played}).length === 0) {
    console.log(table);
    return table;
}

var generateBracket = function(json) {
    //Use table

    //If less than 8
    
    //Else if more than 8
    
}

var updateBracket = function(json) {
    
}

//Handle data post
app.post("/api/:type", function(req, res) {
    var type = req.params.type;
    var json = getJSON();
    var entry = req.body;
    //var teamnames = json.teams.map(function(e){return e.name});
    
    //Add new team
    if (type == "team") {
        console.log("Add team to json file");
        console.log("Body: " + entry);
        
        //Add team if it is a unique name
        if (!json.teams.includes(entry.name)) {
            //Before pushing, add all pairwise games to leage (non played games)
            json.teams.map(function(t) {
                console.log("Adding: " + t + "-" + entry.name);
                json.league[t + "-" + entry.name] = {"played":false, "date":0, "teams":{"home":t, "away":entry.name}, "goals":{"home":0, "away":0}};
                console.log("Adding: " + entry.name + "-" + t);
                json.league[entry.name + "-" + t] = {"played":false, "date":0, "teams":{"home":entry.name, "away":t}, "goals":{"home":0, "away":0}};
            });
            
            json.teams.push(entry.name); 
            console.log("Pushing new team: ", json);
            writeJSON(json);
            res.send(entry); //echo back
        } else {
            res.send("Team already exists");
        }
    }
    
    //Add result from game
    else if (type == "result") {
        console.log("Add result to json file");
        console.log("Body: " + req.body);
        
        //Maybe TODO: Verify two teams and goals entries
        
        //Verify that teams exists
        if (json.teams.includes(entry.teams.home) && json.teams.includes(entry.teams.away)) {
            
            //Count if result is connected to league game or finals (league games left)
            if (Object.values(json.league).filter(function(m){return !m.played}).length > 0) {
                //LEAGUE GAME
                //Go through leage and add result
                if (json.league[entry.teams.home + "-" + entry.teams.away].played === false) {
                    console.log("Adding result " + entry.teams.home + "-" + entry.teams.away);
                    //Add home - away result
                    json.league[entry.teams.home + "-" + entry.teams.away].played = true;
                    json.league[entry.teams.home + "-" + entry.teams.away].goals.home = parseInt(entry.goals.home);
                    json.league[entry.teams.home + "-" + entry.teams.away].goals.away = parseInt(entry.goals.away);
                    json.league[entry.teams.home + "-" + entry.teams.away].date = Date.now();
                    res.send(req.body); //echo back
                } else if (json.league[entry.teams.away + "-" + entry.teams.home].played === false) {
                    console.log("Adding result " + entry.teams.away + "-" + entry.teams.home);
                    //Add inverted home - away result
                    json.league[entry.teams.away + "-" + entry.teams.home].played = true;
                    json.league[entry.teams.away + "-" + entry.teams.home].goals.home = parseInt(entry.goals.away);
                    json.league[entry.teams.away + "-" + entry.teams.home].goals.away = parseInt(entry.goals.home);
                    json.league[entry.teams.away + "-" + entry.teams.home].date = Date.now();
                    res.send(req.body); //echo back
                } else {
                    res.send("Teams have already met twice");
                }

                //Generate league table
                json.table = generateTable(json);
                
                //Count again if there are any league games left
                if (Object.values(json.league).filter(function(m){return !m.played}).length === 0) {
                    //If not, generate final brackets
                    console.log("GENERATE FINAL BRACKETS");
                    generateBracket(json);
                }
            } else {
                //FINALS GAME
                res.send("Final game");
            }
            
            //json.results.push(req.body);
            console.log("Pushing new result: ", json);
            writeJSON(json);
        } else {
            res.send("One of the teams are not in the tournament");
        }
    } else {
        res.send("API function does not exist");
    }
});

//Listen on port 8000
app.listen(8000);
