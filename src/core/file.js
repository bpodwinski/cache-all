const Fs = require('fs-extra')
const sanitize = require('sanitize-filename')
const path = require('path')
const noop = () => {}

module.exports = class FileStore {
  /**
   * FileStore constructor.
   *
   * @param {Object} options
   * @api public
   */
  constructor(options) {
    this.options = options
  }

  /**
   * Init cache instance
   *
   * @param {Function} fn
   */
  init(fn = noop) {
    let self = this
    self.path = this.options.path
    self.cache = {}

    Fs.exists(self.path, (isExists) => {
      if (!isExists) {
        Fs.ensureDir(self.path, (err) => {
          if (err) throw new Error(`ensureDir error ${err}`)

          readDir(self, fn)
        })
      } else {
        readDir(self, fn)
      }
    })

    function readDir(self, fn) {
      Fs.readdir(self.path, (err, cacheFiles) => {
        if (err) return fn(err)

        self.cache = {}
        cacheFiles.forEach(function(file) {
          file = file.replace('.json', '')

          self.cache[file] = true
        })

        process.nextTick(function tick() {
          fn(null)
        })
      })
    }
  }

  /**
   * Get entry
   * @param {String} key
   * @param {Function} fn
   * @api public
   */
  get(key, fn = noop) {
    key = sanitize(key)

    let val = null,
      cacheFile = path.join(this.path, key + '.json')

    if (!this.cache[key]) {
      return fn(null, null)
    }

    Fs.exists(cacheFile, (isExists) => {
      if (isExists) {
        Fs.readFile(cacheFile, (err, data) => {
          if (err) return fn(err)

          data = JSON.parse(data)

          if (!data) return fn(null, data)
          if (data.expire < Date.now()) {
            this.remove(key)
            return fn(null, null)
          }

          try {
            val = JSON.parse(data.value)
          } catch (e) {
            return fn(e)
          }

          process.nextTick(function tick() {
            fn(null, val)
          })
        })
      } else {
        delete this.cache[key]
        return fn(null, null)
      }
    })
  }

  /**
   * Set an entry.
   * @param {String} key
   * @param {Mixed} val
   * @param {Number} ttl
   * @param {Function} fn
   * @api public
   */
  set(key, val, ttl, fn = noop) {
    if (val === undefined || val === null) {
      return fn(new Error('val not set'))
    }
    ttl = ttl * 1000
    key = sanitize(key)

    let data
    try {
      data = {
        value: JSON.stringify(val),
        expire: JSON.stringify(Date.now() + ttl),
      }
    } catch (e) {
      return fn(e)
    }

    let cacheFile = path.join(this.path, key + '.json')
    Fs.writeFile(cacheFile, JSON.stringify(data, null, 4), (err) => {
      if (err) return fn(err)

      this.cache[key] = true
      fn(null, val)
    })
  }

  /**
   * Delete an entry.
   * @param {String} key
   * @param {Function} fn
   * @api public
   */
  remove(key, fn = noop) {
    key = sanitize(key)
    let cacheFile = path.join(this.path, key + '.json')

    Fs.exists(cacheFile, (isExists) => {
      if (!isExists) {
        delete this.cache[key]
        return fn()
      }

      Fs.unlink(cacheFile, (err) => {
        if (err) return fn(err)

        process.nextTick(() => {
          delete this.cache[key]

          fn(null)
        })
      })
    })
  }

  /**
   * Clear all cached files
   * @param {String} key
   * @param {Function} fn
   * @api public
   */
  clear(fn = noop) {
    Fs.remove(this.path, (err) => {
      if (err) return fn(err)

      Fs.mkdir(this.path, () => {
        if (err) return fn(err)
        this.cache = {}
        fn(null)
      })
    })
  }

  /**
   * Get all cached entries
   * @param {Function} fn
   */
  getAll (fn = noop) {
    let self = this,
      entries = [],
      cache = self.cache

    const keys = Object.keys(cache)
    if (!keys.length) {
      return entries
    }

    keys.forEach((entry, index) => {
      self.get(entry, function (err, data) {
        if (err) return fn(err)

        entries.push({ key: entry, value: data })

        if (entries.length === keys.length) fn(null, entries)
      })
    })
  }

  /**
   * Remove all cached entries that match the pattern
   *
   * @param {String} pattern
   * @param {Function} fn
   */
  removeByPattern(pattern, fn = noop) {
    let self = this,
      storagePath = self.path,
      clearedKeys = []

    Fs.readdir(storagePath, (err, files) => {
      if (err) return fn(err)

      files.forEach(file => {
        if (file.match(pattern)) {
          Fs.remove(path.join(storagePath, file), (err) => {
            if (err) return fn(err)

            clearedKeys.push(file.split('.json')[0])
            process.nextTick(function tick() {
              clearedKeys.forEach(key => {
                self.cache[key] = null
              })

              fn(null)
            })
          })
        }
      })
    })
  }
}
