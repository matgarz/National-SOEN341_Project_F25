import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom"; // ✅ ADD THIS
import NoAccess from "../components/auth/NoAccess";

// Mock AuthContext
jest.mock("./AuthContext", () => {
  const logoutMock = jest.fn();
  return {
    __esModule: true,
    useAuth: () => ({ logout: logoutMock }),
    _mocks: { logoutMock },
  };
});

// Mock tokenAuth
jest.mock("./tokenAuth", () => {
  return {
    __esModule: true,
    clearTokens: jest.fn(),
  };
});

// Grab the mocks from the mocked modules
const { _mocks } = jest.requireMock("./AuthContext") as {
  _mocks: { logoutMock: jest.Mock };
};

const { clearTokens } = jest.requireMock("./tokenAuth") as {
  clearTokens: jest.Mock;
};

beforeEach(() => {
  _mocks.logoutMock.mockClear();
  clearTokens.mockClear();
});

test("renders Access Denied copy", () => {
  render(
    <MemoryRouter>
      <NoAccess />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", { name: /access denied/i }),
  ).toBeInTheDocument();

  expect(
    screen.getByText(/you don't have permission to view this page/i),
  ).toBeInTheDocument();

  expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
});

test("clicking Logout clears tokens and logs out", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <NoAccess />
    </MemoryRouter>,
  );

  await user.click(screen.getByRole("button", { name: /logout/i }));

  expect(clearTokens).toHaveBeenCalledTimes(1);
  expect(_mocks.logoutMock).toHaveBeenCalledTimes(1);
});
