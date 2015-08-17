function Game(canvas, context, spriteSheet)
{

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
    var maze = new exports.Maze(new exports.RandomNumberGenerator(), 48);

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
    //create a knight for the local player
    var playerKnight = new Knight(3,2, spriteSheet);

    //keyboard listener
    document.onkeydown = function(e)
    {
        var newPositionX = playerKnight.x;
        var newPositionY = playerKnight.y;
        switch (e.keyCode)
        {
            case 37:
                newPositionX = playerKnight.x -1;
                break;
            case 38:
                newPositionY = playerKnight.y -1;
                break;
            case 39:
                newPositionX = playerKnight.x +1;
                break;
            case 40:
                newPositionY = playerKnight.y +1;
                break;
        }

        if(maze.GetTileAtPosition(newPositionX, newPositionY).wall == false)
        {
            playerKnight.x = newPositionX;
            playerKnight.y = newPositionY;
        }

    };


    /**
     * END TEMPORARY
     */
    this.update = function(dt, t)
    {
        camera.setTarget(playerKnight.x*32, playerKnight.y*32);

        camera.update(dt);
        playerKnight.update(dt);
    };

    this.draw = function()
    {
        //clear full screen
        context.clearRect(0, 0, canvas.width, canvas.height);

        //draw the maze
        mazeDrawController.drawAll(camera);

        //draw the knight
        playerKnight.draw(camera);

        //draw the diamond?
        sprites.greenDiamond.draw(64+8, 8, camera);
    };
}