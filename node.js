define(["jam"], function(jam){

  var node = function(x, y, width, hight, parent){
    jam.Sprite.call(this, x, y);
    /** /
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.parent = parent;
    this._collisionOffsetX = 0;
    this._collisionOffsetY = 0;
    this._collisionOffsetWidth = 0;
    this._collisionOffsetHeight = 0;
    /**/
    this.nodes = [];
    this.children = [];
    //this.parentSprite = parent;
  };

  node.prototype = new jam.Sprite(0, 0);

  node.prototype.split = function(){
    var w = Math.floor(this.width / 2);
    var h = Math.floor(this.height / 2);

    // Alg quads.
    var n1 = new node(this.x + w, this.y, w, h);
    var n2 = new node(this.x, this.y, w, h);
    var n3 = new node(this.x, this.y + h, w, h);
    var n4 = new node(this.x + w, this.y + h, w, h);

    this.add(n1);
    this.add(n2);
    this.add(n3);
    this.add(n4);

    this.nodes.push(n1);
    this.nodes.push(n2);
    this.nodes.push(n3);
    this.nodes.push(n4);
  };

  node.prototype.render = function(ctx, cam){
    var cam = {};
    cam.scroll = {x:0,y:0};
    if(!jam.Debug.showBoundingBoxes) { return; }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,0,0,0.6)";
    ctx.strokeRect(	Math.floor(this.x - cam.scroll.x)+0.5,
                    Math.floor(this.y - cam.scroll.y)+0.5,
                    this.width, this.height);
    ctx.strokeStyle = "rgba(0,255,255,0.5)";
    ctx.strokeRect(this.x, this.y, this.width, this.height);

	for (var i = 0; i < this.subSprites.length; ++i){
	  this.subSprites[i].render(ctx);
	}
  };

  node.prototype.flush = function(){
    if (this.children.length > 0){
      this.children.length = [];
    }
    if (this.nodes.length > 0){
      for (n in this.nodes){
        this.nodes[n].flush();
      }
    }
  };

  node.prototype.MAX_ALLOWED = 2;

  node.prototype.calc = function(s){
    // Returns an array of nodes to collide s against, in case s called on a
    // boundry and overlaps multiple nodes.
    if (!jam.Rect.overlap([this], [s])){
      return [];
    }

    var ret = [];
    if (this.children.length > 0){
      ret = ret.concat(this.children);
    }

    if (this.nodes.length > 0){
      for (n in this.nodes){
        var t = this.nodes[n].calc(s);
        ret = ret.concat(t);
      }
    }
    return ret;
  };

  node.prototype.build = function(){
    if (this.children.length > this.MAX_ALLOWED){
      if (this.nodes.length === 0){
        this.split();
      }
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
    /**/
  return node;

});