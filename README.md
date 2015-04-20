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
    name: 'test event',
    items: 1
};

keen.addEvent('myCollection', data, function(err, data, res) {
  if (err) {
    // there was an error!
  } else {
    // success: return value, if any, is in the data argument.
  }
});

```


## API

All callbacks are called with the following arguments `err, data, res`.

* `err` is the error object, if any, otherwise null.
* `data` is the object deserialized from JSON that was returned by the keen.io API. This may be null if the request did not return data.
* `res` is the response object itself.

### keen.createClient(options)

Returns an object initialized with `options` object.

Required:
* `projectId` keen.io project ID
* `writeKey`  keen.io write key
* `masterKey` keen.io master key

Optional:
* `urlBase` defaults to `https://api.keen.io`
* `version` defaults to `3.0`

### keen.addEvent(collection, event, callback)

Inserts a single `event` into the specified `collection`.

[event example](https://keen.io/docs/api/reference/#post-request-body)


### keen.addEvents(events, callback)

Inserts multiple `events` into one or more collections. `events` should be an object with properties, which are the names collections.  The values of these properties should be arrays of events.

[events example](https://keen.io/docs/api/reference/#post-request-body-example-of-batch-event-posting)


### keen.getEvent(collection, callback)

Returns the schema information for the `collection`.

[data example](https://keen.io/docs/api/reference/#id14)


### keen.getEvents(callback)

Returns the schema information for all collections in the project specified by `options.projectId`.

[data example](https://keen.io/docs/api/reference/#query-string-parameters)


### keen.deleteCollection(collection, callback)

Deletes the entire collections specified by `collection` and all events within.  No data is returned by the callback.