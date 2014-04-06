// Client.js

var myBoxId;
var $followBoxes;
var curTop;
var curLeft;
var lerpTop;
var lerpLeft;
var LERP_STRENGTH = 0.1;
var boxesData = {};
var boxesHandle;

// update method called every frame by requestAnimationFrame
var update = function() {

  $followBoxes && $followBoxes.each(function(index, box){
    var $box = $(box);
    var boxId = $box.attr('id');
    curTop = $box.offset().top;
    curLeft = $box.offset().left;
    lerpTop = lerp(curTop, boxesData[boxId].top, LERP_STRENGTH);
    lerpLeft = lerp(curLeft, boxesData[boxId].left, LERP_STRENGTH);
    $box.offset({ top: lerpTop, left: lerpLeft });
  });

  requestAnimationFrame(update);
};
requestAnimationFrame(update);

// Helper function for linear interpolation
function lerp(currentVal, targetVal, strength) {
  return currentVal + (targetVal - currentVal) * strength;
}

Template.mouseTrack.boxes = function() {
  return Boxes.find();
};

Template.mouseTrack.events({
  'mousemove': function(evt) {
    Boxes.update(myBoxId, { $set: {top: evt.clientY-10, left: evt.clientX-10} });
  }
});

Template.mouseFollower.owner = function() {
  return Meteor.userId();
}

Template.mouseFollower.rendered = function() {
  console.log('rendered!');

  this.$('div')
    .attr('id', this.data._id)
    .addClass('follower-box');

  if (this.data._id === myBoxId) {
    this.$('div').addClass('my-follower');
  } else {
    this.$('div').addClass('other-follower');
  }

  // Cache refs to all the boxes each new box is rendered to DOM.
  $followBoxes = $('.follower-box');
};

Deps.autorun(function(c) {
  console.log('Meteor.userId() is', Meteor.userId());

  if (Meteor.user() && boxesHandle && boxesHandle.ready()) {
    var myBox = Boxes.findOne({owner: Meteor.userId()});

    if (myBox) {
      myBoxId = myBox._id
    } else {
      myBoxId =  Boxes.insert({owner: Meteor.userId(), top: 0, left: 0});
    }

    console.log ('myBoxId is...', myBoxId);
    c.stop();
  }
});

Deps.autorun(function() {
  console.log('observing...');

  Boxes.find().observe({changed: onBoxesChanged, added: onBoxesAdded});
});

function onBoxesChanged(newDoc) {
  boxesData[newDoc._id] = newDoc;
}

function onBoxesAdded(newDoc) {
  boxesData[newDoc._id] = newDoc;
}

Meteor.startup(function() {
  boxesHandle = Meteor.subscribe('boxes');
});