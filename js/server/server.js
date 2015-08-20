var io = require('sandbox-io');
var shared = require('./shared.min.js');
var clientSessionCounter = 0;

var maze = new shared.Maze(new shared.RandomNumberGenerator(), 24);
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
            welcomeMessage.nme.push({sid: existingSessions[otherSessionId].sid, x: existingSessions[otherSessionId].x, y: existingSessions[otherSessionId].y});
        }
    }

    //send the welcome message
    socket.emit('w', welcomeMessage);

    //tell everybody we are here!
    InformOtherPlayersOfNewPosition(session, existingSessions);

    socket.on('rs', function(data) {

    });

    socket.on('disconnect', function()
    {
        InformOtherPlayersOfNewPosition(session, existingSessions, 'rm');
        delete existingSessions[sessionId];
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
            InformOtherPlayersOfNewPosition(session, existingSessions);
        }
    });
});

function InformOtherPlayersOfNewPosition(session, existingSessions, msg)
{
    //send position update to all other players
    for(var otherSessionId in existingSessions)
    {
        if(otherSessionId!= session.sid)
        {
            existingSessions[otherSessionId].socket.emit(msg||'pu', {sid: session.sid, x: session.x, y: session.y});
        }
    }
}