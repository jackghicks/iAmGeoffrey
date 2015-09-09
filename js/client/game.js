var FLIPPED = false;

function Game(canvas, context, spriteSheet)
{

    //create a TextAnouncer
    var textAnnouncer = new TextAnnouncer(canvas, context);

    //create a knight for the local player and a dictionary for other players
    var playerKnight = new Knight(0,0, playerName, playerCharacter, 0, spriteSheet);
    var otherKnights = {};

    var collectables = [];

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

        FLIPPED = data.flipped;

        collectables = data.collectables;

        for(var i = 0 ; i < data.nme.length; i++)
        {
            UpdateOtherKnightPosition(data.nme[i]);
        }

        //transmit name and character class to server
        socket.emit('i', {name: playerName, char: playerCharacter});
    });

    socket.on('c', function(data) {
        if(data.collect)
        {
            for(var i = 0 ;i <collectables.length; i++)
            {
                if(collectables[i].x == data.collect.x && collectables[i].y == data.collect.y)
                {
                    collectables.splice(i, 1);
                    break;
                }
            }
        }
        if(data.add)
        {
            collectables.push(data.add);
        }
    });

    socket.on('f', function(data) {
        if(FLIPPED!= data.flipped)
        {
            textAnnouncer.displayMessage("REVERSED!", "middle");
            textAnnouncer.displayMessage(data.name + " has reversed the game!", "top");
        }
        FLIPPED = data.flipped;
    });

    socket.on('cp', function(data) {
        var players = data.players;
        var topScore =  players[0].score;
        for(var i=0;i<players.length; i++)
        {
            //handle gilded status!
            var isGold = players[i].score == topScore;
            if(players[i].sid == socket.ticket)
            {
                playerKnight.gold = isGold;
            }
            else if(otherKnights[players[i].sid])
            {
                otherKnights[players[i].sid].gold = isGold;
            }

            players[i] = players[i].name + " - " + players[i].score;
        }
        document.getElementById('btl').innerHTML = data.players.join("<br />");
    });

    //set up the sprites
    var sprites = {
        floor: new Sprite(spriteSheet, 0,0,16,16),
        wall: new Sprite(spriteSheet, 32,0,32,32),
        greenDiamond: new Sprite(spriteSheet, 0,16,16,16),
        bomb: new Sprite(spriteSheet, 96,0,16,16),
        point: new Sprite(spriteSheet, 96,16,16,16)
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
        if( e.keyCode == 32)
        {
            socket.emit('p', { x: playerKnight.x, y: playerKnight.y });
        }

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
            if(!otherKnights[sid].dead && otherKnights[sid].x == newPositionX && otherKnights[sid].y == newPositionY)
            {
                if(keyCode==(FLIPPED?37:39))
                {
                    //allow the walk, trigger opponent death
                    //TODO: Trigger sword swing!
                }
                else if(keyCode==(FLIPPED?39:37))
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
            //I Am The Murderer.
            //increase own score
            playerKnight.score = data.perpScore;

            //mark victim as dead
            otherKnights[data.vic].dead = true;

            //trigger "You killed X" message
            textAnnouncer.displayMessage("You killed " + otherKnights[data.vic].name, "top");
        }
        else if(data.vic == socket.ticket)
        {
            //I Am The Victim
            //mark own character as dead
            playerKnight.dead = true;

            //HACK: Disable movement
            keyCodes = [];

            //trigger "X killed you" message
            textAnnouncer.displayMessage(otherKnights[data.perp].name + " killed you", "top");

            textAnnouncer.displayMessage("You Are Dead.", "middle");

            //after 3 seconds, refresh the page to trigger respawn
            setTimeout(function()
            {
                window.location = window.location;
            }, 3000);
        }
        else
        {
            //update score of perpetrator
            otherKnights[data.perp].score = data.perpScore;

            //mark victim as dead
            otherKnights[data.vic].dead = true;

            //trigger "X killed Y" message
            textAnnouncer.displayMessage(otherKnights[data.perp].name + " killed " + otherKnights[data.vic].name, "top");

        }




        //TODO: Play blood splatter

    });
    /**
     * END TEMPORARY
     */

    this.update = function(dt, t)
    {
        camera.setTarget(playerKnight.x*32, playerKnight.y*32);

        camera.update(dt);
        playerKnight.update(dt);

        textAnnouncer.update(dt);

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

        RenderCollectables(camera);

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

        textAnnouncer.draw();
    };

    function RenderCollectables(camera)
    {
        for(var i = 0 ; i < collectables.length; i++)
        {
            var x = collectables[i].x*32 + 8;
            var y = collectables[i].y*32 + 8;
            var sprite = null;
            if(collectables[i].type=='bomb')
            {
                sprite = sprites.bomb;
            } else if(collectables[i].type=='point')
            {
                sprite = sprites.point;
            } else if(collectables[i].type=='reverse')
            {
                sprite = sprites.greenDiamond;
            }
            sprite.draw(x,y,camera);
        }
    }

}

