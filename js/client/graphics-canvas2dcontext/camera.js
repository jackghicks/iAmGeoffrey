/**
 * MAnages a camera object which can then be used to draw onto a panning and scaling canvas
 * @param canvas
 * @param context
 * @constructor
 */
function CameraController(canvas, context)
{
    this.context = context;
    this.globalScale = 2.0;

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
        var rx = rotationHotspot[0] * uniformScale;
        var ry = rotationHotspot[1] * uniformScale;

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
            context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        }
        else
        {
            dx *= this.globalScale;
            dy *= this.globalScale;

            //translate to bring us to the centre of the canvas
            context.translate((canvas.width/2), (canvas.height/2));

            //translate to offset our sprite relative to the centre of the canvas
            context.translate(0-(canvas.width/2-dx), 0-(canvas.height/2-dy));

            //translate to move sprites rendered position according to the pivot point
            context.translate(rx*this.globalScale, ry*this.globalScale);

            //perform rotation (rotate canvas)
            context.rotate(rotation);

            //perform scaling (scale down the canvas)
            context.scale(this.globalScale, this.globalScale);

            //transform by camera
            context.translate(-this.drawableX, -this.drawableY);

            //draw the image (rx and ry here affect the actual rendered position, so here is where rotational 'swing' offset can be introduced)
            context.drawImage(image, sx, sy, sWidth, sHeight, 0-rx, 0-ry, dWidth, dHeight);
        }

        //move the canvas back to where it belongs!
        context.restore();
    };

}