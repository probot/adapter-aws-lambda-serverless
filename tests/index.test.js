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
    const result = await handler(event, context)
    expect(result).toMatchObject({
      body: expect.any(String),
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html'
      }
    })
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

    const result = await handler(event, context)
    expect(spy).toHaveBeenCalled()
    expect(result.statusCode).toBe(200)
  })

  it('responds with a 400 error when body is null', async () => {
    const event = {
      body: null,
      headers: {
        'X-Github-Event': 'issues',
        'x-github-delivery': 123
      }
    }

    await handler(event, context)
    expect(context.done).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 400
    }))
    expect(spy).not.toHaveBeenCalled()
  })

  it('responds with a 400 when no x-github-event header is sent', async () => {
    const event = {
      body: {
        installation: { id: 1 }
      },
      headers: {
        'x-github-delivery': 123
      }
    }

    const result = await handler(event, context)
    expect(spy).not.toHaveBeenCalled()
    expect(result.statusCode).toBe(400)
  })

  it('responds with a 400 when no headers are present', async () => {
    const event = {
      body: {
        installation: { id: 1 }
      }
    }

    const result = await handler(event, context)
    expect(spy).not.toHaveBeenCalled()
    expect(result.statusCode).toBe(400)
  })
})
