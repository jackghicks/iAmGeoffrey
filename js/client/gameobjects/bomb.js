function Bomb(x, y)
{
    this.x = x;
    this.y = y;
    this.drawX = x * 32 + 8;
    this.drawY = y * 32 + 8;

    this.update = function(dt){};
    this.draw = function(camera)
    {
        var jX = Math.floor(Math.random()*4) -2;
        var jY = Math.floor(Math.random()*4) -2;
        sprites.bomb.draw(this.drawX + jX, this.drawY + jY, camera );
    };
}