import apiClient from "../api";
import { logger } from "../../../utils/logger";
import type {
  DashboardStatsDTO,
  DeudaStatusStatsDTO,
  MunicipioStatsDTO,
  OperarioDetailResponse,
  OperarioListResponse,
} from "./types";

const MODULE = "operario/estadisticasAPI";

export const estadisticasAPI = {
  getDashboard: async () => {
    try {
      const response = await apiClient.get<
        OperarioDetailResponse<DashboardStatsDTO>
      >("/api/operario/stats/dashboard/");
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error fetching dashboard stats",
        error as Error,
      );
      return { error: "Failed to fetch dashboard stats" };
    }
  },

  getMunicipios: async () => {
    try {
      const response = await apiClient.get<
        OperarioListResponse<MunicipioStatsDTO>
      >("/api/operario/stats/municipios/");
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error fetching municipality stats",
        error as Error,
      );
      return { error: "Failed to fetch municipality stats" };
    }
  },

  getDeudas: async () => {
    try {
      const response = await apiClient.get<
        OperarioDetailResponse<DeudaStatusStatsDTO>
      >("/api/operario/stats/deudas/");
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error fetching debt stats",
        error as Error,
      );
      return { error: "Failed to fetch debt stats" };
    }
  },
};
