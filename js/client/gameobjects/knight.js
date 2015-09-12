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

        if(swordSwingElapsed)
        {
            swordSwingElapsed+=dt;
            if(swordSwingElapsed>swordSwingDuration)
            {
                swordSwingElapsed = 0;
            }
        }
    };

    var swordSwingDuration = 200;
    var swordSwingElapsed = 1;

    this.swingSword = function() {
        swordSwingElapsed = 1;
    };

    this.draw = function(camera)
    {
        var spriteHolding = null;
        if(this.holding=='reverse')
        {
            spriteHolding = sprites.greenDiamond;
        }
        if(this.holding=='bomb')
        {
            spriteHolding = sprites.bomb;
        }

        //lazily create the sprites on first draw
        if(!spriteKnight)
        {
            if(this.char=='m')
            {
                spriteKnight = new Sprite(spriteSheet, 0, 32, 32, 32);
                spriteSword = new Sprite(spriteSheet, 16, 0, 16, 32);
                spriteSword.rhs = [9, 21];
            }
            else if(this.char=='f')
            {
                spriteKnight = new Sprite(spriteSheet, 64, 32, 32, 32);
                spriteSword = new Sprite(spriteSheet, 80, 0, 16, 32);
                spriteSword.rhs = [9, 21];
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
                //control sword swing
                if(swordSwingElapsed)
                {

                    spriteSword.rotation = 0.3 + (swordSwingElapsed/swordSwingDuration)*1.3;

                }
                else
                {
                    spriteSword.rotation = 1.5;
                }


                //switch to gold sprite if needed
                if(this.gold)
                {
                    spriteKnight.sx += 32;
                }
                if(FLIPPED)
                {
                    spriteKnight.sy += 32;

                    //if flipped, should flip the rotation too
                    spriteSword.rotation = -spriteSword.rotation;
                }



                //draw the knight
                spriteKnight.draw(drawX, drawY, camera);
                spriteSword.draw(drawX + 16 - (FLIPPED?21:0), drawY, camera);


                if(spriteHolding)
                    spriteHolding.draw(drawX-4 + (FLIPPED?24:0), drawY+16, camera);

                //undo gold sprite switch!
                if(this.gold)
                {
                    spriteKnight.sx -= 32;
                }
                if(FLIPPED)
                {
                    spriteKnight.sy -= 32;
                }
            }
            //draw the players name
            camera.fillText(this.name + " - " + this.score, drawX + 16, drawY);
        }
    }
}