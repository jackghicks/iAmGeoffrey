var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);

        //load an image!
        var img = new Image();
        img.src = 'sprites.png';

        //when the image is loaded, trigger initial draw and resizing of canvas
        img.onload = function()
        {
            //get the canvas
            var canvas = document.getElementsByTagName('canvas')[0];
            var context = canvas.getContext('2d');

            //create the Game object, passng in the canvas and the spritesheet
            var game = new Game(canvas, context, img);

            //call resizeCanvas immediately to get the ball rolling
            resizeCanvas();

            // resize the canvas to fill browser window dynamically
            window.addEventListener('resize', resizeCanvas, false);
            function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                context.mozImageSmoothingEnabled = false;
                context.webkitImageSmoothingEnabled = false;
                context.msImageSmoothingEnabled = false;
                context.imageSmoothingEnabled = false;
                browserTick();
            }

            //declare some timer variables
            var lastTime = 0;
            var frameCount = 0;
            var frameCountResetTime = Date.now();

            //function to perform on each requestAnimationFrame callback
            function browserTick()
            {
                var dateNow = Date.now();
                lastTime = lastTime || dateNow;
                game.update(dateNow - lastTime, dateNow);
                lastTime = dateNow;
                game.draw();
                requestAnimationFrame(browserTick);

                //FPS counter
                frameCount++;
                if(dateNow>frameCountResetTime+500)
                {
                    var fps = (frameCount / (dateNow-frameCountResetTime)) * 1000;
                    frameCount = 0;
                    frameCountResetTime = dateNow;
                    document.getElementById('debug').innerText = "FPS: " + fps.toFixed(3);
                }
            }

        };

    }
}, 10);












