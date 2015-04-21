# keen-event-client

A lightweight wrapper for dealing with the [Keen.io](https://keen.io/) [event API](https://keen.io/docs/api/reference/).

Although Keen.io has an extensive [JS SDK](https://github.com/keen/keen-js), I experienced problems using it on the [Tessel](https://tessel.io/) 1 board.

Install with:

    npm install keen-event-client

## Usage

```js
var keen = require('keen-event-client');

var client = keen.createClient({
  projectId: 'YOUR_PROJECT_ID',
  writeKey:  'YOUR_WRITE_KEY',
  masterKey: 'YOUR_MASTER_KEY'
});
var event = {
  temp: 74.89,
  rh: 52.17
};

keen.addEvent('climate', data, function(err, data, res) {
  if (err) {
    // there was an error!
  } else {
    // success: return value, if any, is in the data argument.
  }
});
```


## API

All callbacks are called with arguments `err, data, res`.

* `err` is the error object, if any, otherwise null.
* `data` is the object deserialized from JSON that was returned by the keen.io API. This may be null if the request did not return data.
* `res` is the response object itself.

### keen.createClient(options)

Returns an object initialized with the supplied `options` object. All operations performed by the instance of the client are against the keen.io project specified by `options.projectId` and will use the keys specified by `options.writeKey` or `options.readKey`.

Required:
* `projectId` keen.io project ID
* `writeKey`  keen.io write key
* `masterKey` keen.io master key

Optional:
* `urlBase` defaults to `https://api.keen.io`
* `version` defaults to `3.0`

### keen.addEvent(collection, event, callback)

Inserts a single `event` into the specified `collection`.

Example `event`:
```js
{
  temp: 72.34,
  rh: 58.83
}
```

### keen.addEvents(events, callback)

Inserts multiple `events` into one or more collections. `events` should be an object with properties, which are the names of collections.  The values of these properties should be arrays of objects, which are the events.

`events` example:
```js
{
  climate: [{
    temp: 72.34,
    rh: 58.83
  }, {
    temp: 71.59,
    rh: 57.96
  }],
  ambient: [{
    soundLevel: 0.43,
    lightLevel: 0.39
  }]
}
```

### keen.getEvent(collection, callback)

Returns the schema information for the `collection`.

`data` example:
```js
{
  properties: {
    temp: 'num',
    rh: 'num'
  }
}
```

### keen.getEvents(callback)

Returns the schema information for all collections in the project specified by `options.projectId`.

`data` example:
```js
[
  {
    name: 'climate',
    url: '/3.0/projects/YOUR_PROJECT_ID/events/climate',
    properties: {
      'client.id': 'string',
      'client.created_at': 'datetime',
      temp: 'num',
      rh: 'num'
    }
  }, {
    name: 'ambient',
    url: '/3.0/projects/YOUR_PROJECT_ID/events/ambient',
    properties: {
      'client.id': 'string',
      'client.created_at': 'datetime',
      soundLevel: 'num',
      lightLevel: 'num'
    } 
  }
]
```

## License
[MIT](https://github.com/brandondoran/keen-event-client/blob/master/LICENSE)
