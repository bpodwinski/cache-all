const assert = require('assert')
const path = require('path')
const fileCache = require('../file')
const memoryCache = require('../memory')
const redisCache = require('../redis')

describe('File Cache Module', function() {
  describe('#init()', function() {
    it('should have main methods', function () {
      assert.ok(fileCache.set)
      assert.ok(fileCache.get)
      assert.ok(fileCache.has)
      assert.ok(fileCache.remove)
      assert.ok(fileCache.removeByPattern)
      assert.ok(fileCache.clear)
      assert.ok(fileCache.middleware)
    })

    it('should return status 0 if cache module wasn\'t init before', async function () {
      let rs = await fileCache.set('key', {foo: 'bar'})
      if (rs.status === 0) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 0')
    })

    it('should return status 0 if cache module wasn\'t enable', async function () {
      fileCache.init({
        isEnable: false
      })

      let rs = await fileCache.set('key', {foo: 'bar'})
      if (rs.status === 0) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 0')
    })

    it('should init successful use default config', async function() {
      fileCache.init({
        isEnable: true
      })

      let rs = await fileCache.set('key', {foo: 'bar'})
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })

    it('should init successful use file engine', async function() {
      fileCache.init({
        engine: 'file',
        expireIn: 60,
        file: { path: path.join(__dirname, '../storage/cache') }
      })

      try {
        await fileCache.get('key')
        return Promise.resolve('OK')
      } catch (e) {
        Promise.reject('Init cache file module fail')
      }
    })
  })

  describe('#set', function() {
    it('should return status 1 when set string data cache successful', async function() {
      let rs = await fileCache.set('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })

    it('should return status 1 when set object data cache successful', async function() {
      let rs = await fileCache.set('foo1', {bar: 'baz'})
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#get', function() {
    it('should return "bar" when get key "foo" successful', async function() {
      let rs = await fileCache.get('foo')
      assert.equal(rs, 'bar', 'response not equal "bar"');
    })

    it('should return "{bar: \'baz\'}" when get key "foo1" successful', async function() {
      let rs = await fileCache.get('foo1')
      assert.deepEqual(rs, {bar: 'baz'}, 'response not equal "{bar: \'baz\'}"')
    })
  })

  describe('#has', function() {
    it('should return true when check key "foo"', async function() {
      let rs = await fileCache.has('foo')
      assert.equal(rs, true, 'response not equal true');
    })

    it('should return true when check key "foo1"', async function() {
      let rs = await fileCache.has('foo1')
      assert.equal(rs, true, 'response not equal true')
    })
  })

  describe('#remove', function() {
    it('should return status 1 when remove "foo" key', async function () {
      let rs = await fileCache.remove('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#removeByPattern', function() {
    it('should be empty when get cache after remove all by pattern', async function () {
      await fileCache.set('other_foo', 'bar')
      await fileCache.set('pattern_foo', 'bar')
      await fileCache.set('pattern_foo2', 'bar')
      await fileCache.set('pattern_foo3', 'bar')

      await fileCache.removeByPattern(/pattern/g)
      if (
        await fileCache.get('pattern_foo') ||
        await fileCache.get('pattern_foo2') ||
        await fileCache.get('pattern_foo3')
      ) {
        return Promise.reject('It still has cache after remove')
      }

      if (!await fileCache.get('other_foo')) {
        return Promise.reject('It removed incorrect key')
      }

      return Promise.resolve('OK')
    })
  })

  describe('#clear', function() {
    it('should return status 1 when clear all cache', async function () {
      let rs = await fileCache.clear()
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })
})


describe('In-memory Cache Module', function() {
  describe('#init()', function() {
    it('should have main methods', function () {
      assert.ok(memoryCache.set)
      assert.ok(memoryCache.get)
      assert.ok(memoryCache.has)
      assert.ok(memoryCache.remove)
      assert.ok(memoryCache.removeByPattern)
      assert.ok(memoryCache.clear)
      assert.ok(memoryCache.middleware)
    })

    it('should init successful use default config', async function() {
      memoryCache.init()

      try {
        await memoryCache.get('key')
        return Promise.resolve('OK')
      } catch (e) {
        Promise.reject('Init default fail')
      }
    })

    it('should init successful use in-memory engine', async function() {
      memoryCache.init({
        engine: 'memory',
        expireIn: 60,
      })

      try {
        await memoryCache.get('key')
        return Promise.resolve('Done')
      } catch (e) {
        Promise.reject('Init cache memory module fail')
      }
    })
  })

  describe('#set', function() {
    it('should return status 1 when set string data cache successful', async function() {
      let rs = await memoryCache.set('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })

    it('should return status 1 when set object data cache successful', async function() {
      let rs = await memoryCache.set('foo1', {bar: 'baz'})
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#get', function() {
    it('should return "bar" when get key "foo" successful', async function() {
      let rs = await memoryCache.get('foo')
      assert.equal(rs, 'bar', 'response not equal "bar"');
    })

    it('should return "{bar: \'baz\'}" when get key "foo1" successful', async function() {
      let rs = await memoryCache.get('foo1')
      assert.deepEqual(rs, {bar: 'baz'}, 'response not equal "{bar: \'baz\'}"')
    })
  })

  describe('#has', function() {
    it('should return true when check key "foo"', async function() {
      let rs = await memoryCache.has('foo')
      assert.equal(rs, true, 'response not equal true');
    })

    it('should return true when check key "foo1"', async function() {
      let rs = await memoryCache.has('foo1')
      assert.equal(rs, true, 'response not equal true')
    })
  })

  describe('#remove', function() {
    it('should return status 1 when remove "foo" key', async function () {
      let rs = await memoryCache.remove('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#removeByPattern', function() {
    it('should be empty when get cache after remove all by pattern', async function () {
      await memoryCache.set('other_foo', 'bar')
      await memoryCache.set('pattern_foo', 'bar')
      await memoryCache.set('pattern_foo2', 'bar')
      await memoryCache.set('pattern_foo3', 'bar')

      await memoryCache.removeByPattern(/pattern/g)
      if (
        await memoryCache.get('pattern_foo') ||
        await memoryCache.get('pattern_foo2') ||
        await memoryCache.get('pattern_foo3')
      ) {
        return Promise.reject('It still has cache after remove')
      }

      if (!await memoryCache.get('other_foo')) {
        return Promise.reject('It removed incorrect key')
      }

      return Promise.resolve('OK')
    })
  })

  describe('#clear', function() {
    it('should return status 1 when clear all cache', async function () {
      let rs = await memoryCache.clear()
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })
})

describe('Redis Cache Module', function() {
  describe('#init()', function() {
    it('should have main methods', function () {
      assert.ok(redisCache.set)
      assert.ok(redisCache.get)
      assert.ok(redisCache.has)
      assert.ok(redisCache.remove)
      assert.ok(redisCache.removeByPattern)
      assert.ok(redisCache.clear)
      assert.ok(redisCache.middleware)
    })

    it('should init successful use default config', async function() {
      redisCache.init()

      try {
        await redisCache.get('key')
        return Promise.resolve('OK')
      } catch (e) {
        Promise.reject('Init default fail')
      }
    })

    it('should init successful use redis engine', async function() {
      redisCache.init({
        engine: 'redis',
        expireIn: 90,
        redis: {
          port: 6379,
          host: '127.0.0.1'
        }
      })

      try {
        await redisCache.get('key')
        return Promise.resolve('Done')
      } catch (e) {
        Promise.reject('Init cache memory module fail')
      }
    })
  })

  describe('#set', function() {
    it('should return status 1 when set string data cache successful', async function() {
      let rs = await redisCache.set('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })

    it('should return status 1 when set object data cache successful', async function() {
      let rs = await redisCache.set('foo1', {bar: 'baz'})
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#get', function() {
    it('should return "bar" when get key "foo" successful', async function() {
      let rs = await redisCache.get('foo')
      assert.equal(rs, 'bar', 'response not equal "bar"');
    })

    it('should return "{bar: \'baz\'}" when get key "foo1" successful', async function() {
      let rs = await redisCache.get('foo1')
      assert.deepEqual(rs, {bar: 'baz'}, 'response not equal "{bar: \'baz\'}"')
    })
  })

  describe('#has', function() {
    it('should return true when check key "foo"', async function() {
      let rs = await redisCache.has('foo')
      assert.equal(rs, true, 'response not equal true');
    })

    it('should return true when check key "foo1"', async function() {
      let rs = await redisCache.has('foo1')
      assert.equal(rs, true, 'response not equal true')
    })
  })

  describe('#remove', function() {
    it('should return status 1 when remove "foo" key', async function () {
      let rs = await redisCache.remove('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#removeByPattern', function() {
    it('should be empty when get cache after remove all by pattern', async function () {
      await redisCache.set('other_foo', 'bar')
      await redisCache.set('pattern_foo', 'bar')
      await redisCache.set('pattern_foo2', 'bar')
      await redisCache.set('pattern_foo3', 'bar')

      await redisCache.removeByPattern(/pattern/g)
      if (
        await redisCache.get('pattern_foo') ||
        await redisCache.get('pattern_foo2') ||
        await redisCache.get('pattern_foo3')
      ) {
        return Promise.reject('It still has cache after remove')
      }

      if (!await redisCache.get('other_foo')) {
        return Promise.reject('It removed incorrect key')
      }

      return Promise.resolve('OK')
    })
  })

  describe('#clear', function() {
    it('should return status 1 when clear all cache', async function () {
      let rs = await redisCache.clear()
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })
})
