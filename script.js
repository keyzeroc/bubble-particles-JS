/**
 * author: keyzeroc
 */
var canvas, canvasCtx;
var particleProducer;
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
    particleProducer = new ParticleProducer(200, new BubbleFactory());
    requestAnimationFrame(loop);
}
/**
 * main function that loops continiously.
 * update and render function calls located here.
 */
function loop(){
    requestAnimationFrame(loop); 
    canvasCtx.clearRect(0,0,canvas.width,canvas.height);
    particleProducer.updAndDrawParticles();
}
/**
 * basic factory parent
 */
class ParticleFactory{
    produce(x, y, xSpeed, ySpeed, lifeDrain, size){};
}
/**
 * responsible for creating and returning bubble particle
 */
class BubbleFactory extends ParticleFactory{
    produce(x,y,xSpeed,ySpeed,lifeDrain,size){
        return new BubbleParticle(x, y, xSpeed, ySpeed, lifeDrain, size);
    };
}
/**
 * responsible for creating and returning rectangle particle
 */
class RectangleFactory extends ParticleFactory{
    produce(x,y,xSpeed,ySpeed,lifeDrain,size){
        size*=1.6; // rectangles look smaller than bubbles so make them bigger
        return new RectangleParticle(x, y, xSpeed, ySpeed, lifeDrain, size, size);
    }
}
/**
 * responsible for storing particles array
 * and choosing particle patterns.
 */
