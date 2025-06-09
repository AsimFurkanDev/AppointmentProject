interface AuthFetchOptions extends RequestInit {
  redirectOnAuth?: boolean;
}

export const authFetch = async (
  url: string,
  options: AuthFetchOptions = {},
  navigate: (path: string) => void
) => {
  const token = localStorage.getItem("token");
  const { redirectOnAuth = true, ...fetchOptions } = options;

  // Add token to headers if it exists
  const headers = {
    ...fetchOptions.headers,
    Authorization: token ? `Bearer ${token}` : "",
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle authentication errors
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    if (redirectOnAuth) {
      navigate("/auth");
    }
    throw new Error("Authentication failed. Please log in again.");
  }

  return response;
};
