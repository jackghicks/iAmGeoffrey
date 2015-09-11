/**
 * MAnages an individual sprite inside a spritesheet
 * @param img - spritesheet
 * @param sx - topleft x of sprite
 * @param sy - topleft y of sprite
 * @param sWidth - width of sprite on sheet
 * @param sHeight - height of sprite on sheet
 * @constructor
 */
function Sprite(img, sx, sy, sWidth, sHeight) {
    this.img = img;
    this.sx = sx;
    this.sy = sy;
    this.sWidth = sWidth;
    this.sHeight = sHeight;
    this.scale = 1;
    this.rotation = 0;
    this.rhs = [0,0];

    this.draw = function(x, y, camera)
    {
        camera.drawImage(this.img, this.sx, this.sy, this.sWidth, this.sHeight, x, y, this.sWidth, this.sHeight, this.rotation, this.rhs, this.scale);
    }
}