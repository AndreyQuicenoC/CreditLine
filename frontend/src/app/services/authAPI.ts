import apiClient from "./api";

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<{
      token: string;
      user: any;
    }>("/api/users/login/", {
      email,
      password,
    });

    if (response.data?.token) {
      // Store token as plain string (JWT already has exp in payload)
      localStorage.setItem("creditline_token", response.data.token);
      localStorage.setItem(
        "creditline_user",
        JSON.stringify(response.data.user),
      );
      console.log("[Auth] Login successful, token stored");
    }

    return response;
  },

  logout: () => {
    localStorage.removeItem("creditline_token");
    localStorage.removeItem("creditline_user");
    console.log("[Auth] Logout completed");
    window.location.href = "/login";
  },
};
