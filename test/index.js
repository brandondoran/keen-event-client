var http = require('http');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var bl = require('bl');
var KeenClient = require('../lib/index');

function testServer (data, statusCode) {
  var ee = new EventEmitter();
  var server = http.createServer(handler);

  function handler (req, res) {
    req.pipe(bl(function (err, data) {
      if (err) {
        return ee.emit('error', err);
      }

      ee.emit('request', req, data.toString());
      setTimeout(server.close.bind(server), 5);
    }))

    res.writeHead(statusCode, { 'content-type': 'application/json' });
    res.end(data || '');
  }

  server.listen(function () {
    ee.emit('ready', 'http://localhost:' + server.address().port);
  })

  server.on('close', ee.emit.bind(ee, 'close'))

  return ee;
}

describe('KeenClient', function() {
  var keen, event, events, options;

  beforeEach(function() {
    options = {
      urlBase: 'http://localhost:8000',
      version: '3.0',
      projectId: 'p',
      writeKey: 'wk',
      readKey: 'rk',
      masterKey: 'mk'
    },
    event = {
      "rh": 63.4541931152,
      "temp": 75.0841601562
    },
    events = {
      climate: [{
        "rh": 57.43534,
        "temp": 73.32322,
      }, {
        "rh": 58.826482,
        "temp": 74.284927,
      }]
    };
  });
  
  describe('#addEvent', function(done) {
    it('should insert one event', function(done) {
      var expected = { created: true };
      testServer(JSON.stringify(expected), 201).on('ready', function(url) {
        options.urlBase = url;
        keen = new KeenClient(options);
        keen.addEvent('climate', event, function(err, data, res) {
          if (err) {
            return done(err);
          }
          assert.equal(res.statusCode, 201);
          assert.deepEqual(data, expected);
        });
      })
      .on('request', function (req, data) {
        assert.equal(req.method, 'POST');
        assert.equal(req.headers['authorization'], options.writeKey);
        assert.equal(req.headers['content-type'], 'application/json');
        assert.deepEqual(JSON.parse(data), event);
      })
      .on('close', done);
    });

    it('should return an error if collection is null', function(done) {
      keen = new KeenClient(options);
      keen.addEvent(null, event, function(err, data, res) {
        assert(err);
        done();
      });
    });
  });

  describe('#addEvents', function(done) {
    it('should insert multiple events', function(done) {
      var expected = { climate: [ { success: true }, { success: true } ] };
      testServer(JSON.stringify(expected), 200).on('ready', function(url) {
        options.urlBase = url;
        keen = new KeenClient(options);
        keen.addEvents(events, function(err, data, res) {
          if (err) {
            return done(err);
          }
          assert.equal(res.statusCode, 200);
          assert.deepEqual(data, expected);
        });
      })
      .on('request', function (req, data) {
        assert.equal(req.method, 'POST');
        assert.equal(req.headers['authorization'], options.writeKey);
        assert.equal(req.headers['content-type'], 'application/json');
        assert.deepEqual(JSON.parse(data), events);
      })
      .on('close', done);
    });
  });

  describe('#getEvent', function(done) {
    it('should get schema info for this event collection', function(done) {
      var expected = {
        properties: { temp: 'num', rh: 'num' } 
      };
      testServer(JSON.stringify(expected), 200).on('ready', function(url) {
        options.urlBase = url;
        keen = new KeenClient(options);
        keen.getEvent('climate', function(err, data, res) {
          if (err) {
            return done(err);
          }
          assert.equal(res.statusCode, 200);
          assert.deepEqual(data, expected);
        });
      })
      .on('request', function (req, data) {
        assert.equal(req.method, 'GET');
        assert.equal(req.headers['authorization'], options.masterKey);
        assert.equal(req.headers['content-type'], 'application/json');
      })
      .on('close', done);
    });

    it('should return an error if collection is null', function(done) {
      keen = new KeenClient(options);
      keen.addEvent(null, event, function(err, data, res) {
        assert(err);
        done();
      });
    });
  });

  describe('#getEvents', function(done) {
    it('should return schema info for multiple event collections', function(done) {
      var expected = [{
        url: '/3.0/projects/553089932fd4b135d5164719/events/climate',
        name: 'climate',
        properties: {temp: 'num', rh: 'num'} 
      }];
      testServer(JSON.stringify(expected), 200).on('ready', function(url) {
        options.urlBase = url;
        keen = new KeenClient(options);
        keen.getEvents(options.projectId, function(err, data, res) {
          if (err) {
            return done(err);
          }
          assert.equal(res.statusCode, 200);
          assert.deepEqual(data, expected);
        });
      })
      .on('request', function (req, data) {
        assert.equal(req.method, 'GET');
        assert.equal(req.headers['authorization'], options.masterKey);
        assert.equal(req.headers['content-type'], 'application/json');
      })
      .on('close', done);
    });
  });

  describe('#deleteCollection', function(done) {
    it('should delete entire event collection', function(done) {
      testServer(null, 204).on('ready', function(url) {
        options.urlBase = url;
        keen = new KeenClient(options);
        keen.deleteCollection('climate', function(err, data, res) {
          if (err) {
            return done(err);
          }
          assert.equal(res.statusCode, 204);
          assert.deepEqual(data, null);
        });
      })
      .on('request', function (req, data) {
        assert.equal(req.method, 'DELETE');
        assert.equal(req.headers['authorization'], options.masterKey);
        assert.equal(req.headers['content-type'], 'application/json');
      })
      .on('close', done);
    });
  });

});

// var keen = new KeenClient(options);

// keen.addEvent('climate', event, function(err, data, res) {
//   var data = '{ created: true }'; //201
//   if (err) {
//     return console.error('addEvent error:', err);
//   }
//   console.log('addEvent data:', data);
//   console.log('addEvent res:', res.statusCode);
// });

// keen.addEvents(events, function(err, data, res) {
//   var data = '{ climate: [ { success: true }, { success: true } ] }'; //200
//   if (err) {
//     return console.error('addEvents error:', err);
//   }
//   console.log('addEvents data:', data);
//   console.log('addEvents res:', res.statusCode);
// });

// keen.getEvent('climate', function(err, data, res) {
//   var data = { properties:
//    { 'keen.created_at': 'datetime',
//      temp: 'num',
//      timestamp: 'string',
//      'keen.id': 'string',
//      'keen.timestamp': 'datetime',
//      rh: 'num',
//      deviceId: 'string' } }; //200
//   if (err) {
//     return console.error('getEvent error:', err);
//   }
//   console.log('getEvent data:', data);
//   console.log('getEvent res:', res.statusCode);
// });

// keen.getEvents(options.projectId, function(err, data, res) {
//   var data = [ { url: '/3.0/projects/553089932fd4b135d5164719/events/climate',
//     name: 'climate',
//     properties:
//      { 'keen.created_at': 'datetime',
//        temp: 'num',
//        timestamp: 'string',
//        'keen.id': 'string',
//        'keen.timestamp': 'datetime',
//        rh: 'num',
//        deviceId: 'string' } } ]; //200
//   if (err) {
//     return console.error('getEvents error:', err);
//   }
//   console.log('getEvents data:', data);
//   console.log('getEvents res:', res.statusCode);
// });

// keen.deleteCollection('climate', function(err, data, res) {
//   var data = null; //204
//   if (err) {
//     return console.error('deleteCollection error:', err);
//   }
//   console.log('deleteCollection data:', data);
//   console.log('deleteCollection res:', res.statusCode);
// });