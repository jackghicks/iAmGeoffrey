function BloodSplatter(x, y, hDirBias, spriteSheet)
{


    this.x = x;
    this.y = y;
    var drawX = x * 32 + 16; //middle
    var drawY = y * 32 + 16; //middle

    var gravity = 981;
    var splatCount = 20;
    var minVel = {x: -500, y: -200};
    var maxVel = {x: 500, y: 50};
    var startScale = 0.5;
    var endScale = 1.8;
    var lifeTime = 500;
    var elapsed = 0;

    //generate splats
    var splats = [];
    for(var i=0;i<splatCount; i++)
    {
        var vel = {
            x: minVel.x + (Math.random()*(maxVel.x-minVel.x)) + hDirBias,
            y: minVel.y + (Math.random()*(maxVel.y-minVel.y))
        };
        splats.push(new Splat(i%4, {x: drawX, y: drawY}, vel, Math.random()*endScale));
    }

    this.update = function(dt){

        //count elapsed time
        elapsed+=dt;

        //check expiry
        if(elapsed>lifeTime)
            this.expired = true;

        //update splats
        for(var i =0 ; i < splats.length; i++) {
            splats[i].update(dt);
        }
    };
    this.draw = function(camera)
    {
        for(var i =0 ; i < splats.length; i++) {
            splats[i].draw(camera);
        }
    };



    function Splat(spriteIdx, pos, vel, endScale)
    {
        var sprite = null;

        if(spriteIdx==0)
            sprite = new Sprite(spriteSheet, 64,0,8,8);
        if(spriteIdx==1)
            sprite = new Sprite(spriteSheet, 72,0,8,8);
        if(spriteIdx==2)
            sprite = new Sprite(spriteSheet, 64,8,8,8);
        if(spriteIdx==3)
            sprite = new Sprite(spriteSheet, 72,8,8,8);


        this.update = function(dt)
        {
            var dtSec = dt/1000;

            //gravity
            vel.y += gravity*dtSec;

            //update positions
            pos.x += vel.x*dtSec;
            pos.y += vel.y*dtSec;

            sprite.scale = startScale + endScale*(elapsed/lifeTime);
            sprite.alpha = Math.min(1.4-(elapsed/lifeTime), 1);

        };
        this.draw = function(camera)
        {
            sprite.draw(pos.x, pos.y, camera);
        };
    }
}