import { useCallback, useEffect, useState, useRef } from "react";
import { logger } from "../../../utils/logger";
import { clientesAPI } from "./clientesAPI";
import { deudasAPI } from "./deudasAPI";
import { estadisticasAPI } from "./estadisticasAPI";
import { finanzasPersonalesAPI } from "./finanzasPersonalesAPI";
import { municipiosAPI } from "./municipiosAPI";
import {
  toClienteView,
  toDeudaPersonalView,
  toDeudaView,
  toMunicipioView,
} from "./adapters";
import type {
  DashboardStatsDTO,
  MunicipioStatsDTO,
  DeudaStatusStatsDTO,
  PersonalFinanceSummaryDTO,
} from "./types";
import type {
  ClienteView,
  DeudaPersonalView,
  DeudaView,
  MunicipioView,
} from "./adapters";

const MODULE = "operario/useOperarioData";

export function useOperarioData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [municipios, setMunicipios] = useState<MunicipioView[]>([]);
  const [clientes, setClientes] = useState<ClienteView[]>([]);
  const [deudas, setDeudas] = useState<DeudaView[]>([]);
  const [deudasPersonales, setDeudasPersonales] = useState<DeudaPersonalView[]>(
    [],
  );
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStatsDTO | null>(null);
  const [municipioStats, setMunicipioStats] = useState<MunicipioStatsDTO[]>([]);
  const [deudaStats, setDeudaStats] = useState<DeudaStatusStatsDTO | null>(
    null,
  );
  const [personalSummary, setPersonalSummary] =
    useState<PersonalFinanceSummaryDTO | null>(null);

  const heavyInFlight = useRef(false);
  const hasLoadedOnce = useRef(false);
  const municipiosRef = useRef<MunicipioView[]>([]);

  useEffect(() => {
    municipiosRef.current = municipios;
  }, [municipios]);

  // Two-phase loading: fast endpoints first (renderable data), heavy endpoints later
  const loadFast = useCallback(async () => {
    if (!hasLoadedOnce.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const [
        municipiosRes,
        dashboardRes,
        municipioStatsRes,
        deudaStatsRes,
        personalSummaryRes,
      ] = await Promise.all([
        municipiosAPI.list(false),
        estadisticasAPI.getDashboard(),
        estadisticasAPI.getMunicipios(),
        estadisticasAPI.getDeudas(),
        finanzasPersonalesAPI.getSummary(),
      ]);

      const municipiosData = municipiosRes?.data?.data ?? [];

      if (!municipiosRes?.error) setMunicipios(municipiosData.map(toMunicipioView));
      if (!dashboardRes?.error) setDashboardStats(dashboardRes.data?.data ?? null);
      if (!municipioStatsRes?.error) setMunicipioStats(municipioStatsRes.data?.data ?? []);
      if (!deudaStatsRes?.error) setDeudaStats(deudaStatsRes.data?.data ?? null);
      if (!personalSummaryRes?.error)
        setPersonalSummary(personalSummaryRes.data?.data ?? null);
      hasLoadedOnce.current = true;
    } catch (err) {
      logger.error(MODULE, "Fast load failed", err as Error);
      setError(err instanceof Error ? err.message : "Fast load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHeavy = useCallback(async () => {
    // Prevent concurrent heavy loads (React StrictMode may double-invoke effects)
    if (heavyInFlight.current) return;
    heavyInFlight.current = true;
    try {
      // Use a smaller page size to avoid huge responses; adjust if needed.
      const [clientesRes, deudasRes, deudasPersonalesRes] = await Promise.allSettled([
        clientesAPI.list({ pageSize: 1000, activo: true }),
        deudasAPI.list({ pageSize: 1000 }),
        finanzasPersonalesAPI.list({ pageSize: 1000 }),
      ]);

      const clientesVal = clientesRes.status === "fulfilled" ? clientesRes.value : { error: clientesRes.reason instanceof Error ? clientesRes.reason.message : "Request failed" };
      const deudasVal = deudasRes.status === "fulfilled" ? deudasRes.value : { error: deudasRes.reason instanceof Error ? deudasRes.reason.message : "Request failed" };
      const deudasPersonalesVal = deudasPersonalesRes.status === "fulfilled" ? deudasPersonalesRes.value : { error: deudasPersonalesRes.reason instanceof Error ? deudasPersonalesRes.reason.message : "Request failed" };

      const currentMunicipios = municipiosRef.current;
      const deudasData = !deudasVal?.error ? deudasVal.data?.data ?? [] : [];

      if (!clientesVal?.error)
        setClientes(
          (clientesVal.data?.data ?? []).map((cliente) =>
            toClienteView(cliente, currentMunicipios, deudasData),
          ),
        );
      if (!deudasVal?.error) setDeudas(deudasData.map(toDeudaView));
      if (!deudasPersonalesVal?.error)
        setDeudasPersonales((deudasPersonalesVal.data?.data ?? []).map(toDeudaPersonalView));
    } catch (err) {
      logger.error(MODULE, "Heavy load failed", err as Error);
    } finally {
      setLoading(false);
      heavyInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    // First load fast endpoints to render main UI, then start heavy load in background.
    void (async () => {
      await loadFast();
      void loadHeavy();
    })();
  }, [loadFast, loadHeavy]);

  const loadAll = useCallback(async () => {
    await loadFast();
    await loadHeavy();
  }, [loadFast, loadHeavy]);

  const refreshMunicipios = useCallback(async () => {
    await loadFast();
  }, [loadFast]);

  const refreshClientes = useCallback(async () => {
    await loadHeavy();
  }, [loadHeavy]);

  const refreshDeudas = useCallback(async () => {
    await loadHeavy();
  }, [loadHeavy]);

  const refreshDeudasPersonales = useCallback(async () => {
    await loadHeavy();
  }, [loadHeavy]);

  const refreshStats = useCallback(async () => {
    const [dashboardRes, municipioStatsRes, deudaStatsRes, personalSummaryRes] =
      await Promise.all([
        estadisticasAPI.getDashboard(),
        estadisticasAPI.getMunicipios(),
        estadisticasAPI.getDeudas(),
        finanzasPersonalesAPI.getSummary(),
      ]);
    if (!dashboardRes.error) setDashboardStats(dashboardRes.data?.data ?? null);
    if (!municipioStatsRes.error)
      setMunicipioStats(municipioStatsRes.data?.data ?? []);
    if (!deudaStatsRes.error) setDeudaStats(deudaStatsRes.data?.data ?? null);
    if (!personalSummaryRes.error)
      setPersonalSummary(personalSummaryRes.data?.data ?? null);
    return {
      dashboardRes,
      municipioStatsRes,
      deudaStatsRes,
      personalSummaryRes,
    };
  }, []);

  return {
    loading,
    error,
    municipios,
    clientes,
    deudas,
    deudasPersonales,
    dashboardStats,
    municipioStats,
    deudaStats,
    personalSummary,
    loadAll,
    refreshMunicipios,
    refreshClientes,
    refreshDeudas,
    refreshDeudasPersonales,
    refreshStats,
    setMunicipios,
    setClientes,
    setDeudas,
    setDeudasPersonales,
  };
}
