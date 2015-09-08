var io = require('sandbox-io');
var shared = require('./shared.min.js');
var clientSessionCounter = 0;

var maze = new shared.Maze(new shared.RandomNumberGenerator(), 16);
var existingSessions = {};

io.on('connection', function(socket)
{

    //calculate a starting place
    var startingPlace = CalculateStartingPlace(maze, existingSessions);

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
        y: session.y
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
    });

    socket.on('disconnect', function()
    {
        InformOtherPlayersOfNewPosition(session, existingSessions, 'rm');
        delete existingSessions[sessionId];
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
                if (existingSessions[sid].x == newPositionX && existingSessions[sid].y == newPositionY)
                {
                    if(data.key==39)
                    {
                        //increase score
                        session.score++;

                        //broadcast the kill to everyone
                        BroadcastToAllOthers(existingSessions, null, 'k', {
                            perp: sessionId,
                            vic: sid,
                            perpScore: session.score
                        });
                    }
                }
            }
        }
        else
        {
            //do nothing, unrecognised key!
        }
    });
});

function InformOtherPlayersOfNewPosition(session, existingSessions, msg)
{
    var positionMessage = {sid: session.sid, x: session.x, y: session.y};
    positionMessage.name = session.name;
    positionMessage.char = session.char;
    positionMessage.score = session.score;

    BroadcastToAllOthers(existingSessions, session, msg||'pu', positionMessage);
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