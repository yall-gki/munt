"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus, ChevronDown, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useStrategyStore } from "@/lib/strategyStore";
import { useCoinsData } from "@/hooks/useCoinData";
import { ids } from "@/lib/ids";

const strategyTypes = [
  { value: "HODL", label: "HODL" },
  { value: "DCA", label: "DCA" },
  { value: "SWING", label: "Swing" },
  { value: "REBALANCING", label: "Rebalancing" },
  { value: "STAKING", label: "Staking/Yield" },
  { value: "HISTORICAL_SIMULATION", label: "Historical Simulation" },
  { value: "GRID", label: "Grid" },
  { value: "INDICATOR", label: "Indicator" },
  { value: "MANUAL", label: "Manual" },
  { value: "DCAa", label: "DCA (Legacy)" },
];

const parameterTemplates: Record<string, Record<string, any>> = {
  HODL: { horizonDays: 365 },
  DCA: { amountUsd: 100, intervalDays: 7 },
  SWING: { entryPct: 2, exitPct: 4, stopLossPct: 1 },
  REBALANCING: { driftThresholdPct: 5, targetAllocations: {} },
  STAKING: { apr: 5, compoundsPerYear: 12 },
  HISTORICAL_SIMULATION: { initialUsd: 1000, startDate: "", endDate: "" },
  GRID: { gridCount: 6, gridSpacingPct: 1.5 },
  INDICATOR: { indicator: "RSI", period: 14 },
  MANUAL: { notes: "" },
  DCAa: { amountUsd: 100, intervalDays: 7 },
};

const timeframes = ["1m", "5m", "15m", "1h", "4h", "1d"];

type ParamRow = { key: string; value: string };

const toNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
};

