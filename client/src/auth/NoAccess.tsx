import { useAuth } from "./AuthContext";
import { clearTokens } from "./tokenAuth";

export default function NoAccess() {
  const { logout } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Access Denied</h1>
      <p className="text-gray-700 mb-4">
        You don't have permission to view this page.
      </p>
      <button
        onClick={() => {
          clearTokens();
          logout();
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Logout
      </button>
    </div>
  );
}
