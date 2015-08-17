exports = typeof exports === 'undefined' ? {} : exports;

/* Simple XOR shift random */
exports.RandomNumberGenerator = function(x,y,z,w) {
    x = x || 123456789;
    y = y || 362436069;
    z = z || 521288629;
    w = w || 88675123;
    var t = 0;
    this.Next = function() {
        t = x ^ (x << 11);
        x = y;
        y = z;
        z = w;
        return w = w ^ (w >> 19) ^ (t ^ (t >> 8));
    };
    this.NextFloat = function() {
        return (this.Next()*2)/(0xFFFFFFFF)
    }
};

