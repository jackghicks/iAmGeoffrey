/**
 * Calculate Starting Place for item or player
 * @param maze
 * @param existingSessions
 * @param collectables
 * @returns {*}
 * @constructor
 */
function CalcSP(maze, existingSessions, collectables)
{
    //select random x and y
    var x = Math.floor(Math.random()*maze.size);
    var y = Math.floor(Math.random()*maze.size);

    //if the tile is a wall, skip
    if(maze.GetTileAtPosition(x,y).wall)
        return CalcSP(maze, existingSessions, collectables);

    //check all other layers
    for(var sid in existingSessions)
    {
        //if on the same y level, and within 3 squares in x land, skip
        if((Math.abs(existingSessions[sid].x - x) < 3) && existingSessions[sid].y == y)
            return CalcSP(maze, existingSessions, collectables);
    }

    //check all other layers
    for(var i = 0; i<collectables.length; i++)
    {
        //if on the same y level, and within 3 squares in x land, skip
        if((Math.abs(collectables[i].x - x) < 3) && collectables[i].y == y)
            return CalcSP(maze, existingSessions, collectables);
    }

    //wasn't skipped, so return the x y
    return {x:x,y:y};
}