import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "../api/client";

describe("api client", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("get includes auth header when token exists", async () => {
    localStorage.setItem("token", "test-token");
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: "ok" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await api.get("/test");
    expect(mockFetch).toHaveBeenCalledWith("/api/test", expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: "Bearer test-token",
      }),
    }));
  });

  it("post sends JSON body", async () => {
    localStorage.setItem("token", "t");
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", mockFetch);

    await api.post("/test", { hello: "world" });
    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[0]).toBe("/api/test");
    expect(callArgs[1].method).toBe("POST");
    expect(JSON.parse(callArgs[1].body)).toEqual({ hello: "world" });
  });

  it("redirects to login on 401", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(api.get("/test")).rejects.toThrow("Unauthorized");
  });
});
