function SetupTouchControls(inputHandler)
{

    function MoveListener(touch)
    {
        var movementAmount = 30;
        var keyCode = null;
        if((Math.abs(touch.moveX)>movementAmount*4) || ((Math.abs(touch.moveY)>movementAmount*4)))
        {
            touch.fast = true;
        }
        else
        {
            touch.fast=false;
        }


        if(touch.moveX > movementAmount)
        {
            keyCode = 39;
        }
        if(touch.moveX < -movementAmount)
        {
            keyCode = 37;
        }
        if(touch.moveY < -movementAmount)
        {
            keyCode = 38;
        }
        if(touch.moveY > movementAmount)
        {
            keyCode = 40;
        }

        if(keyCode && (!touch.done || touch.duration-(touch.reducer||0)> (touch.fast?50:200) ) )
        {
            touch.done = true;
            touch.reducer = (touch.reducer||0) +100;
            inputHandler({keyCode:keyCode});
        }

    }

    function EndListener(touch)
    {
        //if it has been clicked (low duration, low movement) then simulate space bar
        if(touch.duration<60)
        {
            if(touch.moveX<5 && touch.moveY<5)
            {
                inputHandler({keyCode: 32});
            }
        }
    }


    var touches = {};
    //tap listener
    document.body.addEventListener('touchstart', function(e)
    {
        for(var i = 0; i < e.changedTouches.length; i++)
        {
            var touch = e.changedTouches[i];
            touches[touch.identifier] = {startTime: Date.now(), startX: touch.screenX, startY: touch.screenY};
        }
        e.preventDefault();
    });
    document.body.addEventListener('touchmove', function(e)
    {
        for(var i = 0; i < e.changedTouches.length; i++)
        {
            var touch = e.changedTouches[i];
            MoveListener(UpdateInfo(touch, touches[touch.identifier]));
        }
        e.preventDefault();
    });

        function UpdateInfo(incoming, existing)
        {
            existing.duration = Date.now() - existing.startTime;
            existing.moveX = incoming.screenX - existing.startX;
            existing.moveY = incoming.screenY - existing.startY;
            existing.curX = incoming.screenX;
            existing.curY = incoming.screenY;
            return existing;
        }

    document.body.addEventListener('touchend', function(e)
    {
        for(var i = 0; i < e.changedTouches.length; i++)
        {
            var touch = e.changedTouches[i];
            EndListener(UpdateInfo(touch, touches[touch.identifier]));
            delete touches[touch.identifier];
        }
    });
    document.body.addEventListener('touchcancel', function(e) {
        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];
            delete touches[touch.identifier];
        }
    });
}
