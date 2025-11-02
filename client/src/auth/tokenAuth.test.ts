import {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  getAuthHeader,
  refreshAccessToken,
  type AuthTokens,
} from "./tokenAuth";

const tokens: AuthTokens = {
  accessToken: "access123",
  refreshToken: "refresh456",
};

const lsProto = Object.getPrototypeOf(window.localStorage);

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  // fresh storage and a fetch mock for tests that need it
  localStorage.clear();
  (globalThis as any).fetch = jest.fn();

  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  delete (globalThis as any).fetch;
});

describe("tokenAuth", () => {
  test("setTokens stores tokens in localStorage", () => {
    const setSpy = jest.spyOn(lsProto, "setItem");
    setTokens(tokens);
    expect(setSpy).toHaveBeenCalledWith("accessToken", "access123");
    expect(setSpy).toHaveBeenCalledWith("refreshToken", "refresh456");
    expect(localStorage.getItem("accessToken")).toBe("access123");
    expect(localStorage.getItem("refreshToken")).toBe("refresh456");
  });

  test("getAccessToken and getRefreshToken return stored values", () => {
    localStorage.setItem("accessToken", "abc");
    localStorage.setItem("refreshToken", "xyz");
    expect(getAccessToken()).toBe("abc");
    expect(getRefreshToken()).toBe("xyz");
  });

  test("clearTokens removes both tokens", () => {
    localStorage.setItem("accessToken", "a");
    localStorage.setItem("refreshToken", "b");
    const removeSpy = jest.spyOn(lsProto, "removeItem");
    clearTokens();
    expect(removeSpy).toHaveBeenCalledWith("accessToken");
    expect(removeSpy).toHaveBeenCalledWith("refreshToken");
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });

  test("getAuthHeader returns Authorization header when token exists", () => {
    localStorage.setItem("accessToken", "abc");
    expect(getAuthHeader()).toEqual({ Authorization: "Bearer abc" });
  });

  test("getAuthHeader returns empty object when no token", () => {
    localStorage.clear();
    expect(getAuthHeader()).toEqual({});
  });

  describe("refreshAccessToken", () => {
    test("returns false if no refresh token", async () => {
      localStorage.clear();
      await expect(refreshAccessToken()).resolves.toBe(false);
    });

    test("successful refresh updates access token", async () => {
      localStorage.setItem("refreshToken", "refresh456");

      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: "new123" }),
      } as Response);

      const setSpy = jest.spyOn(lsProto, "setItem");
      const result = await refreshAccessToken();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/refresh",
        expect.any(Object),
      );
      expect(setSpy).toHaveBeenCalledWith("accessToken", "new123");
      expect(localStorage.getItem("accessToken")).toBe("new123");
    });

    test("handles failed refresh gracefully (network error)", async () => {
      localStorage.setItem("refreshToken", "refresh456");

      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockRejectedValueOnce(new Error("network error"));

      const removeSpy = jest.spyOn(lsProto, "removeItem");
      const result = await refreshAccessToken();

      expect(result).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledWith("accessToken");
      expect(removeSpy).toHaveBeenCalledWith("refreshToken");
    });

    test("handles non-OK HTTP response", async () => {
      localStorage.setItem("refreshToken", "refresh456");

      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

      const removeSpy = jest.spyOn(lsProto, "removeItem");
      const result = await refreshAccessToken();

      expect(result).toBe(false);
      expect(removeSpy).toHaveBeenCalledWith("accessToken");
      expect(removeSpy).toHaveBeenCalledWith("refreshToken");
    });
  });
});
