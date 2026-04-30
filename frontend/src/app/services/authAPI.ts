import apiClient from "./api";

// Token store helper
const setTokenWithExpiration = (token: string) => {
  const tokenData = {
    token,
    timestamp: Date.now(),
  };
  localStorage.setItem("creditline_token", JSON.stringify(tokenData));
};

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
      setTokenWithExpiration(response.data.token);
      localStorage.setItem("creditline_user", JSON.stringify(response.data.user));
    }

    return response;
  },

  logout: () => {
    localStorage.removeItem("creditline_token");
    localStorage.removeItem("creditline_user");
    window.location.href = "/login";
  },
};