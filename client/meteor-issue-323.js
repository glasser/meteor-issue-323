Template.results.preserve(['p']);

Template.results.query = function () {
  return Session.get("query");
};

Template.results.events({
  'click #foo': function () {
    Session.set("query", "foo");
  }
});
