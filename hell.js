jam.includeModule("RectCollision");
jam.includeModule("Animation");
jam.includeModule("Debug");

var game;

var node = function(x, y, width, height, parent){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.parent = parent;
  this._collisionOffsetX = 0;
  this._collisionOffsetY = 0;
  this._collisionOffsetWidth = 0;
  this._collisionOffsetHeight = 0;
  this.nodes = [];
  this.children = [];
  game.add(this);
};

node.prototype.split = function(){
  var w = Math.floor(this.width / 2);
  var h = Math.floor(this.height / 2);

  // Alg quads.
  this.nodes.push(new node(this.x + w, this.y, w, h));
  this.nodes.push(new node(this.x, this.y, w, h));
  this.nodes.push(new node(this.x, this.y + h, w, h));
  this.nodes.push(new node(this.x + w, this.y + h, w, h));
};

node.prototype.contains = function(){
};

node.prototype.update = function(){
};

node.prototype.render = function(ctx, cam){
  if(!jam.Debug.showBoundingBoxes) { return; }

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,0,0,0.6)";
  ctx.strokeRect(	Math.floor(this.x - cam.scroll.x)+0.5,
						Math.floor(this.y - cam.scroll.y)+0.5,
						this.width, this.height);
  ctx.strokeStyle = "rgba(0,255,255,0.5)";
  ctx.strokeRect(this.x, this.y, this.width, this.height);
};

node.prototype.MAX_ALLOWED = 1;

var quadTree = function(width, height){
  var n = new node(0, 0, width - 1, height - 1);
  return n;
};

node.prototype.build = function(){
  if (this.children.length > this.MAX_ALLOWED){
    this.split();
    var w = Math.floor(this.width / 2);
    var h = Math.floor(this.height / 2);
    for (i in this.children){
      var c = this.children[i];
      if ((c.x >= this.x + w) && (c.y <= this.y + h)){
        // First quad.
        this.nodes[0].children.push(c);
      } else if ((c.x <= this.x + w) && (c.y <= this.y + h)){
        // Second quad.
        this.nodes[1].children.push(c);
      } else if ((c.x <= this.x + w) && (c.y >= this.y + h)){
        // Third quad.
        this.nodes[2].children.push(c);
      } else if ((c.x >= this.x + w) && (c.y >= this.y + h)){
        // Fourth quad.
        this.nodes[3].children.push(c);
      } else {
        console.log('Panic.');
      }
    }
    this.children = [];
    for (n in this.nodes){
      this.nodes[n].build();
    }
  }
};

node.prototype.calc = function(s){
  // Returns an array of nodes to collide s against, in case s called on a
  // boundry and overlaps multiple nodes.
  if (!s.overlaps(this)){
    return [];
  }

  if (this.nodes.length > 0){
    var ret = [];
    for (n in this.nodes){
      var t = this.nodes[n].calc(s);
      ret = ret.concat(t);
    }
    return ret;
  } else {
    return [this];
  }
};

var initialize = function(){
  game = window.game = jam.Game(640, 480, document.body);

  var p = new jam.Sprite(0, 0);
  p.setImage("data/ship.png");
  game.add(p);

  var qt = quadTree(640, 480);
  game.add(qt);

  var shots = [];
  var makeShot = function(x, y){
    var s = new jam.Sprite(x, y);
    s.setImage("data/shot.png");
    shots.push(s);
    game.add(s);
    return s
  };

  makeShot(100, 100);
  makeShot(100, 90);
  makeShot(100, 80);
  makeShot(20, 20);

  qt.children = shots;
  qt.build();
  var pcolls = qt.calc(p);

  console.log(pcolls);

  jam.Debug.showBoundingBoxes = true;
  if (jam.Debug.showBoundingBoxes === true){
    //Debug shit
  }

  game.run();
};

window.onload = function(){
  jam.preload("data/ship.png");
  jam.preload("data/shot.png");
  jam.showPreloader(document.body, initialize);
};
