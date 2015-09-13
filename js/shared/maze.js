exports = typeof exports === 'undefined' ? {} : exports;

/**
 * Maze Manager. Generates and holds the maze data.
 * @param randomNumberGenerator - a pre-seeded RandomNumberGenerator to use for generating this maze
 * @param size of maze (in walkable nodes, tile size will be double this)
 * @constructor
 */
exports.Maze = function(randomNumberGenerator, size)
{
    var removeDeadEnds = new exports.RandomNumberGenerator();

    this.size = size*2;

    var maze = new exports.ArrayGrid2D(0,0,size*2);
    var unvisited = new exports.ArrayGrid2D(1,0,size);

    var neighbor = [[0,1],[0,-1],[1,0],[-1,0]];

    //create the first path with a random initial point (positions on the path and on here are in "unvisited (1/2) space"
    var path =[];
    var here = [Math.floor(randomNumberGenerator.NextFloat()*size/2), Math.floor(randomNumberGenerator.NextFloat()*size/2)];

    //mark "here" as walkable on map, and visited
    maze.set(here[0]*2, here[1]*2, 1);
    unvisited.set(here[0], here[1], 0);

    //loop "forever"
    while(true)
    {
        //search for unvisited neighbors, starting with a random neighbor
        var neighborIndex = Math.floor(randomNumberGenerator.NextFloat()*4);
        var neighborFound = false;
        for(var i=0;i<4;i++)
        {
            neighborIndex = ++neighborIndex%4;

            //if we have an unvisited neighbor
            if(unvisited.get(here[0]+neighbor[neighborIndex][0], here[1]+neighbor[neighborIndex][1]))
            {
                //push old "here" onto the path stack
                path.push(here);

                //update "here"
                here = [here[0]+neighbor[neighborIndex][0], here[1]+neighbor[neighborIndex][1]];

                //mark as visited
                unvisited.set(here[0], here[1], 0);

                //mark neighbor as walkable
                maze.set(here[0]*2, here[1]*2, 1);

                //mark connecting wall as walkable
                maze.set(here[0]*2-neighbor[neighborIndex][0], here[1]*2-neighbor[neighborIndex][1], 1);

                //signal that a neighbor was found
                neighborFound = true;

                //break, we are done looking for neighbors
                break;
            }
        }

        //was an unvisited neighbor not found?
        if(!neighborFound)
        {
            //remove dead ends?
            if(removeDeadEnds)
            {
                var endNode = here;
                here = path.pop();

                if(removeDeadEnds.NextFloat()<0.5 && here) {
                    var direction = [here[0] - endNode[0], here[1] - endNode[1]];
                    maze.set(endNode[0] * 2 - direction[0], endNode[1] * 2 - direction[1], 1);
                }
            }
            else
            {
                //move backwards along the path
                here = path.pop();
            }
            //if we have no path left
            if(here==undefined)
            {
                //we are done!
                break;
            }
        }
    }

    this.GetTileAtPosition = function(x,y)
    {
        return {
            wall: maze.get(x,y)?false:true
        };
    };

};