exports = typeof exports === 'undefined' ? {} : exports;

/**
 * Manages a 2D grid of bit flags contained inside ints in an array
 * @param size
 * @constructor
 */
var BitwiseGrid2D = function(initialValue, offMapValue, size)
{
    //TODO: Implement bitwise grid, compare performance with array grid

};

/**
 * Manages a 2D grid of values
 * @param initialValue
 * @param offMapValue
 * @param size
 * @constructor
 */
exports.ArrayGrid2D = function(initialValue, offMapValue, size)
{
    var arr =[];
    for(var x = 0 ; x < size; x++ )
    {
        var innerArr = [];
        for(var y = 0 ; y < size; y++ )
        {
            innerArr.push(initialValue);
        }
        arr.push(innerArr);
    }

    this.size = size;

    this.get = function(x,y)
    {
        if(x<0||x>=size||y<0||y>=size)
        {
            return offMapValue;
        }
        else
        {
            return arr[x][y];
        }
    };

    this.set = function(x,y,v)
    {
        if(x<0||x>=size||y<0||y>=size)
        {
            //silently ignore
        }
        else
        {
            arr[x][y] = v;
        }
    };
};