export default function StrategyPanel({ coinId }: { coinId: string }) {
  const { strategies, setStrategies, selectStrategy, selectedStrategyId } =
    useStrategyStore();
  const { data: coinList } = useCoinsData(ids);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "DCA",
    timeframe: "1h",
    isActive: true,
    tradeValue: "",
    maxAllocation: "",
    minTrade: "",
    maxTrade: "",
    minPrice: "",
    maxPrice: "",
    maxOpenTrades: "",
    stopLossPct: "",
    takeProfitPct: "",
    notExceedBalance: true,
  });
  const [selectedCoins, setSelectedCoins] = useState<string[]>(
    coinId ? [coinId] : []
  );
  const [parametersJson, setParametersJson] = useState(
    JSON.stringify(parameterTemplates.DCA, null, 2)
  );
  const [params, setParams] = useState<ParamRow[]>([]);

  const settingsObject = useMemo(() => {
    const customParams = params.reduce<Record<string, string>>((acc, row) => {
      if (row.key.trim().length === 0) return acc;
      acc[row.key.trim()] = row.value;
      return acc;
    }, {});
    const settings: Record<string, unknown> = {
      tradeValue: toNumber(form.tradeValue),
      maxAllocation: toNumber(form.maxAllocation),
      minTrade: toNumber(form.minTrade),
      maxTrade: toNumber(form.maxTrade),
      minPrice: toNumber(form.minPrice),
      maxPrice: toNumber(form.maxPrice),
      maxOpenTrades: toNumber(form.maxOpenTrades),
      stopLossPct: toNumber(form.stopLossPct),
      takeProfitPct: toNumber(form.takeProfitPct),
      notExceedBalance: form.notExceedBalance,
      params: customParams,
    };

    Object.keys(settings).forEach((key) => {
      const value = settings[key];
      if (value === undefined || value === "" || value === null) {
        delete settings[key];
      }
      if (key === "params" && Object.keys(customParams).length === 0) {
        delete settings[key];
      }
    });

    return settings;
  }, [params, form]);

  const coinOptions = useMemo(() => {
    if (!Array.isArray(coinList)) return [];
    return coinList.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
    }));
  }, [coinList]);

  useEffect(() => {
    if (!selectedCoins.length && coinId) {
      setSelectedCoins([coinId]);
    }
  }, [coinId, selectedCoins.length]);

  useEffect(() => {
    if (editingId) return;
    const template = parameterTemplates[form.type] ?? {};
    setParametersJson(JSON.stringify(template, null, 2));
  }, [form.type, editingId]);

  const toggleCoin = (id: string) => {
    setSelectedCoins((prev) =>
      prev.includes(id) ? prev.filter((coin) => coin !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const res = await axios.get(`/api/strategies?coinId=${coinId}`);
        setStrategies(res.data?.strategies ?? []);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.error || "Failed to load strategies"
        );
      }
    };
    fetchStrategies();
  }, [coinId, setStrategies]);

  const handleAddParam = () => {
    setParams((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleParamChange = (index: number, field: "key" | "value", value: string) => {
    setParams((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const isPositiveNumber = (value: any) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0;

  const validateParameters = (type: string, params: Record<string, any>) => {
    const errors: string[] = [];
    if (type === "DCA") {
      if (!isPositiveNumber(params.amountUsd)) errors.push("amountUsd");
      if (!isPositiveNumber(params.intervalDays)) errors.push("intervalDays");
    }
    if (type === "SWING") {
      if (!isPositiveNumber(params.entryPct)) errors.push("entryPct");
      if (!isPositiveNumber(params.exitPct)) errors.push("exitPct");
    }
    if (type === "REBALANCING") {
      if (!isPositiveNumber(params.driftThresholdPct)) {
        errors.push("driftThresholdPct");
      }
    }
    if (type === "STAKING") {
      if (!isPositiveNumber(params.apr)) errors.push("apr");
    }
    if (type === "HISTORICAL_SIMULATION") {
      if (!isPositiveNumber(params.initialUsd)) errors.push("initialUsd");
    }
    return errors;
  };

  const parseParameters = () => {
    if (!parametersJson.trim()) return {};
    try {
      const parsed = JSON.parse(parametersJson);
      if (parsed && typeof parsed === "object") return parsed;
      return {};
    } catch {
      throw new Error("Invalid JSON");
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Strategy name is required");
      return;
    }
    if (selectedCoins.length === 0) {
      toast.error("Select at least one coin");
      return;
    }
    const tradeValue = toNumber(form.tradeValue);
    const minTrade = toNumber(form.minTrade);
    const maxTrade = toNumber(form.maxTrade);
    const minPrice = toNumber(form.minPrice);
    const maxPrice = toNumber(form.maxPrice);
    const maxAllocation = toNumber(form.maxAllocation);
    const maxOpenTrades = toNumber(form.maxOpenTrades);
    const stopLossPct = toNumber(form.stopLossPct);
    const takeProfitPct = toNumber(form.takeProfitPct);

    if (
      [tradeValue, minTrade, maxTrade, minPrice, maxPrice, maxAllocation, maxOpenTrades, stopLossPct, takeProfitPct].some(
        (value) => value !== undefined && value < 0
      )
    ) {
      toast.error("Values must be positive numbers");
      return;
    }

    if (minTrade !== undefined && maxTrade !== undefined && minTrade > maxTrade) {
      toast.error("Min trade cannot exceed max trade");
      return;
    }

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      toast.error("Min price cannot exceed max price");
      return;
    }

    if (
      tradeValue !== undefined &&
      maxTrade !== undefined &&
      tradeValue > maxTrade
    ) {
      toast.error("Trade value cannot exceed max trade");
      return;
    }

    if (
      tradeValue !== undefined &&
      minTrade !== undefined &&
      tradeValue < minTrade
    ) {
      toast.error("Trade value cannot be below min trade");
      return;
    }
    let parsedParameters: Record<string, any> = {};
    try {
      parsedParameters = parseParameters();
    } catch {
      toast.error("Parameters JSON is invalid");
      return;
    }
    const paramErrors = validateParameters(form.type, parsedParameters);
    if (paramErrors.length > 0) {
      toast.error(`Missing/invalid: ${paramErrors.join(", ")}`);
      return;
    }

    setLoading(true);
    try {
    const enrichedParameters = {
      ...parsedParameters,
      coinIds: selectedCoins,
    };

    const settingsPayload =
      Object.keys(settingsObject).length > 0 ? settingsObject : undefined;
    const payload = {
      name: form.name.trim(),
      type: form.type,
      coinIds: selectedCoins,
      timeframe: form.timeframe,
      isActive: form.isActive,
      settings: settingsPayload,
      parameters: enrichedParameters,
    };

      if (editingId) {
        const res = await axios.patch("/api/strategies", {
          id: editingId,
          ...payload,
        });
        const updated = res.data?.strategy;
        const next = strategies.map((s) => (s.id === updated.id ? updated : s));
        setStrategies(next);
        selectStrategy(updated.id);
        toast.success("Strategy updated");
      } else {
        const res = await axios.post("/api/strategies", payload);
        const next = [res.data.strategy, ...strategies];
        setStrategies(next);
        selectStrategy(res.data.strategy.id);
        toast.success("Strategy created");
      }

      setForm({
        name: "",
        type: "DCA",
        timeframe: "1h",
        isActive: true,
        tradeValue: "",
        maxAllocation: "",
        minTrade: "",
        maxTrade: "",
        minPrice: "",
        maxPrice: "",
        maxOpenTrades: "",
        stopLossPct: "",
        takeProfitPct: "",
        notExceedBalance: true,
      });
      setParams([]);
      setSelectedCoins(coinId ? [coinId] : []);
      setParametersJson(JSON.stringify(parameterTemplates.DCA, null, 2));
      setEditingId(null);
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to save strategy");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (strategyId: string) => {
    const strategy = strategies.find((item) => item.id === strategyId);
    if (!strategy) return;
    setEditingId(strategyId);
    setIsOpen(true);
    setForm((prev) => ({
      ...prev,
      name: strategy.name || "",
      type: strategy.type || "DCA",
      timeframe: strategy.timeframe || "1h",
      isActive: strategy.isActive ?? true,
    }));
    const parameters = strategy.parameters || {};
    setParametersJson(JSON.stringify(parameters, null, 2));
    const storedCoins =
      Array.isArray(parameters.coinIds) && parameters.coinIds.length > 0
        ? parameters.coinIds
        : Array.isArray(strategy.coinIds) && strategy.coinIds.length > 0
        ? strategy.coinIds
        : strategy.coinId
        ? [strategy.coinId]
        : [];
    setSelectedCoins(storedCoins);
  };

  const handleDelete = async (strategyId: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/strategies?id=${strategyId}`);
      const next = strategies.filter((item) => item.id !== strategyId);
      setStrategies(next);
      if (selectedStrategyId === strategyId) {
        selectStrategy(null);
      }
      toast.success("Strategy deleted");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to delete strategy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Strategy
          </p>
          <p className="text-sm text-zinc-200 font-semibold">
            Create and attach a strategy to trades
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setEditingId(null);
            setIsOpen((prev) => !prev);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Strategy
        </Button>
      </div>

      <div className="space-y-3">
        {strategies.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No strategies yet. Create one to link trades.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => selectStrategy(null)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold border",
                  selectedStrategyId
                    ? "border-zinc-700 text-zinc-300"
                    : "border-blue-500 text-blue-300"
                )}
              >
                No strategy
              </button>
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => selectStrategy(strategy.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold border",
                    selectedStrategyId === strategy.id
                      ? "border-blue-500 text-blue-300"
                      : "border-zinc-700 text-zinc-300"
                  )}
                >
                  {strategy.name}
                </button>
              ))}
            </div>
            {selectedStrategyId && (
              <div className="flex items-center gap-2">
                <Button
                  variant="subtle"
                  onClick={() => handleEdit(selectedStrategyId)}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(selectedStrategyId)}
                  className="flex items-center gap-2 text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {isOpen && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Strategy name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <div className="relative">
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
              >
                {strategyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-zinc-500" />
            </div>
            <div className="relative">
              <select
                value={form.timeframe}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, timeframe: e.target.value }))
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
              >
                {timeframes.map((frame) => (
                  <option key={frame} value={frame}>
                    {frame}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-zinc-500" />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800"
              />
              Active
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Coins
            </p>
            {coinOptions.length === 0 ? (
              <p className="text-xs text-zinc-400">Loading coins...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {coinOptions.map((coin) => {
                  const active = selectedCoins.includes(coin.id);
                  return (
                    <button
                      key={coin.id}
                      type="button"
                      onClick={() => toggleCoin(coin.id)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold border transition",
                        active
                          ? "border-blue-500 text-blue-200 bg-blue-500/10"
                          : "border-zinc-700 text-zinc-300 hover:text-white"
                      )}
                    >
                      {coin.symbol.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Parameters (JSON)
            </p>
            <textarea
              value={parametersJson}
              onChange={(e) => setParametersJson(e.target.value)}
              rows={6}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-xs font-mono text-zinc-200"
            />
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Templates update with strategy type.</span>
              <button
                type="button"
                onClick={() =>
                  setParametersJson(
                    JSON.stringify(parameterTemplates[form.type] ?? {}, null, 2)
                  )
                }
                className="text-blue-300 hover:text-blue-200"
              >
                Reset template
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Risk & Limits
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Trade value (USD)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 150"
                  value={form.tradeValue}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tradeValue: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Max allocation (USD)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Not exceeding"
                  value={form.maxAllocation}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      maxAllocation: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Min trade (USD)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Minimum order size"
                  value={form.minTrade}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, minTrade: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Max trade (USD)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Maximum order size"
                  value={form.maxTrade}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maxTrade: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Min price</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional floor"
                  value={form.minPrice}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, minPrice: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Max price</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional ceiling"
                  value={form.maxPrice}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maxPrice: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Max open trades</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 3"
                  value={form.maxOpenTrades}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      maxOpenTrades: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Stop loss (%)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 2"
                  value={form.stopLossPct}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, stopLossPct: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Take profit (%)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 5"
                  value={form.takeProfitPct}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      takeProfitPct: e.target.value,
                    }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-300 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.notExceedBalance}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      notExceedBalance: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800"
                />
                Do not exceed available balance
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Parameters
            </p>
            {params.map((row, idx) => (
              <div key={`${row.key}-${idx}`} className="flex gap-2">
                <Input
                  placeholder="Key (e.g. rsiPeriod)"
                  value={row.key}
                  onChange={(e) => handleParamChange(idx, "key", e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) =>
                    handleParamChange(idx, "value", e.target.value)
                  }
                />
              </div>
            ))}
            <Button variant="subtle" onClick={handleAddParam}>
              Add parameter
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : editingId ? (
                "Update strategy"
              ) : (
                "Create strategy"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                setEditingId(null);
              }}
              className="text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
