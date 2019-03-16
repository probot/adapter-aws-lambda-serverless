const { serverless } = require('../')

describe('serverless-lambda', () => {
  let spy, handler, context

  beforeEach(() => {
    context = { done: jest.fn() }
    spy = jest.fn()
    handler = serverless(async app => {
      app.auth = () => Promise.resolve({})
      app.on('issues', spy)
    })
  })

  it('responds with the homepage', async () => {
    const event = { httpMethod: 'GET', path: '/probot' }
    await handler(event, context)
    expect(context.done).toHaveBeenCalled()
    expect(context.done.mock.calls[0][0]).toMatchSnapshot()
  })

  it('calls the event handler', async () => {
    const event = {
      body: {
        installation: { id: 1 }
      },
      headers: {
        'X-Github-Event': 'issues',
        'x-github-delivery': 123
      }
    }

    await handler(event, context)
    expect(context.done).toHaveBeenCalled()
    expect(spy).toHaveBeenCalled()
  })
})
