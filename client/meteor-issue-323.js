Videos = new Meteor.Collection(null);

var setQueryInCollection = function (query) {
  var record = Videos.findOne();
  if (record)
    Videos.update(record._id, {$set: {title: query}});
  else
    Videos.insert({title: query});
};


// Removing this avoids the error (as does removing the {{#constant}}).
Template.player.preserve(['p']);

Template.results.videos_up = function () {
  // The .fetch is essential for the error here. Just returning the cursor
  // avoids error.
  return Videos.find({}).fetch();
};

Template.results.events({
  'click #foo': function () {
    setQueryInCollection("foo");
  },
  'click #bar': function () {
    setQueryInCollection("bar");
  }
});
