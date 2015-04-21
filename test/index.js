var http = require('http');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var bl = require('bl');
var keen = require('../lib/index');

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
  var client, event, events, options;

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
        client = keen.createClient(options);
        client.addEvent('climate', event, function(err, data, res) {
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
      client = keen.createClient(options);
      client.addEvent(null, event, function(err, data, res) {
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
        client = keen.createClient(options);
        client.addEvents(events, function(err, data, res) {
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
        client = keen.createClient(options);
        client.getEvent('climate', function(err, data, res) {
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
      client = keen.createClient(options);
      client.addEvent(null, event, function(err, data, res) {
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
        client = keen.createClient(options);
        client.getEvents(function(err, data, res) {
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

});
