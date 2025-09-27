"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "@/components/ui/button"
import { jest } from "@jest/globals"

describe("Button Component", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("handles click events", () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole("button"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("applies variant styles correctly", () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("bg-destructive")
  })

  it("is accessible with keyboard navigation", () => {
    render(<Button>Accessible Button</Button>)
    const button = screen.getByRole("button")

    button.focus()
    expect(button).toHaveFocus()

    fireEvent.keyDown(button, { key: "Enter" })
    fireEvent.keyDown(button, { key: " " })
  })
})
