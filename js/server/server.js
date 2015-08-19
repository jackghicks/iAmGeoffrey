var io = require('sandbox-io');
var shared = require('./shared.min.js');
var clientSessionCounter = 0;

var maze = new shared.Maze(new shared.RandomNumberGenerator(), 48);
var existingContexts = {};

io.on('connection', function(socket)
{
    //new session, assign a sessionId and create the initial session object
    var sessionId = clientSessionCounter++;
    var session = existingContexts[sessionId] = {
        sid: sessionId,
        x: 0,
        y: 0,
        score: 0
    };

    socket.emit('welcome', session);

    socket.on('reclaimSession', function(data) {

    });

    socket.on('move', function(data) {

    });
});

