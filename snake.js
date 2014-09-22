// A template for an action game

;(function() {
  var Game = function() {
    var screen = document.getElementById("screen").getContext('2d');

    this.size = { x: screen.canvas.width, y: screen.canvas.height };
    this.center = { x: this.size.x / 2, y: this.size.y / 2 };
    this.block_size = 10;
    this.speed = 100;
    var self = this;

    this.bodies = [new Head(this)].concat(new Food(this, {x: Math.floor(this.size.x*Math.random()), y: Math.floor(this.size.y*Math.random())}));

    var tick = function() {
      self.update();
      self.draw(screen);
      requestAnimationFrame(tick);
    };

    tick();
  };

  Game.prototype = {
    update: function() {
      for (var i = 0; i < this.bodies.length; i++) {
          if (this.bodies[i].update !== undefined) {
           
            this.bodies[i].update();
          };
      }

      reportCollisions(this.bodies);
    },

    draw: function(screen) {
      screen.clearRect(0, 0, this.size.x, this.size.y);
      screen.strokeRect(0, 0, this.size.x, this.size.y);
      for (var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i].draw !== undefined) {
          this.bodies[i].draw(screen);
        }
      }
    },

    addBody: function(body) {
      this.bodies.push(body);
    },

    removeBody: function(body) {
      var bodyIndex = this.bodies.indexOf(body);
      if (bodyIndex !== -1) {
        this.bodies.splice(bodyIndex, 1);
      }
    }
  };

  var Head = function(game) {
    this.game = game;
    this.size = { x: this.game.block_size, y: this.game.block_size }; 
    this.center = { x: game.size.x / 2, y: game.size.y / 2}; 
    this.keyboarder = new Keyboarder();
    this.velocity= { x: 0, y: 1};
    this.blocks = [];
    this.addblock = false;
    this.prevcenter={x:0,y:0};
    this.lastMove = 0;
  };

  Head.prototype = {
    update: function() {
      var screenRect = {
        center: { x: this.game.size.x / 2, y: this.game.size.y / 2 },
        size: this.game.size
      };

      if (!isColliding(this, screenRect)) {
        for (var i = 1; i < this.blocks.length; i++) {
          this.game.removeBody(this.blocks[i]);
        }
        this.game.removeBody(this);
      }
      
      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        if (this.velocity.x !== 1) {
          this.velocity.x = -1;
          this.velocity.y = 0;
        }
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        if (this.velocity.x !== -1) {
          this.velocity.x = 1;
          this.velocity.y = 0;
        }
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        if (this.velocity.y !== 1) {
          this.velocity.x = 0;
          this.velocity.y = -1;
        }
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)) {
        if (this.velocity.y !== -1) {
          this.velocity.x = 0;
          this.velocity.y = 1;
        }
      }
      var now = new Date().getTime();
      if (now > this.lastMove + this.game.speed) {
        this.lastMove = now;

        if (this.addblock === true) {
          this.addBodyBlock();
          this.game.speed = this.game.speed * 0.95;
          this.addblock = false;
        }

        this.prevcenter.x = this.center.x;
        this.prevcenter.y = this.center.y;
        this.center.x += this.velocity.x*this.game.block_size;
        this.center.y += this.velocity.y*this.game.block_size;

        if (this.blocks.length >= 1) {
          this.blocks[0].prevcenter.x = this.blocks[0].center.x;
          this.blocks[0].prevcenter.y = this.blocks[0].center.y;
          this.blocks[0].center.x = this.prevcenter.x;
          this.blocks[0].center.y = this.prevcenter.y;

          
          for (var i = 1; i < this.blocks.length; i++) {
            this.blocks[i].prevcenter.x=this.blocks[i].center.x;
            this.blocks[i].prevcenter.y=this.blocks[i].center.y;
            this.blocks[i].center.x=this.blocks[i-1].prevcenter.x;
            this.blocks[i].center.y=this.blocks[i-1].prevcenter.y;
          }
        }
      }
    },

    addBodyBlock: function() {
      if (this.blocks.length > 0) {
        var center = this.blocks[this.blocks.length - 1].prevcenter;
      } else {
        var center = this.prevcenter;
      }
      block = new BodyBlock(this.game,this,center);
      this.blocks.push(block);
      this.game.addBody(block);
    },

    draw: function(screen) {
      drawRect(screen,this, "black");
    },

    collision: function(otherBody) {
      if (otherBody instanceof Food) {
        this.addblock = true;
        makeFood(this.game);
      } else if (otherBody instanceof BodyBlock) {
          for (var i = 0; i < this.blocks.length; i++) {
            this.game.removeBody(this.blocks[i])
          }
          this.game.removeBody(this);
      }
    }
  };

  var Keyboarder = function() {
    var keyState = {};

    window.addEventListener('keydown', function(e) {
      keyState[e.keyCode] = true;
    });

    window.addEventListener('keyup', function(e) {
      keyState[e.keyCode] = false;
    });

    this.isDown = function(keyCode) {
      return keyState[keyCode] === true;
    };

    this.KEYS = { LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40};
  };

  var BodyBlock = function(game, head, center) {
    this.game = game;
    this.head = head;
    this.center = {x: center.x, y: center.y}; 
    this.prevcenter = {x:0,y:0}
    this.size = { x: this.game.block_size, y: this.game.block_size };
    //this.color = RED
  };

  BodyBlock.prototype = {
    draw: function(screen) {
      drawRect(screen,this, "black");
    }
  };

  var Food = function(game, center) {
    this.game = game;
    this.center = center;
    this.size = { x: this.game.block_size, y: this.game.block_size };
    //this.color = RED
  };

  Food.prototype = {
    draw: function(screen) {
      drawRect(screen, this, "red");
    },

    update: function() {

      var screenRect = {
        center: { x: this.game.size.x / 2, y: this.game.size.y / 2 },
        size: this.game.size
      };
    },

    collision: function(otherBody) {
      this.game.removeBody(this);
    }
  };

  var drawRect = function(screen, body, color) {
    screen.fillStyle = color;
    screen.fillRect(body.center.x - body.size.x / 2, body.center.y - body.size.y / 2,
                    body.size.x, body.size.y);
  };

  var isColliding = function(b1, b2) {
    return !(
      b1 === b2 ||
        b1.center.x + b1.size.x / 2 <= b2.center.x - b2.size.x / 2 ||
        b1.center.y + b1.size.y / 2 <= b2.center.y - b2.size.y / 2 ||
        b1.center.x - b1.size.x / 2 >= b2.center.x + b2.size.x / 2 ||
        b1.center.y - b1.size.y / 2 >= b2.center.y + b2.size.y / 2
    );
  };

  var makeFood = function(game) {
    food = new Food(game, {x: Math.floor(game.size.x*Math.random()), y: Math.floor(game.size.y*Math.random())});
    game.addBody(food);
  };

  var reportCollisions = function(bodies) {
    var bodyPairs = [];
    for (var i = 0; i < bodies.length; i++) {
      for (var j = i + 1; j < bodies.length; j++) {
        if (isColliding(bodies[i], bodies[j])) {
          bodyPairs.push([bodies[i], bodies[j]]);
        }
      }
    }

    for (var i = 0; i < bodyPairs.length; i++) {
      if (bodyPairs[i][0].collision !== undefined) {
        bodyPairs[i][0].collision(bodyPairs[i][1]);
      }

      if (bodyPairs[i][1].collision !== undefined) {
        bodyPairs[i][1].collision(bodyPairs[i][0]);
      }
    }
  };

  window.addEventListener('load', function() {
    new Game();
  });
})();
