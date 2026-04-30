import apiClient from "./api";
import { logger } from "../../utils/logger";

export interface UserProfile {
  auth_id: string;
  nombre: string;
  email: string;
  rol: "ADMIN" | "OPERARIO";
  is_active: boolean;
  ultimo_acceso: string | null;
}

export interface SystemConfig {
  tasa_interes: number;
  impuesto_retraso: number;
}

export const usersAPI = {
  // Get all users (admin only)
  listUsers: async () => {
    try {
      console.log("[usersAPI] Fetching users list");
      const response = await apiClient.get<UserProfile[]>("/api/users/list/");
      if (response.error) {
        console.error("[usersAPI] Failed to fetch users:", response.error);
        logger.error("usersAPI", "Failed to fetch users", new Error(response.error));
      } else {
        console.log("[usersAPI] Users fetched successfully:", response.data?.length);
        logger.info("usersAPI", "Users fetched successfully", {
          count: response.data?.length,
        });
      }
      return response;
    } catch (error) {
      console.error("[usersAPI] Error fetching users:", error);
      logger.error("usersAPI", "Error fetching users", error as Error);
      return { error: "Failed to fetch users" };
    }
  },

  // Create new user (admin only)
  createUser: async (userData: {
    nombre: string;
    email: string;
    rol: "ADMIN" | "OPERARIO";
    password: string;
  }) => {
    try {
      logger.info("usersAPI", "Creating new user", { email: userData.email });
      const response = await apiClient.post<{
        user: UserProfile;
        message: string;
      }>("/api/users/create/", userData);

      if (response.error) {
        logger.warn("usersAPI", "Failed to create user", {
          error: response.error,
          email: userData.email,
        });
      } else {
        logger.info("usersAPI", "User created successfully", {
          email: userData.email,
        });
      }
      return response;
    } catch (error) {
      logger.error("usersAPI", "Error creating user", error as Error);
      return { error: "Failed to create user" };
    }
  },

  // Update user profile (admin only)
  updateUser: async (nombre: string) => {
    try {
      logger.info("usersAPI", "Updating user profile");
      const response = await apiClient.put<UserProfile>("/api/users/profile/update/", {
        nombre,
      });

      if (response.error) {
        logger.error("usersAPI", "Failed to update user", new Error(response.error));
      } else {
        logger.info("usersAPI", "User updated successfully", { nombre });
      }
      return response;
    } catch (error) {
      logger.error("usersAPI", "Error updating user", error as Error);
      return { error: "Failed to update user" };
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId: string) => {
    try {
      logger.info("usersAPI", "Deleting user", { userId });
      const response = await apiClient.delete(`/api/users/${userId}/delete/`);

      if (response.error) {
        logger.warn("usersAPI", "Failed to delete user", {
          error: response.error,
          userId,
        });
      } else {
        logger.info("usersAPI", "User deleted successfully", { userId });
      }
      return response;
    } catch (error) {
      logger.error("usersAPI", "Error deleting user", error as Error);
      return { error: "Failed to delete user" };
    }
  },

  // Get system configuration (admin only)
  getSystemConfig: async () => {
    try {
      console.log("[usersAPI] Fetching system configuration");
      const response = await apiClient.get<SystemConfig>(
        "/api/users/system-config/"
      );

      if (response.error) {
        console.error("[usersAPI] Failed to fetch system config:", response.error);
        logger.error("usersAPI", "Failed to fetch system config", new Error(response.error));
      } else {
        console.log("[usersAPI] System config fetched successfully:", response.data);
        logger.info("usersAPI", "System config fetched successfully");
      }
      return response;
    } catch (error) {
      console.error("[usersAPI] Error fetching system config:", error);
      logger.error("usersAPI", "Error fetching system config", error as Error);
      return { error: "Failed to fetch system config" };
    }
  },

  // Update system configuration (admin only)
  updateSystemConfig: async (config: Partial<SystemConfig>) => {
    try {
      logger.info("usersAPI", "Updating system configuration");
      const response = await apiClient.put<
        SystemConfig & { message: string }
      >("/api/users/system-config/update/", config);

      if (response.error) {
        logger.error("usersAPI", "Failed to update system config", new Error(response.error));
      } else {
        logger.info("usersAPI", "System config updated successfully");
      }
      return response;
    } catch (error) {
      logger.error("usersAPI", "Error updating system config", error as Error);
      return { error: "Failed to update system config" };
    }
  },
};
