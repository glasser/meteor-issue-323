// "If you do zapzapzap then you are Zapping!"

Videos = new Meteor.Collection(null);

Meteor.autosubscribe(function () {
  var query = Session.get("query");
  var page = Session.get("page");
  var now_flag = Date.now();
  if (query) {
    page = page || 0;
    index = (page * 6) + 1;
    Meteor.http.get("https://gdata.youtube.com/feeds/api/videos?q=" + query + "&start-index=" + index + "&max-results=6&v=2&alt=json&fields=entry(media:*,yt:*,published,title)",
                    null,
                    function (error, result) {
                      if (result.statusCode === 200) {
                        var should_update = !!Videos.find({}).count();
                        _.each(result.data.feed.entry, function(entry){
                          var yt_video = {vid: entry.media$group.yt$videoid.$t,
                                          title: entry.title.$t,
                                          views: entry.yt$statistics && entry.yt$statistics.viewCount || 0,
                                          likes: entry.yt$rating && entry.yt$rating.numLikes || 0,
                                          dislikes: entry.yt$rating && entry.yt$rating.numDislikes || 0,
                                          published: moment(entry.published.$t),
                                          created_at: now_flag};
                          if(should_update)
                            Videos.update({ "created_at" : {$lt: now_flag} }, yt_video);
                          else
                            Videos.insert(yt_video);
                        });
                      }
                    });
  }
});

Template.player.preserve(['span', 'p']);

Template.results.videos_up = function () {
  // return Videos.find({});
  // var videos = Videos.find({}).fetch();
  // console.log("reactive: " + videos);
  // var cursor = Videos.find({});
  return Videos.find({}).fetch();
};

// Template.results.videos_down = function () {
//   var videos = Videos.find({}).fetch();
//   return videos.slice(3,6);
// };

// Template.player.rendered = function () {
//   var self = this;
//   var player_data = self.find('span[data-vid][data-id]');
//   console.log("vid: " + $(player_data).data('vid'));
//   // if( !self.find('iframe') ) {
//   //   var opts = {width: 356,
//   //               height: 200,
//   //               playerVars: { 'autoplay': 1,
//   //                             'enablejsapi': 1,
//   //                             'loop': 1,
//   //                             'iv_load_policy': 3,
//   //                             'showinfo': 0,
//   //                             'controls': 0
//   //                           },
//   //               videoId: $(player_data).data('vid')
//   //             };
//   //   new YT.Player($(player_data).data('id'), opts);
//   //   // _.extend(self, {player: new YT.Player($(player_data).data('id'), opts)});
//   // }
//   // else {
//   //   console.log("vid: " + $(player_data).data('vid'));
//   //   // self.player.stopVideo();
//   //   // console.log("vid: " + $(player_data).data('vid'));
//   //   // self.player.loadVideoById($(player_data).data('vid'), 0, 'small');
//   // }
// };

var ZapRouter = Backbone.Router.extend({
  routes: {
    ":query": "search"
  },
  search: function (query) {
    if (query)
      Session.set("query", decodeURIComponent(query));
    // console.log(Session.get("query"))
  },
  setQuery: function (query) {
    this.navigate(encodeURIComponent(query), true);
  }
});

Router = new ZapRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});

  // Load Youtube script
  if ($("#youtube-api").length < 1) {
    var yttag = document.createElement('script');
    yttag.id = 'youtube-api';
    yttag.src = "//www.youtube.com/player_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(yttag, firstScriptTag);
  }

});