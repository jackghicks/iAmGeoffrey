var io = require('sandbox-io');
var shared = require('./shared.min.js');
var clientSessionCounter = 0;

var maze = new shared.Maze(new shared.RandomNumberGenerator(), 48);
var existingSessions = {};

io.on('connection', function(socket)
{
    //new session, assign a sessionId and create the initial session object
    var sessionId = clientSessionCounter++;
    var session = existingSessions[sessionId] = {
        sid: sessionId,
        x: 0,
        y: 0,
        score: 0,
        socket: socket
    };

    socket.emit('w', session);

    socket.on('rs', function(data) {

    });

    socket.on('m', function(data) {
        var newPositionX = session.x;
        var newPositionY = session.y;
        switch (data.key)
        {
            case 37:
                newPositionX = session.x -1;
                break;
            case 38:
                newPositionY = session.y -1;
                break;
            case 39:
                newPositionX = session.x +1;
                break;
            case 40:
                newPositionY = session.y +1;
                break;
            default:
                return;
                break;
        }


        if(maze.GetTileAtPosition(newPositionX, newPositionY).wall == false)
        {
            session.x = newPositionX;
            session.y = newPositionY;

            //send position update to all other players
            for(var otherSessionId in existingSessions)
            {
                if(otherSessionId!= sessionId)
                {
                    existingSessions[otherSessionId].socket.emit('pu', {sid: session.sid, x: session.x, y: session.y});
                }
            }
        }
    });
});

