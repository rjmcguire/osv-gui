var OSv = OSv || {};
OSv.API = OSv.API || {};

OSv.API.ThreadsGraphAPI = (function() {

  function ThreadsGraphAPI() {
    this.path = "/os/threads";
    this.data = [];
    this.startPulling();
  };
  
  ThreadsGraphAPI.prototype = Object.create(OSv.API.GraphAPI.prototype);

  ThreadsGraphAPI.prototype.prevTime = {};

  ThreadsGraphAPI.prototype.timems = 0;

  ThreadsGraphAPI.prototype.idles = {};

  ThreadsGraphAPI.prototype.threads = {};

  ThreadsGraphAPI.prototype.names = {};

  ThreadsGraphAPI.prototype.formatResponse = function (threads) { 

    var timestamp = Date.now(),
      self = this,
      parsedThreads,
      newTimems = threads.time_ms,
      diff = {},
      idles = {};

    threads.list.forEach(function (thread) {
      
      self.names[ thread.id ] = thread.name; 

      if (self.timems) {
        diff[ thread.id ] = thread.cpu_ms - self.prevTime[ thread.id ];
      }
      
      self.prevTime[ thread.id ] = thread.cpu_ms;  

      if ( thread.name.indexOf("idle") != -1 && self.timems) {
        idles[ thread.id ] = {
          diff: diff[ thread.id ],
          id: thread.id,
          name: thread.name
        };
      }

    });

    $.map(idles, function (idle) {
      
      self.idles[ idle.id ] = self.idles[ idle.id ] || idle;

      var percent =(100 - (100 * idle.diff) / (newTimems - self.timems));

      self.idles[ idle.id ].plot = self.idles[ idle.id ].plot || [];

      self.idles[ idle.id ].plot.push([ timestamp,  percent]);

    })

    $.map(diff, function (val, key) {
      return [[key, val]]
    }).sort(function (t1, t2) {
      return t1[1] > t2[1] ? -1 : 1;
    }).forEach(function (diff) {
      var id = diff[0]|0;
      
      var percent = (100 * diff[1]) / (newTimems - self.timems);
      if (!self.threads[ id ]) {
        self.threads[ id ] = {id : id, name: self.names[ id ], plot: [] }
      }

      self.threads[ id ].plot.push([
        timestamp,
        percent
      ])

    });

    self.timems = newTimems;

  };

  ThreadsGraphAPI.prototype.getThreads = function() {
    return this.threads;
  };

  ThreadsGraphAPI.prototype.getIdles = function() {
    return this.idles;
  };

  ThreadsGraphAPI.prototype.getData = function () {
    return $.Deferred().resolve(this.getThreads());
  };

  ThreadsGraphAPI.prototype.getIdle = function () {
    
  };

  return ThreadsGraphAPI;

}());
