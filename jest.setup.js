"use client"

import "@testing-library/jest-dom"
import { server } from "./mocks/server"
import { jest } from "@jest/globals"

// Establish API mocking before all tests
jest.beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests
jest.afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
jest.afterAll(() => server.close())

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return "/"
  },
}))

// Mock Supabase
jest.mock("@/lib/supabase/client", () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}))
