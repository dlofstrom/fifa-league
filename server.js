var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
const { WebClient } = require("@slack/client");

var app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
var path = __dirname;

var token = fs.readFileSync(path + "/bot-token", "utf8");
const web = new WebClient(token);


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
    if (!json.hasOwnProperty("users")) {
        console.log("No field named users, creating: " + json);
        json.users = "";
    }
    if (!json.hasOwnProperty("admin")) {
        console.log("No field named admin, creating: " + json);
        json.admin = {"user":"", "channel":""};
    }
    if (!json.hasOwnProperty("public")) {
        console.log("No field named public, creating: " + json);
        json.public = "";
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

//Get final bracket order (e.g 1 8 4 5 2 7 3 6)
var getOrder = function(n,o) {
    var order = [o]; //order array
    while (order.length < n) {
        var indices = order.map(function(e,i){return i}); //0,1,2... same length as order
        indices = indices.sort(function(i,j){return order[j]-order[i]}); //get indices to sorted order (e.g [4,1,3,2]=>[0,2,3,1])
        indices.map(function(index,i) {
            order[index] = [order[index], order.length+i+o];
        });
        order = [].concat.apply([],order);
        //console.log(order);
    }
    return order;
}

var generateBracket = function(json) {
    //Number of teams
    var n = json.table.length;

    //Generate winners bracket team order (1 8 4 5 2 7 3 6)
    var nw = (n > 8) ? 8 : n;
    var order = getOrder(nw,0);
    console.log("Order of winners bracket " + order);

    //Generate static winners bracket
    json.finals["0"] = {"played":false, "date":0, "teams":{"home":"", "away":""}, "goals":{"home":0, "away":0},
                        "next":{"game":"done", "team":""},
                        "stage":{"name":"Final", "number":1},
                        "parents":{"home":{"result":"", "key":"", "number":0}, "away":{"result":"", "key":"", "number":0}}};

    var stage = 1;
    var team = ["home", "away"];
    var w = 1;
    while (stage < nw) {
        for (var i = 1; i <= stage; i++) {
            var postfix = (stage === 1) ? "nd" : "th";
            json.finals["w"+w] = {"played":false, "date":0, "teams":{"home":"", "away":""}, "goals":{"home":0, "away":0},
                                  "next":{"game":"w"+Math.floor(w/2), "team":team[w%2]},
                                  "stage":{"name":"Winners "+2*stage+postfix, "number":i},
                                  "parents":{"home":{"result":"", "key":"", "number":0}, "away":{"result":"", "key":"", "number":0}}};
            //Fix next is final
            if (Math.floor(w/2) === 0) {
                json.finals["w"+w].next.game = "0";
                json.finals["w"+w].next.team = "home";
            }
            w += 1;
        }
        stage *= 2;
    }
    //console.log("Winners generated");
    //console.log(json.finals);


    //Generate losers bracket
    //If there are more than 8 players in losers, keep generating games in losers (but minimum 8)
    nl = (n-8 > 8) ? n-8 : 8;
    stage = 1;
    var l = 1;
    while (stage < nl) {
        for (var i = 1; i <= stage; i++) {
            var postfix = (stage === 1) ? "nd" : "th";
            json.finals["l"+l] = {"played":false, "date":0, "teams":{"home":"", "away":""}, "goals":{"home":0, "away":0},
                                  "next":{"game":"l"+Math.floor(l/2), "team":team[l%2]},
                                  "stage":{"name":"Losers "+2*stage+postfix, "number":i},
                                  "parents":{"home":{"result":"", "key":"", "number":0}, "away":{"result":"", "key":"", "number":0}}};

            //Generate revenge (r) stages for all losers in winners bracket
            if (stage < nw) {
                //Add r match pointing
                json.finals["l"+l+"r"] = {"played":false, "date":0, "teams":{"home":"", "away":""}, "goals":{"home":0, "away":0},
                                          "next":{"game":"l"+Math.floor(l/2), "team":team[l%2]},
                                          "stage":{"name":"Losers "+2*stage+postfix+" stage 2", "number":i},
                                          "parents":{"home":{"result":"", "key":"", "number":0}, "away":{"result":"", "key":"", "number":0}}};
                //Fix next is final
                if (Math.floor(l/2) === 0) {
                    json.finals["l"+l+"r"].next.game = "0";
                    json.finals["l"+l+"r"].next.team = "away";
                }

                //Modify earlier created match to point to revenge match instead
                json.finals["l"+l].next.game = "l"+l+"r";
                //Change team to away (loser from wb always home)
                json.finals["l"+l].next.team = "away";
                //Append stage 1 to earlier
                json.finals["l"+l].stage.name += " stage 1";
            }

            l += 1;
        }
        stage *= 2;
    }
    //console.log("Finals generated");
    //console.log(json.finals);
    
    
    //Fill winners bracket first stage matches from order
    order.forEach(function(position) {
        if (position < nw) {
            //Team exists, add to game (based on w)
            console.log("Adding team " + position + " to game");
            json.finals["w"+Math.floor(w/2)].teams[team[w%2]] = json.table[position].name;
        } else {
            console.log("Team " + position + " does not exist");
            //No team, move "winning" team to next
            var other = json.finals["w"+Math.floor(w/2)].teams[team[(w+1)%2]];
            var next = json.finals["w"+Math.floor(w/2)].next;
            json.finals["w"+Math.floor(w/2)].played = true;

            if(other != "") {
                //move "winning" team to next
                moveBracket(json, next, other);
                //json.finals[next.game].teams[next.team] = other;
            } else {
                //If no teams, "next" will be walk over
                moveBracket(json, next, "WALKOVER");
                //json.finals[next.game].teams[next.team] = "WALKOVER";
            }
            
            //json.finals[next.game].teams[next.team] = json.finals["w"+Math.floor(w/2)].teams[team[(w+1)%2]];
            
            //Also move team in losing bracket
            //Mark losing as walk over
            next = {"game":"l"+Math.floor(w/2)+"r", "team":"home"};
            //json.finals[losing].teams["home"] = "WALKOVER";
            moveBracket(json, next, "WALKOVER");
        }
        w += 1;
    });
    //console.log("Winners filled");
    //console.log(json.finals);
    

    //Fill losers bracket
    //Add more teams if more than 8 (those who fit in winners bracket)
    order = getOrder(nl, 8);
    //Fill leauge loser stage matches from order
    order.forEach(function(position) {
        if (position < n) {
            //Team exists, add to game (based on l)
            console.log("Adding team " + position + " to game");
            json.finals["l"+Math.floor(l/2)].teams[team[l%2]] = json.table[position].name;
        } else {
            //Check if other team exists and move it to next stage
            var other = json.finals["l"+Math.floor(l/2)].teams[team[(l+1)%2]];
            var next = json.finals["l"+Math.floor(l/2)].next;
            json.finals["l"+Math.floor(l/2)].played = true;
            
            if(other != "") {
                //move "winning" team to next
                moveBracket(json, next, other);
                //json.finals[next.game].teams[next.team] = other;
            } else {
                //If no teams, "next" will be walk over
                moveBracket(json, next, "WALKOVER");
                //json.finals[next.game].teams[next.team] = "WALKOVER";
            }

        }
        l += 1;
    });
    //console.log("Finals filled");
    //console.log(json.finals);

    //Propagate match parents
    Object.keys(json.finals).forEach(function(k) {
        var f = json.finals[k];
        //Start from a game and move winner to next (if winners also move loser)
        if (k != "0" && !f.played && f.teams.home != "WALKOVER" && f.teams.away != "WALKOVER") {
            propagateParents(json, f.next.game, f.next.team, "Winner", f.stage.name, f.stage.number);
            //If winner also move it forward
            if (k[0] === 'w') {
                //console.log("Propagating "+ "Loser"+f.stage.name+f.stage.number);
                next = "l" + k.substring(1) + "r";
                propagateParents(json, next, "home", "Loser", f.stage.name, f.stage.number);
            }
        }
    });
    //console.log("Parents filled");
    //console.log(json.finals);
    
    return json.finals;
}

//e.g json, "w1", "home", "key", "number"
//"parents":{"home":{"key":"", "number":0}, "away":{"key":"", "number":0}}};
var propagateParents = function(json, game, team, result, key, number) {
    //Keep recusion until child is found
    var g = json.finals[game];
    if (g.played || g.teams.home === "WALKOVER" || g.teams.away === "WALKOVER") {
        //console.log(game, team, result, key, number, "LOOOP");
        propagateParents(json, g.next.game, g.next.team, result, key, number);
    } else {
        //console.log(game, team, result, key, number, "DONE");
        g.parents[team].result = result;
        var ks = key.split(" ");
        g.parents[team].key = ks[0][0]+ks[1].substring(0,ks[1].length-2);
        if (ks.length === 4) g.parents[team].key += "s"+ks[3];
        g.parents[team].number = number;
    }
}

var moveBracket = function(json, next, team) {
    var other = (next.team === "home") ? "away" : "home";
    //if (json.finals[next.game].teams[other] === "WALKOVER") {

    //Set team in next game
    json.finals[next.game].teams[next.team] = team;

    //If the other team left walk over
    if (json.finals[next.game].teams[other] === "WALKOVER") {
        json.finals[next.game].played = true;
        //Keep moving team
        moveBracket(json, json.finals[next.game].next, team);
    }
}


var processResult = function(d, json) {
    r = {"valid":true, "ht":"", "at":"", "hg":0, "ag":0}
    
    //data must contain 3 arguments separated by space (team team result)
    d = d.split(" ");
    if (d.length != 3) {
        r.valid = false;
        return r;
    }
        
    //result argument must be two numbers separated by dash (e.g 3-1)
    d[2] = d[2].split("-");
    if (isNaN(d[2][0]) || isNaN(d[2][1])) {
        r.valid = false;
        return r;
    }
    
    //teams must be available in the users dictionary
    d[0] = d[0].substring(1); //remove leading @
    d[1] = d[1].substring(1); //remove leading @
    if (!json.users.hasOwnProperty(d[0]) || !json.users.hasOwnProperty(d[1])) {
        r.valid = false;
        return r;
    }
    
    //team ids exist in teams
    d[0] = json.users[d[0]].user_id;
    d[1] = json.users[d[1]].user_id;
    if (!json.teams.includes(d[0]) || !json.teams.includes(d[1])) {
        r.valid = false;
        return r;
    }
        
    //Else data seems fine and input (d) now contains proper data
    r.ht = d[0];
    r.at = d[1];
    r.hg = d[2][0];
    r.ag = d[2][1];
    r.valid = true;
    return r;
}


//Chat posts (into public channel)
var chatSignup = function(user, json) {
    //res.json({response_type: "in_channel", text: "\<\@" + u + "\> was added to the league!"}); //echo back
    var text = "\<\@" + user + "\> was added to the league!";

    text += "\n\n*League members:*"
    json.table.map(function(r) {
        text += "\n\<\@"+r.name+"\>";
    });

    web.chat.postMessage({channel: json.public, text: text})
        .then((res) => {
            // `res` contains information about the posted message
            console.log("Message sent to public channel: ", res.ts);
        })
        .catch(console.error);
}

var chatResult = function(result, json, state) {
    var text = "";
    //First add match text
    if (result != "") {
        if (result.hg > result.ag)
            text += "\<\@"+result.ht+"\> played \<\@"+result.at+"\> and won ("+result.hg+"-"+result.ag+")";
        else if (result.hg < result.ag)
            text += "\<\@"+result.ht+"\> played \<\@"+result.at+"\> and lost ("+result.hg+"-"+result.ag+")";
        else
            text += "\<\@"+result.ht+"\> played \<\@"+result.at+"\> and the result was a draw ("+result.hg+"-"+result.ag+")";
    }

    //If league, add league table
    //if (Object.values(json.league).filter(function(m){return !m.played}).length < 0) {
    if (state === "league" || state === "league done") {
        text += "\n\n*Current league table:*"
        json.table.map(function(r) {
            text += "\n"+r.pts+" \<\@"+r.name+"\> ("+r.gd+", "+r.f+", "+r.gp+")";
        });
    }
    if (state === "final" || state === "league done" || state === "winner") {
        //If finals, add finals brackets
        text += "\n\n*Finals:*"
        
        var sorted = {};
        
        Object.keys(json.finals).forEach(function(k) {
            var m = json.finals[k];
            if (!((m.played && (m.teams.home === "" || m.teams.away === "")) ||
                  m.teams.home === "WALKOVER" || m.teams.away === "WALKOVER")) {
                if (!sorted.hasOwnProperty(m.stage.name)) sorted[m.stage.name] = [];

                sorted[m.stage.name].push(m);
                
                //text += "\n"+k+" \<\@"+m.teams.home+"\> - \<\@"+m.teams.away+"\>";
            }
        });

        //Sort keys for presentation
        var keys = Object.keys(sorted).sort(function(a,b) {
            //Final goes first
            if (a === "Final") return -1;
            if (b === "Final") return 1;
            //Then Winners X<Y:th
            var as = a.split(" ");
            var bs = b.split(" ");
            if (as[0] === "Winners" && bs[0] != "Winners") return -1;
            if (bs[0] === "Winners" && as[0] != "Winners") return -1;
            if (as[0] === "Winners" && bs[0] === "Winners") {
                if (as[1] <= bs[1]) return -1;
                else return 1;
            }
            //Then Losers X<Y:th stage x>y
            if (parseInt(as[1].substring(0,as[1].length-2)) < parseInt(bs[1].substring(0,bs[1].length-2))) return -1;
            if (parseInt(as[1].substring(0,as[1].length-2)) > parseInt(bs[1].substring(0,bs[1].length-2))) return 1;
            if (as.length === 4 && bs.length === 4) {
                if (as[3] < bs[3]) return 1;
                else -1;
            }
            return -1;
        });

        //Format brakcet print
        keys.forEach(function(k) {
            text += "\n\n*" + sorted[k][0].stage.name + ":*"
            var ks = k.split(" ");
            sorted[k].forEach(function(m) {
                var home = "\<\@"+m.teams.home+"\>";
                var away = "\<\@"+m.teams.away+"\>";
                if (m.teams.home === "") home = m.parents.home.result+" "+m.parents.home.key+"-"+m.parents.home.number;
                if (m.teams.away === "") away = m.parents.away.result+" "+m.parents.away.key+"-"+m.parents.away.number;
                //Played games are strikethrough, playable games are bold
                text += "\n";
                if (m.played) text += "_~";
                else if (m.teams.home != "" && m.teams.away != "") text += "*";
                text += m.stage.number+": "+home+" - "+away;
                if (m.played) text += "~ ("+m.goals.home+"-"+m.goals.away+")_";
                else if (m.teams.home != "" && m.teams.away != "") text += "*";
            });
        });
    }
    if (state === "winner") {
        var winner = (result.hg > result.ag) ? result.ht : result.at;
        var loser = (result.hg > result.ag) ? result.at : result.ht;
        text += "\n\n*\<\@"+winner+"\> is the winner!*";

        //Print final rank
        text += "\n\n*Final rank:*";
        //Go through losers bracket and collect stage teams 1 1 1 1 2 2 4 4 8 8...        
        var rank = [winner, loser];
        var stage = 1;
        var l = 1;
        var table = json.table
        while (stage < table.length) {
            var sr = [];
            for (var i = 0; i < stage; i++) {
                var k = "l"+(l+i)+"r";
                if (json.finals.hasOwnProperty(k)) {
                    var teams = [].concat.apply([],rank);
                    var home = json.finals[k].teams.home;
                    var away = json.finals[k].teams.away;
                    if (home != "" && home != "WALKOVER" && !teams.includes(home)) sr.push(home);
                    if (away != "" && away != "WALKOVER" && !teams.includes(away)) sr.push(away);
                }
            }
            rank.push(sr);
            var s = [];
            for (var i = 0; i < stage; i++) {
                var k = "l"+(l+i);
                if (json.finals.hasOwnProperty(k)) {
                    var teams = [].concat.apply([],rank);
                    var home = json.finals[k].teams.home;
                    var away = json.finals[k].teams.away;
                    if (home != "" && home != "WALKOVER" && !teams.includes(home)) sr.push(home);
                    if (away != "" && away != "WALKOVER" && !teams.includes(away)) sr.push(away);
                }
            }
            rank.push(s);
            l += stage
            stage *= 2;
        }
        //Sort sub arrays based on leauge
        var league = table.map(function(r){return r.name});
        rank = rank.map(function(a){return league.filter(function(o){return a.includes(o)})});
        rank = [].concat.apply([],rank);
        rank.forEach(function(t,i) {
            text += "\n"+(i+1)+" \<\@"+t+"\>";
        });
    }
    
    
    //Print chat
    web.chat.postMessage({channel: json.public, text: text})
        .then((res) => {
            // `res` contains information about the posted message
            console.log("Message sent to public channel: ", res.ts);
        })
        .catch(console.error);
}


//Handle data post
app.post("/api/:type", function(req, res) {
    var type = req.params.type;
    var json = getJSON();
    var entry = req.body;
    //var teamnames = json.teams.map(function(e){return e.name});
    //console.log(entry);
    //console.log(users);

    
    //Add new team
    if (type === "signup") {
        var u = json.users[entry.user_name].user_id;
        //Add team if it is a unique name
        if (!json.teams.includes(u)) {
            //Before pushing, add all pairwise games to leage (non played games)
            json.teams.map(function(t) {
                console.log("Adding: " + t + "-" + u);
                json.league[t + "-" + u] = {"played":false, "date":0, "teams":{"home":t, "away":u}, "goals":{"home":0, "away":0}};
                console.log("Adding: " + u + "-" + t);
                json.league[u + "-" + t] = {"played":false, "date":0, "teams":{"home":u, "away":t}, "goals":{"home":0, "away":0}};
            });
            json.teams.push(u);
            
            //Generate league table
            json.table = generateTable(json);

            writeJSON(json);
            console.log(json);
            
            //Respond with successful add to league
            //res.json({response_type: "in_channel", text: "\<\@" + u + "\> was added to the league!"}); //echo back
            chatSignup(u, json);
            res.send("Team \<\@" + u + "\> signed up!");
        } else {
            //If team already is signed up
            res.send("Team \<\@" + u + "\> already signed up");
        }
    }


    
    //Add result from game
    else if (type === "result") {
        var result = processResult(entry.text, json);
        //If result is correctly formatted
        if (result.valid) {
            //Count if result is connected to league game or finals (league games left)
            if (Object.values(json.league).filter(function(m){return !m.played}).length > 0) {
                //LEAGUE GAME

                //If teams havn't met
                if (json.league[result.ht + "-" + result.at].played === false) {
                    //Add home - away result
                    json.league[result.ht + "-" + result.at].played = true;
                    json.league[result.ht + "-" + result.at].goals.home = parseInt(result.hg);
                    json.league[result.ht + "-" + result.at].goals.away = parseInt(result.ag);
                    json.league[result.ht + "-" + result.at].date = Date.now();

                    //Generate league table
                    json.table = generateTable(json);

                    //Count again if there are any league games left
                    if (Object.values(json.league).filter(function(m){return !m.played}).length === 0) {
                        //If not, generate final brackets
                        console.log("GENERATE FINAL BRACKETS");
                        json.finals = generateBracket(json);
                        chatResult(result, json, "league done");
                    } else {
                        //Channel response
                        chatResult(result, json, "league");
                    }
                    res.send("Result \<\@"+result.ht+"\>-\<\@"+result.at+"\> ("+result.hg+"-"+result.ag+") recorded");
                }
                //Else check return game
                else if (json.league[result.at + "-" + result.ht].played === false) {
                    //Add inverted home - away result
                    json.league[result.at + "-" + result.ht].played = true;
                    json.league[result.at + "-" + result.ht].goals.home = parseInt(result.ag);
                    json.league[result.at + "-" + result.ht].goals.away = parseInt(result.hg);
                    json.league[result.at + "-" + result.ht].date = Date.now();

                    //Generate league table
                    json.table = generateTable(json);

                    //Count again if there are any league games left
                    if (Object.values(json.league).filter(function(m){return !m.played}).length === 0) {
                        //If not, generate final brackets
                        console.log("GENERATE FINAL BRACKETS");
                        json.finals = generateBracket(json);
                        chatResult(result, json, "league done");
                    } else {
                        //Channel response
                        chatResult(result, json, "league");
                    }
                    res.send("Result \<\@"+result.at+"\>-\<\@"+result.ht+"\> ("+result.ag+"-"+result.hg+") recorded");
                }
                //Else the teams should not meet
                else {
                    res.send("Teams have already met twice");
                }
            } else {
                //FINALS GAME
                var ok = false;
                Object.keys(json.finals).some(function(k) {
                    var game = json.finals[k];
                    if (game.played === false) {
                        if ((game.teams.home === result.ht && game.teams.away === result.at) ||
                            (game.teams.away === result.ht && game.teams.home === result.at)) {
                            //Register result
                            game.played = true;
                            game.goals.home = (game.teams.home === result.ht) ? result.hg : result.ag;
                            game.goals.away = (game.teams.home === result.ht) ? result.ag : result.hg;
                            game.date = Date.now();

                            var winner = (result.hg > result.ag) ? result.ht : result.at;
                            var loser = (result.hg < result.ag) ? result.ht : result.at;
                            
                            //Move winner forward
                            if (k === "0") {
                                chatResult(result, json, "winner");
                                res.send("Result \<\@"+result.ht+"\>-\<\@"+result.at+"\> ("+result.hg+"-"+result.ag+") recorded");
                                ok = true;
                                return true;
                            }
                            moveBracket(json, game.next, winner);
                            
                            //Move loser to lower bracket (if in wb)
                            if (k[0] === 'w') {
                                var next = {"game":"l"+k.substring(1)+"r", "team":"home"};
                                moveBracket(json, next, loser);
                            }
                            
                            chatResult(result, json, "final");
                            res.send("Result \<\@"+result.ht+"\>-\<\@"+result.at+"\> ("+result.hg+"-"+result.ag+") recorded");
                            ok = true;
                            return true;
                        }
                    }
                    return false;
                });
                if (!ok) res.send("No such game");
            }
            
            //json.results.push(req.body);
            console.log("Pushing new result: ", json);
            writeJSON(json);
        } else {
            res.send("Check result format!");
        }
    }


    //List available games for user (argument or not) (private)
    else if (type === "games") {
        var u = json.users[entry.user_name].user_id;
        if (entry.text != "") u = json.users[entry.text.substring(1)].user_id;
        
        var text = "*Games available for \<\@" + u + "\>:*";
        if (Object.values(json.league).filter(function(m){return !m.played}).length > 0) {
            Object.values(json.league).map(function(m) {
                if (m.teams.home === u && !m.played) text += "\n\<\@" + m.teams.home + "\> - \<\@" + m.teams.away + "\>";
                else if (m.teams.away === u && !m.played) text += "\n\<\@" + m.teams.home + "\> - \<\@" + m.teams.away + "\>";
            });
        } else {
            Object.values(json.finals).map(function(m) {
                if (m.teams.home === u && m.teams.away != "" && !m.played) text += "\n\<\@" + m.teams.home + "\> - \<\@" + m.teams.away + "\>";
                else if (m.teams.away === u && m.teams.home != "" && !m.played) text += "\n\<\@" + m.teams.home + "\> - \<\@" + m.teams.away + "\>";
            });
        }
        res.send(text);
    }

    //Print table (private)
    else if (type === "table") {
        text = "*League table:*";
        json.table.map(function(r) {
            text += "\n"+r.pts+" \<\@"+r.name+"\> ("+r.gd+", "+r.f+", "+r.gp+")";
        });
        res.send(text);
    }


    //Print help and rules
    else if (type === "rules") {
        res.send("TODO");
    }

    //Print detailed stats
    else if (type === "stats") {
        res.send("TODO");
    }


    //Set channel and user as admin
    else if (type === "admin") {
        if (json.admin.user === "") {

            if (json.users.length === 0) {
                web.users.list()
                    .then((res) => {
                        // `res` contains information about the posted message
                        //console.log('Message sent: ', res);
                        json.users = {};
                        res.members.map(function(m) {
                            json.users[m.name] = {"user_id":m.id, "user_name":m.name, "real_name":m.real_name, "display_name":m.profile.display_name};
                        });
                        console.log(json.users);
                        json.admin.user = json.users[entry.user_name].user_id;
                        json.admin.channel = entry.channel_id;
                        writeJSON(json);
                    })
                    .catch(console.error);
                res.send("You are now the admin on this channel");
            } else {
                json.admin.user = json.users[entry.user_name].user_id;
                json.admin.channel = entry.channel_id;
                writeJSON(json);
                res.send("You are now the admin on this channel");
            }
        } else {
            res.send("Someone else is admin");
        }
    }

    //Set channel as public
    else if (type === "public") {
        if (json.admin.user === json.users[entry.user_name].user_id) {
            json.public = entry.channel_id;
            writeJSON(json);
            res.send("This channel is now the public channel");
        } else {
            res.send("Someone else is admin");
        }
    }

    //Remove team
    else if (type === "drop") {
        res.send("TODO");

    }


    
    //Event subscription when a user changed information or someone joined the channel
    else if (type === "user") {
        res.json({"challenge":entry.challenge});
        web.users.list()
            .then((res) => {
                // `res` contains information about the posted message
                //console.log('Message sent: ', res);
                json.users = {};
                res.members.map(function(m) {
                    json.users[m.name] = {"user_id":m.id, "user_name":m.name, "real_name":m.real_name, "display_name":m.profile.display_name};
                });
                console.log(json.users);
                writeJSON(json);
            })
            .catch(console.error);
    }
    
    else {
        res.send("API function does not exist");
    }
});

//Listen on port 8000
app.listen(8000);
