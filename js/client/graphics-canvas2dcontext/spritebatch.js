/**
 * Allows a whole bunch of sprite draw calls (without rotation) to be performed quickly
 * @constructor
 */
function SpriteBatch()
{
    var spriteList = [];

    this.add = function(sprite, x, y)
    {
        spriteList.push({sprite:sprite, x:x, y:y});
    };

    this.drawAll = function(camera)
    {
        var context = camera.context;

        //store the current transformation state
        context.save();

        //scale by global context
        context.scale(camera.globalScale, camera.globalScale);

        //transform by camera
        context.translate(-camera.drawableX, -camera.drawableY);

        for(var i = 0 ; i < spriteList.length; i++)
        {
            var sprite = spriteList[i].sprite;

            //draw the image
            context.drawImage(sprite.img, sprite.sx, sprite.sy, sprite.sWidth, sprite.sHeight, spriteList[i].x, spriteList[i].y, sprite.sWidth*sprite.scale, sprite.sHeight*sprite.scale);
        }

        //store the current transformation state
        context.restore();

    };
}