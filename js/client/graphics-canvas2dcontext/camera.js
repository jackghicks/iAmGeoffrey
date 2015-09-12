/**
 * MAnages a camera object which can then be used to draw onto a panning and scaling canvas
 * @param canvas
 * @param context
 * @constructor
 */
function CameraController(canvas, context)
{
    this.context = context;
    this.globalScale = 3.0;

    var LERPMULT = 4.5;

    this.drawableX = 0;
    this.drawableY = 0;

    var currentX = 1000;
    var currentY = 1000;

    var targetX = 0;
    var targetY = 0;

    this.setTarget = function(x,y)
    {
        targetX = x;
        targetY = y;
    };

    this.update = function(dt)
    {
        var diffX = targetX - currentX;
        var diffY = targetY - currentY;
        currentX += diffX*LERPMULT*(dt/1000);
        currentY += diffY*LERPMULT*(dt/1000);

        this.drawableX = currentX - (canvas.width/2)/this.globalScale;
        this.drawableY = currentY - (canvas.height/2)/this.globalScale;

    };

    this.drawImage = function(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, rotation, rotationHotspot, uniformScale)
    {
        dWidth = dWidth * uniformScale;
        dHeight = dHeight * uniformScale;


        //store the current transformation state
        context.save();

        //if rotation is zero
        if(rotation==0)
        {



            //perform scaling (scale down the canvas)
            context.scale(this.globalScale, this.globalScale);

            //transform by camera
            context.translate(-this.drawableX, -this.drawableY);

            //draw the image
            context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy+0.1, dWidth, dHeight);
        }
        else
        {
            var rx = rotationHotspot[0] * uniformScale;
            var ry = rotationHotspot[1] * uniformScale;



            context.translate(dx*this.globalScale,dy*this.globalScale);

            context.translate(rx*this.globalScale, ry*this.globalScale);

            context.scale(this.globalScale, this.globalScale);

            context.translate(-this.drawableX, -this.drawableY);

            context.rotate(rotation);

            //draw the image
            context.drawImage(image, sx, sy, sWidth, sHeight, -rx, -ry, dWidth, dHeight);


        }

        //move the canvas back to where it belongs!
        context.restore();
    };

    this.fillText = function(text, x, y)
    {
        //store the current transformation state
        context.save();

        //perform scaling (scale down the canvas)
        context.scale(this.globalScale, this.globalScale);

        //transform by camera
        context.translate(-this.drawableX, -this.drawableY);

        //draw the text
        context.fillText(text, x, y);

        //move the canvas back to where it belongs!
        context.restore();
    };

}