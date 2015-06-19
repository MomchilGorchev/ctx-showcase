document.addEventListener('DOMContentLoaded', function(){


    'use strict';
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    var canvas = document.getElementById('scene');
    var ctx = canvas.getContext('2d');
    var dots = [];
    var colors = ['131, 18, 178', '255, 181, 25', '180, 0, 255', '20, 204, 120', '7, 178, 100'];

    canvas.width = '1000';
    canvas.height = '500';


    function createDots(amount){
        for(var i = 0; i < amount; i++){

            var x = Math.random() * canvas.width,
                y = Math.random() * canvas.height,
                radius = Math.random() * 10,
                color = colors[Math.floor(i%colors.length)],
                alpha = randomNumber(0.3, 1);
            var dot = new Dot(x, y, radius, color, alpha);

            dots.push(dot);
        }

    }

    createDots(1000);

    function Dot(x, y, radius, color, alpha){

        var _this = this;
        _this.x = x || canvas.width / 2;
        _this.y = y || canvas.height / 2;
        _this.radius = radius || 2;
        _this.color = color || 'green';
        _this.alpha = alpha || Math.random();

        this.draw = function(ctx){
            ctx.beginPath();
            ctx.arc(_this.x, _this.y, _this.radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = 'rgba('+_this.color+', '+_this.alpha+')';
            ctx.fill();
        };

        //console.log(this);
    }

    function loop(){

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for(var j = 0; j < dots.length; j++){
            dots[j].draw(ctx);
        }

        window.requestAnimationFrame(loop);
    }

    loop();

    function randomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    function moveAround(dot){

        var pos = {
            x: dot.x,
            y: dot.y
        };
        var newPos = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        };

        var timing = dot.radius < 5 ? 10 : 30;

        TweenMax.to(dot, timing, {
            x: newPos.x,
            y: newPos.y,
            ease: SlowMo.ease.config(0.3, 0.4, false),
            onComplete: function() {
                TweenMax.to(dot, timing, {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    ease: SlowMo.ease.config(0.3, 0.4, false),
                    onComplete: function() {
                        moveAround(dot);
                    }
                });
            }
        });
    }

    for(var k = 0; k < dots.length; k++){
        moveAround(dots[k]);
    }

});