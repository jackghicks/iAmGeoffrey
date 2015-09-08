
function TextAnnouncer(canvas, context)
{
    var messages = [];

    this.displayMessage = function(text, zone)
    {
        if(zone=='top')
        {
            var ypos = canvas.height/4;
            var font = "30px monospace";
        }
        else
        {
            var ypos = canvas.height/2;
            var font = "60px monospace";
        }
        messages.push(new TextMessage(text, canvas.width/2, ypos, font));
    };

    this.update = function(dt)
    {
        for(var i = 0 ; i < messages.length; i++)
        {
            if(messages[i])
            {
                //if update returns true, remove the message, it is complete!
                if(messages[i].update(dt))
                {
                    messages[i] = null;
                }
            }
        }
        //if the last one is null, pop it
        if(messages.length && !messages[messages.length-1])
        {
            messages.pop();
        }
    };

    this.draw = function()
    {
        for(var i = 0 ; i < messages.length; i++)
        {
            if (messages[i])
            {
                messages[i].draw(canvas, context);
            }
        }
    };

}

function TextMessage(msg, x, y, font)
{
    var duration = 2000;
    var elapsed = 0;

    this.update = function(dt)
    {
        elapsed += dt;

        if(elapsed > duration)
        {
            return true;
        }
    };

    this.draw = function(canvas, context)
    {
        context.save();

        //adjust alpha
        context.globalAlpha = 1.0 - (elapsed/duration);

        context.font = font;
        context.textAlign = "center";
        context.fillStyle = "white";

        context.translate(x,y);

        context.scale(1.0 + (elapsed/duration), 1.0 + (elapsed/duration));

        context.fillText(msg, 0, -50);

        context.restore();
    }
}