function CalculateStartingPlace(maze, existingSessions)
{
    //select random x and y
    var x = Math.floor(Math.random()*maze.size);
    var y = Math.floor(Math.random()*maze.size);

    //if the tile is a wall, skip
    if(maze.GetTileAtPosition(x,y).wall)
        return CalculateStartingPlace(maze, existingSessions);

    //check all other layers
    for(var sid in existingSessions)
    {
        //if on the same y level, and within 3 squares in x land, skip
        if((Math.abs(existingSessions.x - x) < 3) && existingSessions.y == y)
            return CalculateStartingPlace(maze, existingSessions);
    }

    //wasn't skipped, so return the x y
    return {x:x,y:y};
}