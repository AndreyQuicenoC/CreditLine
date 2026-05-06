import apiClient from "../api";
import { logger } from "../../../utils/logger";
import type {
  ClientCreatePayload,
  ClienteDTO,
  ClientUpdatePayload,
  DeudaCreatePayload,
  DeudaDTO,
  OperarioDetailResponse,
  OperarioListResponse,
} from "./types";

const MODULE = "operario/clientesAPI";

function withCount<T>(response: OperarioListResponse<T>) {
  return {
    ...response,
    count: response.count ?? response.data.length,
  };
}

export const clientesAPI = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    municipioId?: string;
    activo?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.pageSize) query.set("page_size", String(params.pageSize));
    if (params?.search) query.set("search", params.search);
    if (params?.municipioId) query.set("municipio_id", params.municipioId);
    if (typeof params?.activo === "boolean")
      query.set("activo", String(params.activo));

    try {
      const response = await apiClient.get<OperarioListResponse<ClienteDTO>>(
        `/api/operario/clientes/${query.toString() ? `?${query.toString()}` : ""}`,
      );
      if (response.error) {
        logger.error(
          MODULE,
          "Failed to fetch clients",
          new Error(response.error),
        );
        return { error: response.error };
      }
      return {
        data: withCount(response.data as OperarioListResponse<ClienteDTO>),
      };
    } catch (error) {
      logger.error(MODULE, "Unexpected error fetching clients", error as Error);
      return { error: "Failed to fetch clients" };
    }
  },

  getById: async (clienteId: string) => {
    try {
      const response = await apiClient.get<
        OperarioDetailResponse<ClienteDTO & { deudas?: DeudaDTO[] }>
      >(`/api/operario/clientes/${clienteId}/`);
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(
        MODULE,
        "Unexpected error fetching client detail",
        error as Error,
      );
      return { error: "Failed to fetch client detail" };
    }
  },

  create: async (payload: ClientCreatePayload) => {
    try {
      const response = await apiClient.post<OperarioDetailResponse<ClienteDTO>>(
        "/api/operario/clientes/",
        payload as unknown as Record<string, unknown>,
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(MODULE, "Unexpected error creating client", error as Error);
      return { error: "Failed to create client" };
    }
  },

  update: async (clienteId: string, payload: ClientUpdatePayload) => {
    try {
      const response = await apiClient.put<OperarioDetailResponse<ClienteDTO>>(
        `/api/operario/clientes/${clienteId}/`,
        payload as unknown as Record<string, unknown>,
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(MODULE, "Unexpected error updating client", error as Error);
      return { error: "Failed to update client" };
    }
  },

  remove: async (clienteId: string) => {
    try {
      const response = await apiClient.delete(
        `/api/operario/clientes/${clienteId}/`,
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(MODULE, "Unexpected error deleting client", error as Error);
      return { error: "Failed to delete client" };
    }
  },

  createDebt: async (
    clienteId: string,
    payload: Omit<DeudaCreatePayload, "cliente_id">,
  ) => {
    try {
      const response = await apiClient.post<OperarioDetailResponse<DeudaDTO>>(
        `/api/operario/clientes/${clienteId}/deudas/`,
        { ...payload, cliente_id: clienteId },
      );
      if (response.error) return { error: response.error };
      return { data: response.data };
    } catch (error) {
      logger.error(MODULE, "Unexpected error creating debt", error as Error);
      return { error: "Failed to create debt" };
    }
  },
};
