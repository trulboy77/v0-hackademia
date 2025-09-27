import { createMocks } from "node-mocks-http"
import handler from "@/app/api/challenges/route"

describe("/api/challenges", () => {
  it("returns challenges list", async () => {
    const { req, res } = createMocks({
      method: "GET",
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(Array.isArray(data)).toBe(true)
  })

  it("creates new challenge with admin auth", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        authorization: "Bearer admin-token",
      },
      body: {
        title: "Test Challenge",
        description: "Test description",
        points: 100,
        difficulty: "easy",
        flag: "flag{test}",
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
  })

  it("rejects unauthorized challenge creation", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        title: "Test Challenge",
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
  })
})