class ParticleProducer{  
    constructor(particlesMax, factory){
        this.particlesMax = particlesMax;
        this.factory = factory;
        this.particlesArray = new Array();
    }
    /**
     * called when mouse is moved.
     * if particlesArray is not full -
     * create particle that moves in the direction that the mouse was moving.
     * @param {int} mouseX - cursor position X.
     * @param {int} mouseY - cursor position Y.
     * @param {int} xPrev  - previous cursor position X.
     * @param {int} yPrev  - previous cursor position Y.
     */
    produceParticleMove(mouseX, mouseY, xPrev, yPrev){
        if(this.particlesArray.length!=this.particlesMax){
            let xSpeed = mouseX-xPrev !=0 ? (mouseX-xPrev)*0.38 : -1;
            let ySpeed = mouseY-yPrev !=0 ? (mouseY-yPrev)*0.38 : -1;
            this.particlesArray.push(this.factory.produce(
                mouseX, 
                mouseY, 
                xSpeed, 
                ySpeed, 
                0.008, 
                getRandomInt(5,8)
            ));
        }     
    }
    /**
     * called when mouse is clicked.
     * if particlesArray is not full -
     * creates particles in special pattern,
     * depending on pattern id argument that is passed.
     * @param {int} mouseX - cursor position X.
     * @param {int} mouseY - cursor position Y.
     * @param {String} pattern - id of pattern that we want to use.
     */
    produceParticleClick(mouseX, mouseY, pattern){
        if(this.particlesArray.length!=this.particlesMax){
            let sizes = [8,5];
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
                this.particlesArray.push(this.factory.produce(
                    mouseX,
                    mouseY,
                    directions[i][0]*speedMult,                  
                    directions[i][1]*speedMult,
                    0.02,
                    sizes[i%2]//each second particle is small(sizes[0],sizes[1],sizes[0]...) 
                ));
            }         
        }
    }
    /**
     * updates and draws each particle that is in particlesArray array.
     * deletes particle from array if particle is not visible:
     * if particle alpha equals 0,
     * or it's out of window borders.
     */
    updAndDrawParticles(){
        for(let i=0;i<this.particlesArray.length;i++){
            let particle = this.particlesArray[i];
            particle.update();
            particle.draw();
            if(particle.x>=canvas.width||particle.x<=0||particle.y>=canvas.height||particle.y<=0||particle.color.a<=0){
                this.particlesArray.splice(i,1);
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
     * calls ParticleProducer.produceParticleMove() when mouse is moved.
     * sets xPrev and yPrev at the end.
     * @param {MouseEvent} event - used to get cursor X and Y coordinates.
     */
    mouseMove(event){
        event = event || window.event; 

        mouseX = event.clientX + document.body.scrollLeft;
        mouseY = event.clientY + document.body.scrollTop;
        document.querySelector("#mouseCoords").textContent = "x: "+mouseX+", y: "+mouseY;

        particleProducer.produceParticleMove(mouseX, mouseY, this.xPrev, this.yPrev);

        this.xPrev = mouseX; 
        this.yPrev = mouseY;
    },
    /**
     * handles mouse clicks.
     * udates mouse coordinates div.
     * calls ParticleProducer.produceParticleClick() when mouse is clicked.
     * sets xPrev and yprev at the end.
     * @param {MouseEvent} event - used to get cursor X and Y coordinates.
     */
    mouseClick(event){
        event = event || window.event; 

        mouseX = event.clientX + document.body.scrollLeft;
        mouseY = event.clientY + document.body.scrollTop;
        document.querySelector("#mouseCoords").textContent = "x: "+mouseX+", y: "+mouseY;

        particleProducer.produceParticleClick(mouseX, mouseY,"2");//CHANGE PATTERN HERE

        this.xPrev = mouseX; 
        this.yPrev = mouseY;
    }
};
/**
 * responsible for storing and returning r g b a values.
 * @param {int} r - red value.
 * @param {int} g - green value.
 * @param {int} b - blue value.
 * @param {int} a - alpha value(opacity).
 */
class RGBA{
    constructor(r,g,b,a){
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    //creates and returns rgba() string.
    getRGBA(){
        return "rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
    }
}
/**
 * represents basic particle.
 * @param {int} x - x position.
 * @param {int} y - y position.
 * @param {double} xSpeed - x speed,but it's more like direction.
 * @param {double} ySpeed - y speed,but it's more like direction.
 * @param {double} lifeDrain - how fast alpha(opacity) is decreased.
 */
class Particle{
    constructor(x,y,xSpeed,ySpeed,lifeDrain){
        this.x = x;
        this.y = y;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.lifeDrain = lifeDrain;
    }
    draw(){}
    update(){}
}
/**
 * represents bubble particle.
 * @param {int} x - x position.
 * @param {int} y - y position.
 * @param {double} xSpeed - x speed,but it's more like direction.
 * @param {double} ySpeed - y speed,but it's more like direction.
 * @param {double} lifeDrain - how fast alpha(opacity) is decreased.
 * @param {int} radius - radius of bubble
 */
class BubbleParticle extends Particle{
    constructor(x,y,xSpeed,ySpeed,lifeDrain,radius){
        super(x,y,xSpeed,ySpeed,lifeDrain);
        this.color = new RGBA(
            getRandomInt(100,255),
            getRandomInt(100,255),
            getRandomInt(100,255),
            1
        );
        this.lifeDrain = lifeDrain;
        this.radius = radius;     
    }
    /**
     * update bubble position.
     * decrease alpha(opacity).
     */
    update(){
        this.x+=this.xSpeed;
        this.y+=this.ySpeed;
        this.color.a = this.color.a-this.lifeDrain;
    }
    /**
     * draw bubble as a circle,
     * and fill it with specified color.
     */
    draw(){
        canvasCtx.fillStyle = this.color.getRGBA();
        canvasCtx.beginPath();
        canvasCtx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        canvasCtx.fill();
    }
}
/**
 * represents rectangle particle.
 * @param {int} x - x position.
 * @param {int} y - y position.
 * @param {double} xSpeed - x speed,but it's more like direction.
 * @param {double} ySpeed - y speed,but it's more like direction.
 * @param {double} lifeDrain - how fast alpha(opacity) is decreased.
 * @param {int} width - width of rectangle.
 * @param {int} height - height of rectangle.
 */
class RectangleParticle extends Particle{
    constructor(x,y,xSpeed,ySpeed,lifeDrain,width,height){
        super(x,y,xSpeed,ySpeed);
        this.lifeDrain = lifeDrain;
        this.width = width;
        this.height = height;
        this.color = new RGBA(
            getRandomInt(100,255),
            getRandomInt(100,255),
            getRandomInt(100,255),
            1
        );
    }
    /**
     * update rectangle position.
     * decrease alpha(opacity).
     */
    update(){
        this.x+=this.xSpeed;
        this.y+=this.ySpeed;
        this.color.a = this.color.a-this.lifeDrain;
    }
    /**
     * draw rectangle,
     * and fill it with specified color.
     */
    draw(){
        canvasCtx.fillStyle = this.color.getRGBA();
        canvasCtx.beginPath();
        canvasCtx.rect(this.x,this.y,this.width,this.height);
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
