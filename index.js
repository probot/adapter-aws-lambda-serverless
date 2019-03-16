const { createProbot } = require('probot')
const { resolve } = require('probot/lib/resolver')
const { findPrivateKey } = require('probot/lib/private-key')
const { template } = require('./views/probot')

let probot

const loadProbot = appFn => {
  probot = probot || createProbot({
    id: process.env.APP_ID,
    secret: process.env.WEBHOOK_SECRET,
    cert: findPrivateKey()
  })

  if (typeof appFn === 'string') {
    appFn = resolve(appFn)
  }

  probot.load(appFn)

  return probot
}

const lowerCaseKeys = obj =>
  Object.keys(obj).reduce((accumulator, key) =>
    Object.assign(accumulator, {[key.toLocaleLowerCase()]: obj[key]}), {})

module.exports.serverless = appFn => {
  return async (event, context) => {
    // 🤖 A friendly homepage if there isn't a payload
    if (event.httpMethod === 'GET' && event.path === '/probot') {
      const res = {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html'
        },
        body: template
      }
      return context.done(null, res)
    }

    // Otherwise let's listen handle the payload
    probot = probot || loadProbot(appFn)

    // Ends function immediately after callback
    context.callbackWaitsForEmptyEventLoop = false

    // Determine incoming webhook event type
    const headers = lowerCaseKeys(event.headers)
    const e = headers['x-github-event']

    // Convert the payload to an Object if API Gateway stringifies it
    event.body = (typeof event.body === 'string') ? JSON.parse(event.body) : event.body

    // Do the thing
    console.log(`Received event ${e}${event.body.action ? ('.' + event.body.action) : ''}`)
    if (event) {
      try {
        await probot.receive({
          name: e,
          payload: event.body
        })
        const res = {
          statusCode: 200,
          body: JSON.stringify({
            message: `Received ${e}.${event.body.action}`
          })
        }
        return context.done(null, res)
      } catch (err) {
        console.error(err)
        return context.done(null, {
          statusCode: 500,
          body: JSON.stringify(err)
        })
      }
    } else {
      console.error({ event, context })
      context.done(null, 'unknown error')
    }
    return context.done(null, {
      statusCode: 200,
      body: 'Nothing to do.'
    })
  }
}
