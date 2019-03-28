/**
 * author: keyzeroc
 */
var canvas, canvasCtx;
/**
 * called when page is loaded.
 * setups canvas.
 * setups listeners.
 * requests animation frame for function loop().
 */
window.onload = function(){
    setupCanvasAndContext();
    window.onresize = setupCanvasDimensions;
    canvas.onmousemove = mouseTracker.mouseMove;
    canvas.onclick = mouseTracker.mouseClick;
    requestAnimationFrame(loop);
}
/**
 * main function that loops continiously.
 * update and render function calls located here.
 */
function loop(){
    requestAnimationFrame(loop); 
    canvasCtx.clearRect(0,0,canvas.width,canvas.height);
    bubbleProducer.updAndDrawBubbles();
}
/**
 * object responsible for creating bubbles,
 * and storing bubble array.
 */
var bubbleProducer = {
    bubbleArr : new Array(),
    bubblesMax : 200,
    /**
     * called when mouse is moved.
     * if our bubble array is not full -
     * creates bubble particle that moves in the direction that the mouse was moving.
     * @param {int} mouseX - cursor position X.
     * @param {int} mouseY - cursor position Y.
     * @param {int} xPrev  - previous cursor position X.
     * @param {int} yPrev  - previous cursor position Y.
     */
    produceBubbleMove : function(mouseX, mouseY, xPrev, yPrev){
        if(bubbleProducer.bubbleArr.length!=this.bubblesMax){
            let speedMult = 0.38;
            bubbleProducer.bubbleArr.push(new Bubble(
                mouseX,
                mouseY,
                mouseX-xPrev !=0 ? (mouseX-xPrev)*speedMult : -1,
                mouseY-yPrev !=0 ? (mouseY-yPrev)*speedMult : -1,
                getRandomInt(4,11),
                0.008
            ));
        }     
    },
    /**
     * called when mouse is clicked.
     * if bubbleArr is not full -
     * creates particles in special pattern,
     * depending on pattern id argument that is passed.
     * @param {int} mouseX - cursor position X.
     * @param {int} mouseY - cursor position Y.
     * @param {String} pattern - id of pattern that we want to use.
     */
    produceBubbleClick : function(mouseX, mouseY, pattern){
        if(bubbleProducer.bubbleArr.length!=this.bubblesMax){
            let radiuses = [8,5];
            let speedMult = 2.5;
            let directions;
            if(pattern==1){
                directions = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
            }else if(pattern==2){
                directions = [
                    [0,-1],[0.5,-1],[1,-1],[1,-0.5],
                    [1,0],[1,0.5],[1,1],[0.5,1],
                    [0,1],[-0.5,1],[-1,1],[-1,0.5],
                    [-1,0],[-1,-0.5],[-1,-1],[-0.5,-1]
                ];  
            }else{
                directions = [[0,0]];
            }        
            for(let i=0;i<directions.length;i++){
                bubbleProducer.bubbleArr.push(new Bubble(
                    mouseX,
                    mouseY,
                    directions[i][0]*speedMult,                  
                    directions[i][1]*speedMult,
                    radiuses[i%2],//each second bubble radius is small(radiuses[0],radiuses[1],radiuses[0]...)
                    0.02
                ));
            }         
        }
    },
    /**
     * updates and draws each particle that is in bubbleArr array.
     * deletes bubble from array if bubble is not visible:
     * if bubble opacity is 0,
     * or it's out of window borders.
     */
    updAndDrawBubbles : function(){
        for(let i=0;i<this.bubbleArr.length;i++){
            let bubble = this.bubbleArr[i];
            bubble.update();
            bubble.draw();
            if(bubble.x>=canvas.width||bubble.x<=0||bubble.y>=canvas.height||bubble.y<=0||bubble.color.a<=0){
                this.bubbleArr.splice(i,1);
            }
        }
    }
}
/**
 * object responsible for handling mouse actions,
 * and store previous action mouse X and Y coordinates.
 */
var mouseTracker = {
    xPrev : 0,
    yPrev : 0,
    /**
     * handles mouse movement.
     * updates mouse coordinates div.
     * calls bubbleProducer.produceBubbleMove() when mouse is moved.
     * sets xPrev and yPrev at the end.
     * @param {MouseEvent} event - used to get cursor X and Y coordinates.
     */
    mouseMove : function(event){
        event = event || window.event; 

        mouseX = event.clientX + document.body.scrollLeft;
        mouseY = event.clientY + document.body.scrollTop;
        document.querySelector("#mouseCoords").textContent = "x: "+mouseX+", y: "+mouseY;

        bubbleProducer.produceBubbleMove(mouseX, mouseY, this.xPrev, this.yPrev);

        this.xPrev = mouseX; 
        this.yPrev = mouseY;
    },
    /**
     * handles mouse clicks.
     * udates mouse coordinates div.
     * calls bubbleProducer.produceBubbleClick() when mouse is clicked.
     * sets xPrev and yprev at the end.
     * @param {MouseEvent} event - used to get cursor X and Y coordinates.
     */
    mouseClick : function(event){
        event = event || window.event; 

        mouseX = event.clientX + document.body.scrollLeft;
        mouseY = event.clientY + document.body.scrollTop;
        document.querySelector("#mouseCoords").textContent = "x: "+mouseX+", y: "+mouseY;

        bubbleProducer.produceBubbleClick(mouseX, mouseY,"2");//CHANGE PATTERN HERE

        this.xPrev = mouseX; 
        this.yPrev = mouseY;
    }
};
/**
 * 
 * @param {int} r - red value.
 * @param {int} g - green value.
 * @param {int} b - blue value.
 * @param {int} a - alpha value(opacity).
 */
function RGBA(r,g,b,a){
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    /**
     * creates and returns rgba() string.
     */
    this.getRGBA = function(){
        return "rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
    }
}
/**
 * 
 * @param {int} x - x position.
 * @param {int} y - y position.
 * @param {double} xSpeed - x speed,but it's more like direction.
 * @param {double} ySpeed - y speed,but it's more like direction.
 * @param {int} radius - radius of bubble.
 * @param {double} lifeDrain - how fast alpha(opacity) is decreased.
 */
function Bubble(x, y, xSpeed, ySpeed, radius, lifeDrain){
    this.color = new RGBA(
        getRandomInt(100,255),
        getRandomInt(100,255),
        getRandomInt(100,255),
        1
    );
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.radius = radius;
    this.lifeDrain = lifeDrain;
    /**
     * update bubble position.
     * decrease alpha(opacity).
     */
    this.update = function(){
        this.x+=xSpeed;
        this.y+=ySpeed;
        this.color.a = this.color.a-lifeDrain;
    }
    /**
     * draw bubble as a circle,
     * and fill it with this.color;
     */
    this.draw = function(){
        canvasCtx.fillStyle = this.color.getRGBA();
        canvasCtx.beginPath();
        canvasCtx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        canvasCtx.fill();
    }
}
/**
 * set canvas variable to canvas element.
 * set canvasCtx to canvas context.
 * call setupCanvasDimensions().
 */
function setupCanvasAndContext(){
    canvas = document.querySelector('canvas');
    canvasCtx = canvas.getContext('2d');
    setupCanvasDimensions();
}
/**
 * set canvas width and height to window's inner width and height.
 */
function setupCanvasDimensions(){
    canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
} 
/**
 * get random number between min and max.
 * @param {int} min - minimum, included.
 * @param {int} max - maximum, included.
 */
function getRandomInt(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}
