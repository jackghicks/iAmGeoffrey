function Knight(initialX, initialY, name, char, score, spriteSheet)
{
    var spriteKnight = null;
    var spriteSword = null;
    var spriteDead = new Sprite(spriteSheet, 64, 16, 16, 16);
    spriteDead.scale = 2;

    this.x = initialX;
    this.y = initialY;
    this.name = name;
    this.char = char;
    this.score = score;
    this.gold = false;

    var LERPMULT = 20;
    var drawX = this.x*32;
    var drawY = this.y*32;

    this.update = function(dt)
    {
        var diffX = this.x*32 - drawX;
        var diffY = this.y*32 - drawY;
        drawX += diffX*LERPMULT*(dt/1000);
        drawY += diffY*LERPMULT*(dt/1000);
    };

    this.draw = function(camera)
    {
        //lazily create the sprites on first draw
        if(!spriteKnight)
        {
            if(this.char=='m')
            {
                spriteKnight = new Sprite(spriteSheet, 0, 32, 32, 32);
                spriteSword = new Sprite(spriteSheet, 16, 0, 16, 32);
                spriteSword.rotationHotSpot = [9, 21];
            }
            else if(this.char=='f')
            {
                spriteKnight = new Sprite(spriteSheet, 64, 32, 32, 32);
                spriteSword = new Sprite(spriteSheet, 80, 0, 16, 32);
                spriteSword.rotationHotSpot = [9, 21];
            }
        }
        else
        {
            if(this.dead)
            {
                //draw the blood puddle
                spriteDead.draw(drawX, drawY, camera);
            }
            else
            {
                //switch to gold sprite if needed
                if(this.gold)
                {
                    spriteKnight.sx += 32;
                }
                //draw the knight
                spriteKnight.draw(drawX, drawY, camera);
                spriteSword.draw(drawX + 16, drawY, camera);

                //undo gold sprite switch!
                if(this.gold)
                {
                    spriteKnight.sx -= 32;
                }
            }
            //draw the players name
            camera.fillText(this.name + " - " + this.score, drawX + 16, drawY);
        }
    }
}