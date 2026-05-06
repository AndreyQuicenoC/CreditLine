import apiClient from "../api";
import { logger } from "../../../utils/logger";
import type {
  MunicipioCreatePayload,
  MunicipioDTO,
  MunicipioUpdatePayload,
  OperarioDetailResponse,
  OperarioListResponse,
} from "./types";

const MODULE = "operario/municipiosAPI";

function withCount<T>(response: OperarioListResponse<T>) {
  return {
    ...response,
    count: response.count ?? response.data.length,
  };
}

export const municipiosAPI = {
  list: async (includeInactive = false) => {
    try {
      const response = await apiClient.get<OperarioListResponse<MunicipioDTO>>(
        `/api/operario/municipios/?include_inactive=${includeInactive}`,
      );
      if (response.error) {
        logger.error(
          MODULE,
          "Failed to fetch municipalities",
          new Error(response.error),
        );
        return { error: response.error };
      }
      return {
        data: withCount(response.data as OperarioListResponse<MunicipioDTO>),
      };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error fetching municipalities",
        error as Error,
      );
      return { error: "Failed to fetch municipalities" };
    }
  },

  getById: async (municipioId: string) => {
    try {
      const response = await apiClient.get<OperarioDetailResponse<unknown>>(
        `/api/operario/municipios/${municipioId}/`,
      );
      if (response.error) {
        return { error: response.error };
      }
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error fetching municipality detail",
        error as Error,
      );
      return { error: "Failed to fetch municipality detail" };
    }
  },

  create: async (payload: MunicipioCreatePayload) => {
    try {
      const response = await apiClient.post<
        OperarioDetailResponse<MunicipioDTO>
      >("/api/operario/municipios/", payload);
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error creating municipality",
        error as Error,
      );
      return { error: "Failed to create municipality" };
    }
  },

  update: async (municipioId: string, payload: MunicipioUpdatePayload) => {
    try {
      const response = await apiClient.put<
        OperarioDetailResponse<MunicipioDTO>
      >(`/api/operario/municipios/${municipioId}/`, payload);
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error updating municipality",
        error as Error,
      );
      return { error: "Failed to update municipality" };
    }
  },

  remove: async (municipioId: string) => {
    try {
      const response = await apiClient.delete(
        `/api/operario/municipios/${municipioId}/`,
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error deleting municipality",
        error as Error,
      );
      return { error: "Failed to delete municipality" };
    }
  },
};
