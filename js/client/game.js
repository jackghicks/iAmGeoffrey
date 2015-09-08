function Game(canvas, context, spriteSheet)
{
    //create a knight for the local player and a dictionary for other players
    var playerKnight = new Knight(0,0, playerName, playerCharacter, 0, spriteSheet);
    var otherKnights = {};

    var keyCodes = exports.keyCodes;

    function UpdateOtherKnightPosition(data)
    {
        if(otherKnights[data.sid])
        {
            otherKnights[data.sid].x = data.x;
            otherKnights[data.sid].y = data.y;
            otherKnights[data.sid].name = data.name;
            otherKnights[data.sid].char = data.char;
            otherKnights[data.sid].score = data.score;
        }
        else
        {
            otherKnights[data.sid] = new Knight(data.x, data.y, data.name, data.char, 0, spriteSheet);
        }
    }

    //connect to socket.io
    var socket = io(document.location.href);
    socket.on('w', function(data) {
        socket.ticket = data.sid;
        console.log("Server connected with ticket " + data.sid);

        playerKnight.x = data.x;
        playerKnight.y = data.y;

        for(var i = 0 ; i < data.nme.length; i++)
        {
            UpdateOtherKnightPosition(data.nme[i]);
        }

        //transmit name and character class to server
        socket.emit('i', {name: playerName, char: playerCharacter});

    });

    //set up the sprites
    var sprites = {
        floor: new Sprite(spriteSheet, 0,0,16,16),
        wall: new Sprite(spriteSheet, 32,0,32,32),
        greenDiamond: new Sprite(spriteSheet, 0,16,16,16)
    };

    //scale up the floor sprite
    sprites.floor.scale = 2;

    //create the camera and associated setup
    var camera = new CameraController(canvas, context);

    //generate a maze
    var maze = new exports.Maze(new exports.RandomNumberGenerator(), 16);

    //construct the maze batch draw
    var mazeDrawController = new SpriteBatch();
    for(var y = 0 ; y < maze.size; y++ )
    {
        for(var x = 0 ; x < maze.size; x++ )
        {
            var tile = maze.GetTileAtPosition(x,y);
            var bgsprite = tile.wall ? sprites.wall : sprites.floor;
            mazeDrawController.add(bgsprite, x*32, y*32);
        }
    }

    /**
     * BEGIN TEMPORARY
     */



    //keyboard listener
    document.onkeydown = function(e)
    {
        var newPositionX = playerKnight.x;
        var newPositionY = playerKnight.y;
        var direction = keyCodes[e.keyCode];

        if(!direction)
            return;

        newPositionX += direction.x;
        newPositionY += direction.y;

        if(TestActiveCollisions(newPositionX,newPositionY,e.keyCode) == false && maze.GetTileAtPosition(newPositionX, newPositionY).wall == false)
        {
            socket.emit('m', {ticket: socket.ticket, key: e.keyCode});
            playerKnight.x = newPositionX;
            playerKnight.y = newPositionY;
        }

    };

    function TestActiveCollisions(newPositionX, newPositionY, keyCode)
    {
        //Test for Knights
        for (var sid in otherKnights)
        {
            if(otherKnights[sid].x == newPositionX && otherKnights[sid].y == newPositionY)
            {
                if(keyCode==39)
                {
                    //allow the walk, trigger opponent death
                    //TODO: Trigger sword swing!
                }
                else if(keyCode==37)
                {
                    //block the walk, cannot kill yourself
                    return true;
                }
                else
                {
                    //block the walk
                    //TODO: consider the "push" mechanic here
                    return true;
                }
            }
        }
        return false;
    }

    socket.on('pu', function(data)
    {
        UpdateOtherKnightPosition(data);
    });

    socket.on('rm', function(data)
    {
        delete otherKnights[data.sid];
    });

    socket.on('k', function(data)
    {
        if(data.perp == socket.ticket)
        {
            //TODO: I Am The Murderer.  Increase own score
            playerKnight.score = data.perpScore;


        }
        else if(data.vic == socket.ticket)
        {
            //TODO: I Am The Victim, And Have Contracted 'Death' Logic!
            //Disconnect the socket to remove the Knight (and ensure it doesn't auto-reconnect!)
            //Go to Game Over page?
            //for now, reset
            window.location = window.location;
        }
        else
        {
            //TODO: Locate otherKnight with the given sid from data.perp, and set score to data.perpScore
        }

        //TODO: Play bloodsplatter

        //TODO: If just became Geoffrey, display the I AM (or THEY ARE) NOW GEOFFREY celebration thing

    });
    /**
     * END TEMPORARY
     */

    this.update = function(dt, t)
    {
        camera.setTarget(playerKnight.x*32, playerKnight.y*32);

        camera.update(dt);
        playerKnight.update(dt);

        for(var i in otherKnights)
        {
            otherKnights[i].update(dt);
        }
    };

    this.draw = function()
    {
        //clear full screen
        context.clearRect(0, 0, canvas.width, canvas.height);

        //draw the maze
        mazeDrawController.drawAll(camera);

        //set the font for player names now
        context.font="10px monospace";
        context.fillStyle = "white";
        context.textAlign = "center";

        //draw the knight
        playerKnight.draw(camera);

        //draw other knights
        for(var i in otherKnights)
        {
            otherKnights[i].draw(camera);
        }

        //draw the diamond?
        sprites.greenDiamond.draw(64+8, 8, camera);
    };
}