import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth, type User } from "./AuthContext";

const mockUser: User = {
  id: 1,
  name: "User",
  email: "user@gmail.com",
  role: "STUDENT",
  organizationId: null,
};

function AuthConsumer() {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="username">{user?.name ?? "none"}</div>
      <button onClick={() => login(mockUser)}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe("useAuth / AuthProvider", () => {
  test("throws if used outside AuthProvider", () => {
    const Outside = () => {
      useAuth();
      return null;
    };
    expect(() => render(<Outside />)).toThrow(
      "useAuth must be used within AuthProvider"
    );
  });

  test("initializes from localStorage", () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("username")).toHaveTextContent("User");
  });

  test("login updates state and writes to localStorage", async () => {
    const user = userEvent.setup();
    const lsProto = Object.getPrototypeOf(window.localStorage);
    const setSpy = jest.spyOn(lsProto, "setItem");

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("username")).toHaveTextContent("none");

    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByTestId("username")).toHaveTextContent("User");
    expect(setSpy).toHaveBeenCalledWith("user", JSON.stringify(mockUser));
    expect(JSON.parse(localStorage.getItem("user") as string)).toEqual(
      mockUser
    );
  });

  test("logout clears state and removes from localStorage", async () => {
    const user = userEvent.setup();
    const lsProto = Object.getPrototypeOf(window.localStorage);
    const removeSpy = jest.spyOn(lsProto, "removeItem");

    localStorage.setItem("user", JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("username")).toHaveTextContent("User");

    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(screen.getByTestId("username")).toHaveTextContent("none");
    expect(removeSpy).toHaveBeenCalledWith("user");
    expect(localStorage.getItem("user")).toBeNull();
  });
});
