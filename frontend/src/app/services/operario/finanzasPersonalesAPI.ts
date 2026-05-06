import apiClient from "../api";
import { logger } from "../../../utils/logger";
import type {
  DeudaPersonalCreatePayload,
  DeudaPersonalDTO,
  OperarioDetailResponse,
  OperarioListResponse,
  PagoPersonalCreatePayload,
  PersonalFinanceSummaryDTO,
} from "./types";

const MODULE = "operario/finanzasPersonalesAPI";

function withCount<T>(response: OperarioListResponse<T>) {
  return {
    ...response,
    count: response.count ?? response.data.length,
  };
}

export const finanzasPersonalesAPI = {
  getSummary: async () => {
    try {
      const response = await apiClient.get<
        OperarioDetailResponse<PersonalFinanceSummaryDTO>
      >("/api/operario/finanzas-personales/summary/");
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error fetching personal finance summary",
        error as Error,
      );
      return { error: "Failed to fetch personal finance summary" };
    }
  },

  list: async (params?: {
    page?: number;
    pageSize?: number;
    estado?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("page_size", String(params.pageSize));
    if (params?.estado) query.set("estado", params.estado);

    try {
      const response = await apiClient.get<
        OperarioListResponse<DeudaPersonalDTO>
      >(
        `/api/operario/finanzas-personales/deudas/${query.toString() ? `?${query.toString()}` : ""}`,
      );
      if (response.error) return { error: response.error };
      return {
        data: withCount(
          response.data as OperarioListResponse<DeudaPersonalDTO>,
        ),
      };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error fetching personal debts",
        error as Error,
      );
      return { error: "Failed to fetch personal debts" };
    }
  },

  getById: async (deudaId: string) => {
    try {
      const response = await apiClient.get<
        OperarioDetailResponse<DeudaPersonalDTO>
      >(`/api/operario/finanzas-personales/deudas/${deudaId}/`);
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error fetching personal debt detail",
        error as Error,
      );
      return { error: "Failed to fetch personal debt detail" };
    }
  },

  create: async (payload: DeudaPersonalCreatePayload) => {
    try {
      const response = await apiClient.post<
        OperarioDetailResponse<DeudaPersonalDTO>
      >("/api/operario/finanzas-personales/deudas/", payload);
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error creating personal debt",
        error as Error,
      );
      return { error: "Failed to create personal debt" };
    }
  },

  update: async (
    deudaId: string,
    payload: Partial<DeudaPersonalCreatePayload>,
  ) => {
    try {
      const response = await apiClient.put<
        OperarioDetailResponse<DeudaPersonalDTO>
      >(`/api/operario/finanzas-personales/deudas/${deudaId}/`, payload);
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error updating personal debt",
        error as Error,
      );
      return { error: "Failed to update personal debt" };
    }
  },

  remove: async (deudaId: string) => {
    try {
      const response = await apiClient.delete(
        `/api/operario/finanzas-personales/deudas/${deudaId}/`,
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error deleting personal debt",
        error as Error,
      );
      return { error: "Failed to delete personal debt" };
    }
  },

  createPayment: async (
    deudaId: string,
    payload: PagoPersonalCreatePayload,
  ) => {
    try {
      const response = await apiClient.post<OperarioDetailResponse<unknown>>(
        `/api/operario/finanzas-personales/deudas/${deudaId}/pagos/`,
        payload,
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error creating personal payment",
        error as Error,
      );
      return { error: "Failed to create personal payment" };
    }
  },

  updatePayment: async (
    deudaId: string,
    pagoId: string,
    payload: PagoPersonalCreatePayload,
  ) => {
    try {
      const response = await apiClient.put<
        OperarioDetailResponse<DeudaPersonalDTO>
      >(
        `/api/operario/finanzas-personales/deudas/${deudaId}/pagos/${pagoId}/`,
        payload,
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error updating personal payment",
        error as Error,
      );
      return { error: "Failed to update personal payment" };
    }
  },

  deletePayment: async (deudaId: string, pagoId: string) => {
    try {
      const response = await apiClient.delete<
        OperarioDetailResponse<DeudaPersonalDTO>
      >(`/api/operario/finanzas-personales/deudas/${deudaId}/pagos/${pagoId}/`);
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error deleting personal payment",
        error as Error,
      );
      return { error: "Failed to delete personal payment" };
    }
  },
};
