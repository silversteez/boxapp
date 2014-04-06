// Server.js

Meteor.startup(function () {

  Meteor.publish('boxes', function() {
    return Boxes.find();
  });

});