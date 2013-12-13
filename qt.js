define(["./node"], function(node){
  var qt = function(width, height){
    node.call(this, 0, 0, width - 1, height - 1);
  };

  qt.prototype = new node(0, 0);

  return qt;
});