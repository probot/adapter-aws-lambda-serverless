const { createProbot } = require('probot-ts');
const { resolve } = require('probot-ts/lib/resolver')
const { findPrivateKey } = require('probot-ts/lib/private-key')
const { template } = require('./views/probot')

const loadProbot = (plugin) => {
  const probot = createProbot({
    id: process.env.APP_ID,
    secret: process.env.WEBHOOK_SECRET,
    cert: findPrivateKey()
  })

  if (typeof plugin === 'string') {
    plugin = resolve(plugin)
  }

  probot.load(plugin)

  return probot
}


module.exports.serverless = (plugin) => {

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
    const probot = loadProbot(plugin)

    // Ends function immediately after callback
    context.callbackWaitsForEmptyEventLoop = false

    // Determine incoming webhook event type
    const e = event.headers['x-github-event'] || event.headers['X-GitHub-Event']
    const id = event.headers['x-github-delivery'] || event.headers['X-GitHub-Delivery']

    // Convert the payload to an Object if API Gateway stringifies it
    event.body = (typeof event.body === 'string') ? JSON.parse(event.body) : event.body

    // Do the thing
    console.log(`Received event ${e}${event.body.action ? ('.' + event.body.action) : ''}`)
    if (event) {
      try {
        await probot.receive({
          event: e,
          payload: event.body
        })
        const res = {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Hi Node8!'
          })
        }
        return context.done(null, res)
      } catch (err) {
        console.error(err)
        return err
      }
    } else {
      console.error({ event, context })
      callback('unknown error')
    }
  }

}
