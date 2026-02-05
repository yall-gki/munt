"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useStrategyStore } from "@/lib/strategyStore";

const strategyTypes = [
  { value: "INDICATOR", label: "Indicator" },
  { value: "GRID", label: "Grid" },
  { value: "DCAa", label: "DCA" },
  { value: "MANUAL", label: "Manual" },
];

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
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "INDICATOR",
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
  const [params, setParams] = useState<ParamRow[]>([
    { key: "period", value: "14" },
  ]);

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

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("Strategy name is required");
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
    setLoading(true);
    try {
      const res = await axios.post("/api/strategies", {
        name: form.name.trim(),
        type: form.type,
        coinId,
        timeframe: form.timeframe,
        isActive: form.isActive,
        settings: settingsObject,
      });

      const next = [res.data.strategy, ...strategies];
      setStrategies(next);
      selectStrategy(res.data.strategy.id);
      setForm({
        name: "",
        type: "INDICATOR",
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
      setParams([{ key: "period", value: "14" }]);
      setIsOpen(false);
      toast.success("Strategy created");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to create strategy");
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
          onClick={() => setIsOpen((prev) => !prev)}
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
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create strategy"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
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
