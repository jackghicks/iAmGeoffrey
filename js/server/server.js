var io = require('sandbox-io');
var shared = require('./shared.min.js');
var clientSessionCounter = 0;

var maze = new shared.Maze(new shared.RandomNumberGenerator(), 16);
var existingSessions = {};
var collectables = [];

var FLIPPED = true;

//spawn in initial collectables
function SpawnCollectables(type, count)
{
    for(var i = 0; i < count; i++ )
    {
        var startingPlace = CalculateStartingPlace(maze, existingSessions, collectables);
        collectables.push({type:type, x: startingPlace.x, y: startingPlace.y});
    }
}
SpawnCollectables('bomb', 5);
SpawnCollectables('point', 13);
SpawnCollectables('reverse', 3);

io.on('connection', function(socket)
{

    //calculate a starting place
    var startingPlace = CalculateStartingPlace(maze, existingSessions, collectables);

    //new session, assign a sessionId and create the initial session object
    var sessionId = clientSessionCounter++;
    var session = existingSessions[sessionId] = {
        sid: sessionId,
        x: startingPlace.x,
        y: startingPlace.y,
        score: 0,
        socket: socket
    };

    //construct welcome message
    var welcomeMessage = {
        sid: session.sid,
        nme: [],
        x: session.x,
        y: session.y,
        flipped: FLIPPED,
        collectables: collectables
    };

    //construct list of enemy positions for welcome message
    for(var otherSessionId in existingSessions)
    {
        if(otherSessionId!= sessionId)
        {
            welcomeMessage.nme.push({sid: existingSessions[otherSessionId].sid, x: existingSessions[otherSessionId].x, y: existingSessions[otherSessionId].y, name:existingSessions[otherSessionId].name, char: existingSessions[otherSessionId].char});
        }
    }

    //send the welcome message
    socket.emit('w', welcomeMessage);

    //tell everybody we are here!
    InformOtherPlayersOfNewPosition(session, existingSessions);

    socket.on('i', function(data) {
        session.name = data.name;
        session.char = data.char;

        UpdateCurrentlyOnlineList(existingSessions);
    });

    socket.on('disconnect', function()
    {
        InformOtherPlayersOfNewPosition(session, existingSessions, 'rm');
        delete existingSessions[sessionId];
    });

    socket.on('p', function(data)
    {
        var informUsers = false;
        if(session.holding != null)
        {
            if(session.holding=='reverse')
            {
                FLIPPED = !FLIPPED;
                BroadcastToAllOthers(existingSessions, null, 'f', {flipped: FLIPPED, name: session.name});
            }
            if(session.holding=='bomb')
            {
                //inform the clients(for visual reasons!)
                BroadcastToAllOthers(existingSessions, null, 'bomb', { placed: {x: data.x, y: data.y} });

                //register the explosion!
                setTimeout(function() {
                    //find the extents of the bombs reach
                    var leftMost = null;
                    var rightMost = null;
                    var topMost = null;
                    var bottomMost = null;
                    var bombRange = 5;
                    for(var i=1;i<=bombRange; i++)
                    {
                        if(rightMost==null && (isWall(data.x + i, data.y) || i==bombRange))
                        {
                            rightMost = data.x + i - 1;
                        }
                        if(leftMost==null && (isWall(data.x - i, data.y) || i==bombRange))
                        {
                            leftMost = data.x - i + 1;
                        }
                        if(bottomMost==null && (isWall(data.x, data.y + i) || i==bombRange))
                        {
                            bottomMost = data.y + i - 1;
                        }
                        if(topMost==null && (isWall(data.x, data.y - i) || i==bombRange))
                        {
                            topMost = data.y - i + 1;
                        }
                    }

                    //tell the clients (for visual purposes)
                    BroadcastToAllOthers(existingSessions, null, 'bomb', { expl: {x: data.x, y: data.y, r: rightMost, l:leftMost, t:topMost, b:bottomMost } });

                    //find any players in the blast zones
                    for(var x = leftMost; x<= rightMost; x++)
                    {
                        for(var sid in existingSessions)
                        {
                            if(existingSessions[sid].x == x && existingSessions[sid].y == data.y)
                            {
                                PerformAKill(sid, 'b');
                            }
                        }
                    }
                    for(var y = topMost; y<= bottomMost; y++)
                    {
                        for(var sid in existingSessions)
                        {
                            if(existingSessions[sid].x == data.x && existingSessions[sid].y == y)
                            {
                                PerformAKill(sid, 'b');
                            }
                        }
                    }

                    function isWall(x,y)
                    {
                        return maze.GetTileAtPosition(x, y).wall;
                    }
                }, 2000);
            }

            session.holding=null;
            informUsers = true;
        }

        for(var i = 0 ; i < collectables.length ; i ++ )
        {
            if(collectables[i].x == data.x && collectables[i].y == data.y)
            {
                //get a new starting place
                var startingPlace = CalculateStartingPlace(maze, existingSessions, collectables);

                //set it into the collectable
                collectables[i].x = startingPlace.x;
                collectables[i].y = startingPlace.y;

                BroadcastToAllOthers(existingSessions, null, 'c', { collect: data, add: collectables[i] });

                informUsers = true;

                //process pickup type
                if(collectables[i].type=='point')
                {
                    session.score++;
                    UpdateCurrentlyOnlineList(existingSessions);
                }
                else if(collectables[i].type=='reverse')
                {
                    session.holding = 'reverse';
                }
                else if(collectables[i].type=='bomb')
                {
                    session.holding = 'bomb';
                }
                else
                {
                    informUsers = false;
                }
            }
        }

        if(informUsers) InformOtherPlayersOfNewPosition(session, existingSessions, null, true);
    });

    socket.on('m', function(data) {
        var dirVector = shared.keyCodes[data.key];
        if(dirVector)
        {
            var newPositionX = session.x + dirVector.x;
            var newPositionY = session.y + dirVector.y;

            if (maze.GetTileAtPosition(newPositionX, newPositionY).wall == false)
            {
                session.x = newPositionX;
                session.y = newPositionY;
                InformOtherPlayersOfNewPosition(session, existingSessions);
            }

            //compare with positions of others!
            for (var sid in existingSessions)
            {
                if(sid==sessionId) continue;
                if (existingSessions[sid].x == newPositionX && existingSessions[sid].y == newPositionY && !existingSessions[sid].dead)
                {
                    if(data.key==(FLIPPED?37:39))
                    {
                        PerformAKill(sid, 's');
                    }
                }
            }
        }
        else
        {
            //do nothing, unrecognised key!
        }
    });

    function PerformAKill(sid, method) {
        //increase score
        session.score += 3;

        //mark as dead!
        existingSessions[sid].dead = true;

        UpdateCurrentlyOnlineList(existingSessions);

        //broadcast the kill to everyone
        BroadcastToAllOthers(existingSessions, null, 'k', {
            perp: sessionId,
            vic: sid,
            perpScore: session.score,
            method: method
        });
    }

});

function InformOtherPlayersOfNewPosition(session, existingSessions, msg, informSelf)
{
    var positionMessage = {sid: session.sid, x: session.x, y: session.y};
    positionMessage.name = session.name;
    positionMessage.char = session.char;
    positionMessage.score = session.score;
    positionMessage.holding = session.holding;

    BroadcastToAllOthers(existingSessions, informSelf?null:session, msg||'pu', positionMessage);
}

function UpdateCurrentlyOnlineList(existingSessions)
{
    var players = [];

    for(var sid in existingSessions)
    {
        if(!existingSessions[sid].dead)
        {
            players.push({sid: sid, name:existingSessions[sid].name, score: existingSessions[sid].score });
        }
    }

    players = players.sort(function(a,b) { return b.score - a.score; } );

    BroadcastToAllOthers(existingSessions, null, 'cp', {players:players});
}

function BroadcastToAllOthers(existingSessions, session, msg, content)
{
    //send position update to all other players
    for(var otherSessionId in existingSessions)
    {
        if(!session || otherSessionId != session.sid)
        {
            existingSessions[otherSessionId].socket.emit(msg, content);
        }
    }
}