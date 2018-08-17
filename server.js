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

var emoji = [":hotdog:",":taco:",":burrito:",":chestnut:",":seedling:",":evergreen_tree:",":deciduous_tree:",":palm_tree:",":cactus:",":hot_pepper:",":tulip:",":cherry_blossom:",":rose:",":hibiscus:",":sunflower:",":blossom:",":corn:",":ear_of_rice:",":herb:",":four_leaf_clover:",":maple_leaf:",":fallen_leaf:",":leaves:",":mushroom:",":tomato:",":eggplant:",":grapes:",":melon:",":watermelon:",":tangerine:",":lemon:",":banana:",":pineapple:",":apple:",":green_apple:",":pear:",":peach:",":cherries:",":strawberry:",":hamburger:",":pizza:",":meat_on_bone:",":poultry_leg:",":rice_cracker:",":rice_ball:",":rice:",":curry:",":ramen:",":spaghetti:",":bread:",":fries:",":sweet_potato:",":dango:",":oden:",":sushi:",":fried_shrimp:",":fish_cake:",":icecream:",":shaved_ice:",":ice_cream:",":doughnut:",":cookie:",":chocolate_bar:",":candy:",":lollipop:",":custard:",":honey_pot:",":cake:",":bento:",":stew:",":fried_egg:",":fork_and_knife:",":tea:",":sake:",":wine_glass:",":cocktail:",":tropical_drink:",":beer:",":rat:",":mouse2:",":ox:",":water_buffalo:",":cow2:",":tiger2:",":leopard:",":rabbit2:",":cat2:",":dragon:",":crocodile:",":whale2:",":snail:",":snake:",":racehorse:",":ram:",":goat:",":sheep:",":monkey:",":rooster:",":chicken:",":dog2:",":pig2:",":boar:",":elephant:",":octopus:",":shell:",":bug:",":ant:",":bee:",":beetle:",":fish:",":tropical_fish:",":blowfish:",":turtle:",":hatching_chick:",":baby_chick:",":hatched_chick:",":bird:",":penguin:",":koala:",":poodle:",":dromedary_camel:",":camel:",":dolphin:",":mouse:",":cow:",":tiger:",":rabbit:",":cat:",":dragon_face:",":whale:",":horse:",":monkey_face:",":dog:",":pig:",":frog:",":hamster:",":wolf:",":bear:",":panda_face:",":chipmunk:",":wave:",":ok_hand:",":+1:",":-1:",":clap:",":skull:",":bomb:",":zzz:",":hankey:",":muscle:",":fire:",":joystick:",":man_dancing:",":raised_hand_with_fingers_splayed:",":middle_finger:",":spock-hand:",":see_no_evil:",":hear_no_evil:",":speak_no_evil:",":police_car:",":toilet:",":motor_boat:",":small_airplane:",":airplane_departure:",":airplane_arriving:",":satellite:",":scooter:",":motor_scooter:",":canoe:",":zipper_mouth_face:",":money_mouth_face:",":face_with_thermometer:",":nerd_face:",":thinking_face:",":face_with_head_bandage:",":robot_face:",":hugging_face:",":the_horns:",":call_me_hand:",":raised_back_of_hand:",":left-facing_fist:",":right-facing_fist:",":handshake:",":crossed_fingers:",":face_with_cowboy_hat:",":clown_face:",":nauseated_face:",":rolling_on_the_floor_laughing:",":drooling_face:",":lying_face:",":woman-facepalming:",":man-facepalming:",":face_palm:",":woman-shrugging:",":man-shrugging:",":shrug:",":drum_with_drumsticks:",":clinking_glasses:",":tumbler_glass:",":spoon:",":goal_net:",":first_place_medal:",":second_place_medal:",":third_place_medal:",":boxing_glove:",":martial_arts_uniform:",":croissant:",":avocado:",":cucumber:",":bacon:",":potato:",":carrot:",":baguette_bread:",":green_salad:",":shallow_pan_of_food:",":stuffed_flatbread:",":egg:",":glass_of_milk:",":peanuts:",":kiwifruit:",":crab:",":lion_face:",":scorpion:",":turkey:",":unicorn_face:",":eagle:",":duck:",":bat:",":shark:",":owl:",":fox_face:",":butterfly:",":deer:",":gorilla:",":lizard:",":rhinoceros:",":shrimp:",":squid:",":cheese_wedge:",":alarm_clock:",":hourglass_flowing_sand:",":sunny:",":cloud:",":umbrella:",":snowman:",":comet:",":coffee:",":shamrock:",":point_up:",":skull_and_crossbones:",":radioactive_sign:",":biohazard_sign:",":white_frowning_face:",":relaxed:",":female_sign:",":male_sign:",":spades:",":clubs:",":hearts:",":diamonds:",":recycle:",":hammer_and_pick:",":anchor:",":crossed_swords:",":gear:",":warning:",":zap:",":coffin:",":soccer:",":boat:",":tent:",":airplane:",":fist:",":hand:",":v:",":heart:",":star:"];

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
            if (m.canceled) {
                table[m.teams.home].pts -= 1;
                table[m.teams.away].pts -= 1;
            }else if (m.goals.home > m.goals.away) {
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

    //Generate upper bracket team order (1 8 4 5 2 7 3 6)
    var nw = (n > 8) ? 8 : n;
    var order = getOrder(nw,0);
    console.log("Order of upper bracket " + order);

    //Generate static upper bracket
    json.finals["0"] = {"played":false, "date":0, "teams":{"home":"", "away":""}, "goals":{"home":0, "away":0}, "registered":"",
                        "next":{"game":"done", "team":""},
                        "stage":{"name":"Final", "number":1},
                        "parents":{"home":{"result":"", "key":"", "number":0}, "away":{"result":"", "key":"", "number":0}}};

    var stage = 1;
    var team = ["home", "away"];
    var w = 1;
    while (stage < nw) {
        for (var i = 1; i <= stage; i++) {
            var postfix = (stage === 1) ? "nd" : "th";
            json.finals["w"+w] = {"played":false, "date":0, "teams":{"home":"", "away":""}, "goals":{"home":0, "away":0}, "registered":"",
                                  "next":{"game":"w"+Math.floor(w/2), "team":team[w%2]},
                                  "stage":{"name":"Upper "+2*stage+postfix, "number":i},
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
    //console.log("Upper generated");
    //console.log(json.finals);


    //Generate lower bracket
    //If there are more than 8 players in lower, keep generating games in lower (but minimum 8)
    nl = (n-8 > 8) ? n-8 : 8;
    stage = 1;
    var l = 1;
    while (stage < nl) {
        for (var i = 1; i <= stage; i++) {
            var postfix = (stage === 1) ? "nd" : "th";
            json.finals["l"+l] = {"played":false, "date":0, "teams":{"home":"", "away":""}, "goals":{"home":0, "away":0}, "registered":"",
                                  "next":{"game":"l"+Math.floor(l/2), "team":team[l%2]},
                                  "stage":{"name":"Lower "+2*stage+postfix, "number":i},
                                  "parents":{"home":{"result":"", "key":"", "number":0}, "away":{"result":"", "key":"", "number":0}}};

            //Generate revenge (r) stages for all losers in upper bracket
            if (stage < nw) {
                //Add r match pointing
                json.finals["l"+l+"r"] = {"played":false, "date":0, "teams":{"home":"", "away":""}, "goals":{"home":0, "away":0}, "registered":"",
                                          "next":{"game":"l"+Math.floor(l/2), "team":team[l%2]},
                                          "stage":{"name":"Lower "+2*stage+postfix+" stage 2", "number":i},
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
    
    
    //Fill upper bracket first stage matches from order
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
    //console.log("Upper filled");
    //console.log(json.finals);
    

    //Fill lower bracket
    //Add more teams if more than 8 (those who fit in upper bracket)
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
        //Start from a game and move winner to next (if upper also move loser)
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


var processResult = function(d, json, u) {
    r = {"valid":true, "ht":"", "at":"", "hg":0, "ag":0, "registered":u};
    
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

//General chat function to print public information
var chat = function(text, json) {
    web.chat.postMessage({channel: json.public, text: text})
        .then((res) => {
            // `res` contains information about the posted message
            console.log("Message sent to public channel: ", res.ts);
        })
        .catch(console.error);
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

var printLeague = function(json) {
    var text = "*Current league table:*"
    json.table.map(function(r) {
        text += "\n"+r.pts+" \<\@"+r.name+"\> ("+r.gd+", "+r.f+", "+r.gp+")";
    });
    return text;
}

var printFinals = function(json) {
    var text = "*Finals:*"
    var sorted = {};
    
    Object.keys(json.finals).forEach(function(k) {
        var m = json.finals[k];
        if (!((m.played && (m.teams.home === "" || m.teams.away === "")) ||
              m.teams.home === "WALKOVER" || m.teams.away === "WALKOVER")) {
            if (!sorted.hasOwnProperty(m.stage.name)) sorted[m.stage.name] = [];

            sorted[m.stage.name].push(m);
        }
    });

    //Sort keys for presentation
    var keys = Object.keys(sorted).sort(function(a,b) {
        //Final goes first
        if (a === "Final") return -1;
        if (b === "Final") return 1;
        //Then Upper X<Y:th
        var as = a.split(" ");
        var bs = b.split(" ");
        if (as[0] === "Upper" && bs[0] != "Upper") return -1;
        if (bs[0] === "Upper" && as[0] != "Upper") return -1;
        if (as[0] === "Upper" && bs[0] === "Upper") {
            if (as[1] <= bs[1]) return -1;
            else return 1;
        }
        //Then Lower X<Y:th stage x>y
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
    return text;
}

var printRank = function(json, winner, loser) {
    var text = "*Final rank:*";
    //Go through lower bracket and collect stage teams 1 1 1 1 2 2 4 4 8 8...        
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
    return text;
}

var chatResult = function(result, json, state) {
    var text = "";
    //First add match text
    text += "*Game played:* (registered by \<\@"+result.registered+"\>)\n";
    if (result != "") {
        if (result.hg > result.ag)
            text += "\<\@"+result.ht+"\> played \<\@"+result.at+"\> and won ("+result.hg+"-"+result.ag+") :soccer:";
        else if (result.hg < result.ag)
            text += "\<\@"+result.ht+"\> played \<\@"+result.at+"\> and lost ("+result.hg+"-"+result.ag+") :soccer:";
        else
            text += "\<\@"+result.ht+"\> played \<\@"+result.at+"\> and the result was a draw ("+result.hg+"-"+result.ag+") :soccer:";
    }

    //If league, add league table
    //if (Object.values(json.league).filter(function(m){return !m.played}).length < 0) {
    if (state === "league" || state === "league done") {
        text += "\n\n" + printLeague(json);
    }
    if (state === "final" || state === "league done" || state === "winner") {
        //If finals, add finals brackets
        text += "\n\n" + printFinals(json);
    }
    if (state === "winner") {
        var winner = (result.hg > result.ag) ? result.ht : result.at;
        var loser = (result.hg > result.ag) ? result.at : result.ht;
        text += "\n\n*\<\@"+winner+"\> is the winner!* :tada:";
        text += "\n\n" + printRank(json, winner, loser);
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
        //Only allow signup during league stage
        if (Object.values(json.league).filter(function(m){return !m.played}).length > 0 || Object.values(json.league).length === 0) {
            //Add team if it is a unique name
            if (!json.teams.includes(u)) {
                //Before pushing, add all pairwise games to leage (non played games)
                json.teams.map(function(t) {
                    console.log("Adding: " + t + "-" + u);
                    json.league[t + "-" + u] = {"played":false, "canceled":false, "date":0, "teams":{"home":t, "away":u}, "goals":{"home":0, "away":0}, "registered":""};
                    //console.log("Adding: " + u + "-" + t);
                    //json.league[u + "-" + t] = {"played":false, "canceled":false, "date":0, "teams":{"home":u, "away":t}, "goals":{"home":0, "away":0}, "registered":""};
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
        } else {
            res.send("Unfortunately the league stage is done so you cant join the league :cry:");
        }
    }


    
    //Add result from game
    else if (type === "result") {
        var u = json.users[entry.user_name].user_id;
        var result = processResult(entry.text, json, u);
        //If result is correctly formatted
        if (result.valid) {
            //Count if result is connected to league game or finals (league games left)
            if (Object.values(json.league).filter(function(m){return !m.played}).length > 0) {
                //LEAGUE GAME

                //If teams havn't met
                if (json.league.hasOwnProperty(result.ht + "-" + result.at) && json.league[result.ht + "-" + result.at].played === false) {
                    //Add home - away result
                    json.league[result.ht + "-" + result.at].played = true;
                    json.league[result.ht + "-" + result.at].goals.home = parseInt(result.hg);
                    json.league[result.ht + "-" + result.at].goals.away = parseInt(result.ag);
                    json.league[result.ht + "-" + result.at].date = Date.now();
                    json.league[result.ht + "-" + result.at].registered = u;

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
                else if (json.league.hasOwnProperty(result.at + "-" + result.ht) && json.league[result.at + "-" + result.ht].played === false) {
                    //Add inverted home - away result
                    json.league[result.at + "-" + result.ht].played = true;
                    json.league[result.at + "-" + result.ht].goals.home = parseInt(result.ag);
                    json.league[result.at + "-" + result.ht].goals.away = parseInt(result.hg);
                    json.league[result.at + "-" + result.ht].date = Date.now();
                    json.league[result.at + "-" + result.ht].registered = u;
                    
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
                    res.send("Teams have already played their games");
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
                            game.registered = u;

                            var winner = (parseInt(result.hg) > parseInt(result.ag)) ? result.ht : result.at;
                            var loser = (parseInt(result.hg) < parseInt(result.ag)) ? result.ht : result.at;
                            
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
        var u = "";
        var text = "";
        if (entry.text != "") u = json.users[entry.text.substring(1)].user_id;
        //If user specified
        if (u != "") text += "*Games available for \<\@" + u + "\>:*";
        else text += "*Games available:*";

        //Filter non played games in either league or finals
        var games = Object.values(json.league).filter(function(m){return !m.played});
        //If all leagu games are played use finals instead
        if (games.length === 0) games = Object.values(json.finals).filter(function(m){
            return !m.played && m.teams.home != "" && m.teams.home != "WALKOVER" && m.teams.away != "" && m.teams.away != "WALKOVER";
        });

        //Filter user games if specified
        if (u != "") {
            games = games.filter(function(m){return m.teams.home === u || m.teams.away === u});
        }

        //Append text
        games.map(function(m){
            text += "\n\<\@" + m.teams.home + "\> - \<\@" + m.teams.away + "\>";
        });
        res.send(text);
    }

    //Print table (private)
    else if (type === "table") {
        res.send(printLeague(json));
    }

    //Print finals
    else if (type === "finals") {
        res.send(printFinals(json));
    }

    //Print help and rules
    else if (type === "rules") {
        var text = "*Game Format*\nThe league is played in two stages, the league stage and the final stage.";
        text += "\n\n*League stage*\nIn the league stage all teams meet each other twice (home and away) a win gives three (3) points and a draw gives one (1) point, the teams are sorted in a table primarily based on points, then goal difference and goals made. The league table rank determines the entry point in the final stage of the game.";
        text += "\n*_Games in the League stage are played full time, no extra time or tie-breaks. The two players can choose teams however they want, the suggestion is that both play the same league team between 2-4 stars._*";
        text += "\n\n*Final stage*\nWhen all league games are played the teams are sorted in the final brackets for the final stage. A double elimination bracket (https://en.wikipedia.org/wiki/Double-elimination_tournament) is used where the top eight (8) teams is sorted in the upper bracket and the rest of the teams in the lower bracket, a losing team in the upper bracket can lose one game and end up in the lower bracket, a losing team in the lower bracket is eliminated from the finals. The winner from the upper and lower bracket plays the final game and determines the winner.";
        text += "\n*_Games in the Final stage are played full time, classic extra time followed by penalties for tie-breaks. The two players can choose teams however they want, the suggestion is that both play the same (any) team between 4-5 stars._*"
        text += "\n\n*Slack commands*";
        text += "\n`/rules` displays this message";
        text += "\n`/signup` registers user (you) with slack user handle as team name";
        text += "\n`/result @hometeam @awayteam result(e.g 3-1)` registers a game result";
        text += "\n`/games (@team)` displays all available games (or for a specified team)";
        text += "\n`/table` prints league table";
        text += "\n`/finals` prints final brackets";
        text += "\n`/stats @team` prints more details about a team";
        text += "\n`/history (@team)` prints all games played in order (or for a specified team)";
        res.send(text);
    }

    //Print detailed stats
    else if (type === "stats") {
        var u = json.users[entry.user_name].user_id;
        if (entry.text != "") u = json.users[entry.text.substring(1)].user_id;

        var text = "*Stats for team \<\@"+u+"\>:*";
        var row = json.table.find(function(r) {return r.name === u});
        text += "\nTable position: "+row.pos;
        text += "\nGames Played: "+row.gp;
        text += "\nWins: "+row.w;
        text += "\nDraws: "+row.d;
        text += "\nLosses: "+row.l;
        text += "\nGoals for: "+row.f;
        text += "\nGoals against: "+row.a;
        text += "\nGoal difference: "+row.gd;
        text += "\nPoints: "+row.pts;
        text += "\nForm: "+emoji[Math.floor(Math.random() * emoji.length)];//+row.form;
        res.send(text);
    }

    //Print all games played
    else if (type === "history") {
        var u = "";
        var text = "";
        if (entry.text != "") u = json.users[entry.text.substring(1)].user_id;

        //If user specified
        if (u != "") text += "*League games played by \<\@" + u + "\>:*";
        else text += "*League games played:*";
        
        //Filter played games in league
        var games = Object.values(json.league).filter(function(m){
            return (m.played && m.teams.home!="" && m.teams.away!="" && m.teams.home!="WALKOVER" && m.teams.away!="WALKOVER");
        }).sort(function(a,b) {
            return a.date - b.date;
        });
        //Filter user games if specified
        if (u != "") games = games.filter(function(m){return m.teams.home === u || m.teams.away === u});
        
        //Append text
        games.map(function(m){
            var d = new Date(m.date);
            text += "\n";
            if (m.canceled) text += "~";
            text += d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)+": ";
            text += "\<\@"+m.teams.home+"\> - \<\@"+m.teams.away+"\> ("+m.goals.home+"-"+m.goals.away+")";
            text += " [\<\@"+m.registered+"\>]";
            if (m.canceled) text += "~";
        });

        //If user specified
        if (u != "") text += "\n\n*Final games played by \<\@" + u + "\>:*";
        else text += "\n\n*Final games played:*";
        
        //Filter played games in league
        var games = Object.values(json.finals).filter(function(m){
            return (m.played && m.teams.home!="" && m.teams.away!="" && m.teams.home!="WALKOVER" && m.teams.away!="WALKOVER");
        }).sort(function(a,b) {
            return a.date - b.date;
        });
        //Filter user games if specified
        if (u != "") games = games.filter(function(m){return m.teams.home === u || m.teams.away === u});
        
        //Append text
        games.map(function(m){
            var d = new Date(m.date);
            text += "\n"+d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)+": ";
            text += "\<\@"+m.teams.home+"\> - \<\@"+m.teams.away+"\> ("+m.goals.home+"-"+m.goals.away+")";
            text += " [\<\@"+m.registered+"\>]";
        });

        res.send(text);
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
        //Check if admin
        if (json.admin.user === json.users[entry.user_name].user_id &&
            json.admin.channel === entry.channel_id &&
            entry.text != "") {
            var u = json.users[entry.text.substring(1)].user_id;
            
            //Drop only works in league stage
            if (Object.values(json.league).filter(function(m){return !m.played}).length > 0) {
                //Remove team from teams and league
                json.teams = json.teams.filter(function(t){return t != u});
                var keys = Object.keys(json.league);
                keys.map(function(k) {
                    if (json.league[k].teams.home == u || json.league[k].teams.away == u) {
                        delete json.league[k];
                    }
                });
                json.table = generateTable(json);
                var text = "\<\@"+u+"\> left the league :cry:";
                text += "\n" + printLeague(json);
                if (Object.values(json.league).filter(function(m){return !m.played}).length === 0) {
                    //If not, generate final brackets
                    console.log("GENERATE FINAL BRACKETS");
                    json.finals = generateBracket(json);
                    text += "\n" + printFinals(json);
                }
                writeJSON(json);
                res.send("Team removed");
                chat(text, json);
            } else {
                res.send("Undo only works for league games (for now)");
            }
        } else {
            res.send("Someone else is admin or format is wrong");
        }
    }

    //Undo game
    else if (type === "undo") {
        var u = json.users[entry.user_name].user_id;
        if (json.admin.user === u &&
            json.admin.channel === entry.channel_id) {
            //Go through league games and undo a game
            if (Object.values(json.league).filter(function(m){return !m.played}).length > 0) {
                var result = processResult(entry.text, json, u);
                //If result is correctly formatted
                if (result.valid) {
                    if (json.league.hasOwnProperty(result.ht + "-" + result.at) && json.league[result.ht + "-" + result.at].played) {
                        //Generate information
                        var text = "*Game removed by admin*";
                        var m = json.league[result.ht + "-" + result.at];
                        var d = new Date(m.date);
                        text += "\n"+d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)+": ";
                        text += "\<\@"+m.teams.home+"\> - \<\@"+m.teams.away+"\> ("+m.goals.home+"-"+m.goals.away+")";
                        text += " [\<\@"+m.registered+"\>]";
                        
                        //Clear                        
                        json.league[result.ht + "-" + result.at].played = false;
                        json.league[result.ht + "-" + result.at].canceled = false;
                        json.league[result.ht + "-" + result.at].goals.home = 0;
                        json.league[result.ht + "-" + result.at].goals.away = 0;
                        json.league[result.ht + "-" + result.at].date = 0;
                        json.league[result.ht + "-" + result.at].registered = "";
                        json.table = generateTable(json);
                        writeJSON(json);
                        res.send("Game removed");
                        chat(text ,json);
                    } else res.send("Game not played");
                } else res.send("Game not valid");
            } else {
                res.send("Undo only works for league games (for now)");
            }
        } else {
            res.send("Someone else is admin");
        }
    }

    //Cancel games
    else if (type === "cancel") {
        //Check if admin
        var u = json.users[entry.user_name].user_id;
        if (json.admin.user === u &&
            json.admin.channel === entry.channel_id) {
            //Go through league games cancel non played games
            if (Object.values(json.league).filter(function(m){return !m.played}).length > 0) {
                if (entry.text === "1" || entry.text === "2") {
                    var text = "*The following games were canceled:*";
                    //For every team, check if one or both games have been played
                    var n = json.teams.length;
                    //Go through every pair
                    for (var i = 0; i < n; i++) {
                        var ht = json.teams[i];
                        for (var j = 0; j < n; j++) {
                            if (i === j) continue;
                            
                            var at = json.teams[j];
                            var g = "";
                            if (entry.text === "1" && !json.league[ht + "-" + at].played && !json.league[at + "-" + ht].played) g = ht + "-" + at;
                            else if (entry.text === "2" && json.league.hasOwnProperty(result.at + "-" + result.ht) && !json.league[at + "-" + ht].played) g = at + "-" + ht;
                            else if (entry.text === "2" && json.league.hasOwnProperty(result.ht + "-" + result.at) && !json.league[ht + "-" + at].played) g = ht + "-" + at;

                            if (g != "") {
                                json.league[g].played = true;
                                json.league[g].canceled = true;
                                json.league[g].goals.home = 0;
                                json.league[g].goals.away = 0;
                                json.league[g].date = Date.now();
                                json.league[g].registered = u;
                                text += "\n\<\@"+json.league[g].teams.home+"\> - \<\@"+json.league[g].teams.away+"\>";
                            }
                        }
                    }
                    
                    //Generate league table
                    json.table = generateTable(json);
                    
                    //Count again if there are any league games left
                    if (Object.values(json.league).filter(function(m){return !m.played}).length === 0) {
                        //If not, generate final brackets
                        console.log("GENERATE FINAL BRACKETS");
                        json.finals = generateBracket(json);
                        text += "\n\n" + printLeague(json) + "\n\n" + printFinals(json);
                    } else {
                        //Channel response
                        text += "\n\n" + printLeague(json);
                    }
                    res.send("Games canceled");
                    writeJSON(json);
                    chat(text, json);
                } else {
                    res.send("Wrong argument e.g /cancel 1 (or 2)");
                }
            } else {
                res.send("Cancel only works for league games (for now)");
            }
        } else {
            res.send("Someone else is admin");
        }
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
