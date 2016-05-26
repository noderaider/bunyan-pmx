# bunyan-pmx

**bunyan-pmx is a lightweight bunyan stream to log to [keymetrics.io](http://keymetrics.io).**

[![NPM](https://nodei.co/npm/bunyan-pmx.png?stars=true&downloads=true)](https://nodei.co/npm/bunyan-pmx/)

## Install

`npm i -S bunyan-pmx`


## Documentation

This module creates a bunyan stream that writes to pmx. It uses the linked pm2 account to interact with the pmx api.  At this time, only scoped actions are supported (`bunyan-pmx` requires the scoped action data and res parameters in its constructor).

If there are additional bunyan loggers that must be intercepted and relayed to pmx, they can be specified in the hijackLoggers array parameter of the `bunyan-pmx` constructor.

Plan to add support for non scoped actions and other integration points in future releases.

## How to use

```js
import { createLogger } from 'bunyan'
import BunyanPmx from 'bunyan-pmx'
import pmx from 'pmx'

/** bunyan logger used throughout application (optional) */
import log as hijackLog from './log'

/** Useful in bin scripts - when there is already a logger being used throughout the app it can be passed to the BunyanPmx stream writer within hijackLoggers array. */
const createPmxLogger = ({ name = 'pmx', level = 'info', streams = [], data, res } = {}) => {
  const stream = new BunyanPmx({ data, res, hijackLoggers: [hijackLog] })
  const pmxStream = { level, stream }
  return createLogger({ name, streams: [pmxStream, ...streams] })
}


pmx.scopedAction('start', (data, res) => {
  const log = createPmxLogger({ data, res, level: 'trace'})
  log.info('woohoo, this is getting transmitted as a log to keymetrics.io!')

  /** DO STUFF */
})
```


## Options

**The BunyanPmx class constructor takes a single options argument with the following properties:**

Name            | Type                  | Description
-------------   | -----------------     | -----------
`data`          | `Object (required)`   | The data callback argument from a pmx scoped action
`res`           | `Object (required)`   | The res callback argument from a pmx scoped action
`reply`         | `(unimplemented)`     | The reply callback argument from a pmx action (coming in future release)
`serializer`    | `function (optional)` | A custom serializer that will be proxied arguments directly stream is written to. Defaults to a human readable format.
`hijackLoggers` | `Array (optional)`    | An array of bunyan loggers that should be hijacked and rewritten to pmx stream.
