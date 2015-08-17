var io = require('sandbox-io');

io.on('connection', function(socket)
{
    socket.emit('welcome', {});
});
