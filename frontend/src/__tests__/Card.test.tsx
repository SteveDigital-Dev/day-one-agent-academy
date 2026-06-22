import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card, StatCard, ProgressBar } from "../components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>hello</p></Card>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Card className="custom">x</Card>);
    expect(container.firstChild).toHaveClass("custom");
  });
});

describe("StatCard", () => {
  it("shows label and value", () => {
    render(<StatCard label="Students" value={42} />);
    expect(screen.getByText("Students")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows subtitle when provided", () => {
    render(<StatCard label="Test" value={1} subtitle="note" />);
    expect(screen.getByText("note")).toBeInTheDocument();
  });
});

describe("ProgressBar", () => {
  it("renders with correct percentage width", () => {
    const { container } = render(<ProgressBar value={50} max={100} />);
    const bar = container.querySelector(".bg-academy-500") as HTMLElement;
    expect(bar).toHaveStyle({ width: "50%" });
  });

  it("caps at 100%", () => {
    const { container } = render(<ProgressBar value={200} max={100} />);
    const bar = container.querySelector(".bg-academy-500") as HTMLElement;
    expect(bar).toHaveStyle({ width: "100%" });
  });

  it("shows value/max label when label prop given", () => {
    render(<ProgressBar value={30} max={100} label="Progress" />);
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("30 / 100")).toBeInTheDocument();
  });
});
