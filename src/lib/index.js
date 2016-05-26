import { EventEmitter } from 'events'
import { assert } from 'chai'
import { createPrettySerializer } from 'bunyan-serializer'


/**
 * Bunyan writable stream that writes logs to pmx.
 */
export default class BunyanPmx extends EventEmitter {
  constructor({ data
              , res
              , reply
              , serializer = createPrettySerializer()
              , hijackLoggers = [] } = {}) {
    assert.ok(data && res || reply, 'bunyan-pmx requires data and res (scoped action) or reply (action).')
    assert.ok(!reply, 'bunyan-pmx does not yet support reply.')
    super()
    this.data = data
    this.res = res
    this.serializer = serializer
    this.writable = true
    this.writeStreams = (hijackLoggers
      .map(log => log.streams.map(({ type, stream, closeOnExit, level, raw }) => stream)))
      .reduce((streams, x, i, arr) => {
        return [...streams, ...arr[i] ]
      }, [])
    this.hijackStreams()
  }
  hijackStreams = () => {
    try {
      this.writeStreams.forEach(stream => {
        stream._originalWrite = stream.write.bind(stream)
        stream.write = (...args) => {
          try {
            stream._originalWrite(...args)
          } catch(err) {
            this.write({ level: 50, err, msg: `error occurred writing to original stream with args ${[...args].join(', ')}`})
          }
          this.write(...args)
          return true
        }
      })
    } catch(err) {
      this.write({ err, level: 50, msg: 'an error occurred hijacking stream' })
    }
  };
  write = x => {
    try {
      this.res.send(this.serializer(x))
    } catch(err) {
      this.error(err)
      return false
    }
    return true
  };
  error = err => {
    this.emit('error', err)
  };
  end = (...args) => {
    if(args.length > 0)
      this.write(...args)
    this.writable = false
  };
  destroy = () => {
    this.writable = false
    this.res.end()
    this.emit('close')
  };
  destroySoon = () => {
    this.destroy()
  };
}
