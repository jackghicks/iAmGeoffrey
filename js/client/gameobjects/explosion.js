function Explosion(x, y, delay, spriteSheet)
{
    var sprite = new Sprite(spriteSheet, 112,0,16,16)
    sprite.scale = 2;

    var elapsed = 0;
    var lifeTime = 1000;
    this.delay = delay;

    this.drawX = x*32;
    this.drawY = y*32;

    this.update = function(dt) {
        elapsed += dt;
        if(elapsed > lifeTime+delay) this.expired = true;
    };

    this.draw = function(camera)
    {
        if(elapsed > delay) {
            var jX = Math.floor(Math.random() * 6) - 2;
            var jY = Math.floor(Math.random() * 6) - 2;
            sprite.draw(this.drawX + jX, this.drawY + jY, camera);
        }
    };
}