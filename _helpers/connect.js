const promiseRetry = require('promise-retry')
const { MongoClient } = require('mongodb');

const options = {
  reconnectTries: 60,
  reconnectInterval: 1000,
  poolSize: 10,
  bufferMaxEntries: 0 // If not connected, return errors immediately rather than waiting for reconnect
}

const promiseRetryOptions = {
  retries: options.reconnectTries,
  factor: 2,
  minTimeout: options.reconnectInterval,
  maxTimeout: 5000
}

const connect = (url) => {
  return promiseRetry((retry, number) => {
    console.log(`MongoClient connecting to ${url} - retry number: ${number}`)
    return MongoClient.connect(url, options).then(injections => injections).catch(retry)
  }, promiseRetryOptions)
}

module.exports = { connect }