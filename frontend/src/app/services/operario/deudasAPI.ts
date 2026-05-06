import apiClient from "../api";
import { logger } from "../../../utils/logger";
import type {
  AbonoCreatePayload,
  DeudaDTO,
  OperarioDetailResponse,
  OperarioListResponse,
} from "./types";

const MODULE = "operario/deudasAPI";

function withCount<T>(response: OperarioListResponse<T>) {
  return {
    ...response,
    count: response.count ?? response.data.length,
  };
}

export const deudasAPI = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    clienteId?: string;
    estado?: string;
    atrasadasOnly?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("page_size", String(params.pageSize));
    if (params?.clienteId) query.set("cliente_id", params.clienteId);
    if (params?.estado) query.set("estado", params.estado);
    if (typeof params?.atrasadasOnly === "boolean")
      query.set("atrasadas_only", String(params.atrasadasOnly));

    try {
      const response = await apiClient.get<OperarioListResponse<DeudaDTO>>(
        `/api/operario/deudas/${query.toString() ? `?${query.toString()}` : ""}`,
      );
      if (response.error) {
        logger.error(
          MODULE,
          "Failed to fetch debts",
          new Error(response.error),
        );
        return { error: response.error };
      }
      return {
        data: withCount(response.data as OperarioListResponse<DeudaDTO>),
      };
    } catch (error) {
      logger.error(MODULE, "Unexpected error fetching debts", error as Error);
      return { error: "Failed to fetch debts" };
    }
  },

  getById: async (deudaId: string) => {
    try {
      const response = await apiClient.get<
        OperarioDetailResponse<DeudaDTO & { cliente?: unknown }>
      >(`/api/operario/deudas/${deudaId}/`);
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error fetching debt detail",
        error as Error,
      );
      return { error: "Failed to fetch debt detail" };
    }
  },

  createPayment: async (deudaId: string, payload: AbonoCreatePayload) => {
    try {
      const response = await apiClient.post<OperarioDetailResponse<unknown>>(
        `/api/operario/deudas/${deudaId}/abonos/`,
        payload,
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(MODULE, "Unexpected error creating payment", error as Error);
      return { error: "Failed to create payment" };
    }
  },

  updatePayment: async (
    deudaId: string,
    abonoId: string,
    payload: AbonoCreatePayload,
  ) => {
    try {
      const response = await apiClient.put<OperarioDetailResponse<unknown>>(
        `/api/operario/deudas/${deudaId}/abonos/${abonoId}/`,
        payload,
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(MODULE, "Unexpected error updating payment", error as Error);
      return { error: "Failed to update payment" };
    }
  },

  deletePayment: async (deudaId: string, abonoId: string) => {
    try {
      const response = await apiClient.delete<OperarioDetailResponse<unknown>>(
        `/api/operario/deudas/${deudaId}/abonos/${abonoId}/`,
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(MODULE, "Unexpected error deleting payment", error as Error);
      return { error: "Failed to delete payment" };
    }
  },

  update: async (deudaId: string, payload: Partial<DeudaDTO>) => {
    try {
      const response = await apiClient.put<OperarioDetailResponse<DeudaDTO>>(
        `/api/operario/deudas/${deudaId}/`,
        payload,
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(MODULE, "Unexpected error updating debt", error as Error);
      return { error: "Failed to update debt" };
    }
  },

  remove: async (deudaId: string) => {
    try {
      const response = await apiClient.delete(
        `/api/operario/deudas/${deudaId}/`,
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(MODULE, "Unexpected error deleting debt", error as Error);
      return { error: "Failed to delete debt" };
    }
  },
};
