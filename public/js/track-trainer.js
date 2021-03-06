$(document).ready(function() {

$("#track-trainer").bind("reload", function () {
    resetState();
});

var dim = $("#track-trainer").parent().width();
var score = $("#score");
var highScoreNum = $("#highScoreNum");
// handler of the score counter interval
var counter = null;
//flag that tells whether app is running
var _started = false;


var difficulty = null;
var speed = null;
// max_da = maximum amount of degrees to change in one dx
var max_da = null;
var size = null;
var mustClick = null;

var color = "red";

var draw = SVG("track-trainer").size(dim, dim);
var rect = draw.rect(dim, dim).attr({ fill: "#E3E8E6" });
var target = draw.circle(1).center(dim/2, dim/2).fill(color);

// Set all animation variables
resetState();

// always variable
var angle = getRandomAngle(0, 360);
var _smooth_factor = 0.001 * difficulty;

$("#track-trainer").bind("mouseup", function () {
    target.fire("mouseup");
    $("#track-trainer").data("down", false);
});
$("#track-trainer").bind("mousedown", function () {
    $("#track-trainer").data("down", true)
});

// update is called on every animation step
function update(dt) {
    // console.log(speed, difficulty, size, max_da);

    if (!_started){
        return;
    }

    var angUpdate = getRandomAngle(-max_da/2, max_da/2); 
    // Smooth the wobblies  
    if (-_smooth_factor < angUpdate < _smooth_factor){angUpdate = 0}
    // Old angle + update
    var newAngle = twitch(angle + angUpdate);

    // if (newAngle > 360){newAngle = newAngle - 360}
    // if (newAngle < 0){newAngle = newAngle + 360}

    var move = p2c(speed, newAngle);

    while (!checkCollision(target, move)){
        newAngle = -newAngle + getRandomAngle(-30, 30);
        move = p2c(speed, newAngle);
    }

    target.dmove(move.x, move.y);

    angle = newAngle;
}

// Polar to Cartesian
function p2c(r, theta){
    x = r * Math.cos(theta);
    y = r * Math.sin(theta);
    return {x: x, y: y};
}

function getRandomAngle(min, max) {
    return Math.random() * (max - min) + min;
}

function twitch(angle) {
    if (Math.random() > (1 - 0.01 * difficulty)){
        return getRandomAngle(0, 360);
    }
    else {
        return angle;
    }
}

function resetState() {
    target.center(dim/2, dim/2);
    _started = false;
    size = getSettingVal("size"); 
    difficulty = getSettingVal("difficulty");
    speed = getSettingVal("speed");
    target.radius(size/2);
    max_da = difficulty / 10;
    target.off();   // Unbind listeners
    mustClick = $("#mustClick").is(":checked");
    if (mustClick){
        target.on("mousedown", function () {
            if(_started){
                counter = setInterval(function () {
                    incrementScore();
                }, 50);
            }
        });
        target.on("mouseover", function () {
            if(_started && $("#track-trainer").data("down")){
                counter = setInterval(function () {
                    incrementScore();
                }, 50);
            }
        });
        target.on("mouseup", function () {
            clearInterval(counter);
        });

    }
    else {
        target.on("mouseover", function () {
            if(_started){
                counter = setInterval(function () {
                    incrementScore();
                }, 50);
            }
        });
    }
    target.on("mouseout", function () {
        clearInterval(counter);
    });
    $("#score").text(0);
    if (Cookies.getJSON("highScore")){
        highScoreNum.text(Cookies.getJSON("highScore")["score"]);
        $("#highScoreMode").text(Cookies.getJSON("highScore")["mode"]);
    }
    else {
        highScoreNum.text(0);
        $("#highScoreMode").text($("track-trainer").data("mode"));
    }
    cancelAnimationFrame(animFrame);
}

function checkCollision(target, move){
    var cx = target.cx()
      , cy = target.cy();

    // check if we hit bottom/top borders
    if (cy + move.y < size || cy + move.y > dim - size) {
        return false;
    }

    // check if we hit left/right borders
    if (cx + move.x < size || cx + move.x > dim - size) {
        return false;
    }

    return true;
}

function incrementScore () {
    var scoreNum = parseInt(score.text());
    var hsNum = parseInt(highScoreNum.text())
    var mode = $("#track-trainer").data("mode");
    console.log(mode);
    score.text(scoreNum+1);
    if(scoreNum > hsNum+1){
        Cookies.set("highScore", {"score": scoreNum+1, "mode": mode});
    }
}

// Animation
var lastTime, animFrame;

function anim_callback(ms) {
    if (window.settingsChanged){
        resetState();
        return;
    }

    // we get passed a timestamp in milliseconds
    // we use it to determine how much time has passed since the last call

    if (lastTime) {
        update((ms-lastTime)/1000); // call update and pass delta time in seconds
    }

    lastTime = ms;
    animFrame = requestAnimationFrame(anim_callback);
}

// Starts on click
draw.on("click", function() {
    if (!_started){
        anim_callback();
        _started = true;
    }
})

});
