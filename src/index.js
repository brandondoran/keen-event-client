var jsonist = require('jsonist');

function KeenClient (options) {
  this._urlBase = options.urlBase || 'https://api.keen.io';
  this._version = options.version || '3.0';
  this._writeKey = options.writeKey;
  this._masterKey = options.masterKey;
  this._projectId = options.projectId;
  this._url = `${this._urlBase}/${this._version}/projects/${this._projectId}/events`;
}

function reqOptions(apiKey) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey
    }
  };
}

KeenClient.prototype._getUrl = function (path) {
  return path ? `${this._url}/${path}` : this._url;
};

KeenClient.prototype.addEvent = function (collection, event, cb) {
  if (!collection) {
    return cb(new Error('you must specify a collection'));
  }
  
  jsonist.post(this._getUrl(collection), event, reqOptions(this._writeKey), cb);
};

KeenClient.prototype.addEvents = function (events, cb) {
  jsonist.post(this._url, events, reqOptions(this._writeKey), cb);
};

KeenClient.prototype.getEvent = function (collection, cb) {
  if (!collection) {
    return cb(new Error('you must specify a collection'));
  }
  
  jsonist.get(this._getUrl(collection), reqOptions(this._masterKey), cb);
};

KeenClient.prototype.getEvents = function (cb) {
  jsonist.get(this._url, reqOptions(this._masterKey), cb);
};

KeenClient.prototype.deleteCollection = function (collection, cb) {
  jsonist.delete(this._getUrl(collection), reqOptions(this._masterKey), cb);
};

module.exports.createClient = function(options = {}) {
  return new KeenClient(options);
};
