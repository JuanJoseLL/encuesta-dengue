"use client";

import { Fragment, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ExpandedState,
} from "@tanstack/react-table";
import type { Indicator } from "@/domain/models";
import { getIndicatorScale } from "@/domain/constants";

interface UserResponse {
  indicatorId: string;
  weight: number;
  threshold: string | null;
  excluded: boolean;
  isOriginal: boolean;
}

interface ConsolidatedIndicator {
  indicatorId: string;
  indicatorName: string;
  indicatorDescription: string | null;
  weights: number[];
  thresholds: string[];
  average: number;
  count: number;
  totalRespondents: number;
}

interface TableRow {
  indicator: Indicator;
  consolidatedData: {
    weights: number[];
    average: number;
    count: number;
    thresholds: string[];
  };
  userResponse: UserResponse;
}

interface ConsolidatedIndicatorsTableProps {
  indicators: Indicator[];
  consolidatedIndicators: ConsolidatedIndicator[];
  userResponses: Record<string, UserResponse>;
  onWeightChange: (indicatorId: string, value: number) => void;
  onThresholdChange: (indicatorId: string, value: string) => void;
  allUserResponses: Record<string, UserResponse>;
}

export function ConsolidatedIndicatorsTable({
  indicators,
  consolidatedIndicators,
  userResponses,
  onWeightChange,
  onThresholdChange,
  allUserResponses,
}: ConsolidatedIndicatorsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Preparar datos para la tabla
  const tableData = useMemo<TableRow[]>(() => {
    return consolidatedIndicators
      .map((consInd) => {
        const indicator = indicators.find((ind) => ind.id === consInd.indicatorId);
        if (!indicator) return null;

        const userResponse = userResponses[consInd.indicatorId] || {
          indicatorId: consInd.indicatorId,
          weight: 0,
          threshold: null,
          excluded: false,
          isOriginal: false,
        };

        return {
          indicator,
          consolidatedData: {
            weights: consInd.weights,
            average: consInd.average,
            count: consInd.count,
            thresholds: consInd.thresholds,
          },
          userResponse,
        };
      })
      .filter((item): item is TableRow => item !== null)
      .sort((a, b) => {
        // Ordenar: primero los originales del usuario
        if (a.userResponse.isOriginal === b.userResponse.isOriginal) {
          return 0;
        }
        return a.userResponse.isOriginal ? -1 : 1;
      });
  }, [consolidatedIndicators, indicators, userResponses]);

  // Definir columnas
  const columns = useMemo<ColumnDef<TableRow>[]>(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="cursor-pointer p-1 hover:bg-slate-100 rounded"
              aria-label={row.getIsExpanded() ? "Colapsar" : "Expandir"}
            >
              <svg
                className={`w-4 h-4 text-slate-600 transition-transform ${
                  row.getIsExpanded() ? "rotate-90" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : null;
        },
        size: 40,
      },
      {
        accessorKey: "indicator.name",
        header: "Indicador",
        cell: ({ row }) => {
          const indicator = row.original.indicator;
          const isOriginal = row.original.userResponse.isOriginal;
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 text-sm">
                  {indicator.name}
                </span>
                {!isOriginal && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 whitespace-nowrap">
                    Nuevo
                  </span>
                )}
              </div>
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: "userResponse.weight",
        header: "Tu Peso",
        cell: ({ row }) => {
          const indicatorId = row.original.indicator.id;
          const weight = row.original.userResponse.weight;

          // Calcular el máximo permitido
          const othersTotal = Object.entries(allUserResponses).reduce(
            (sum, [id, response]) => {
              if (id === indicatorId || response.excluded) {
                return sum;
              }
              return sum + response.weight;
            },
            0
          );
          const maxAllowed = Math.max(0, 100 - othersTotal);

          return (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={weight === 0 ? "" : Math.round(weight)}
                onChange={(e) => {
                  const value = Math.round(Number.parseFloat(e.target.value) || 0);
                  const clampedValue = Math.min(value, maxAllowed);
                  onWeightChange(indicatorId, clampedValue);
                }}
                onKeyDown={(e) => {
                  if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="0"
                className="w-16 rounded border border-slate-300 px-2 py-1 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-600">%</span>
            </div>
          );
        },
        size: 120,
        sortingFn: "auto",
      },
      {
        accessorKey: "consolidatedData.average",
        header: "Promedio Grupo",
        cell: ({ row }) => {
          const average = row.original.consolidatedData.average;
          const userWeight = row.original.userResponse.weight;
          const diff = userWeight - average;

          return (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-green-700">
                {average.toFixed(1)}%
              </span>
              {Math.abs(diff) > 0.1 && (
                <span
                  className={`text-xs ${
                    diff > 0 ? "text-blue-600" : "text-amber-600"
                  }`}
                >
                  ({diff > 0 ? "+" : ""}
                  {diff.toFixed(1)})
                </span>
              )}
            </div>
          );
        },
        size: 150,
        sortingFn: "auto",
      },
      {
        id: "groupWeights",
        header: "Pesos Grupo",
        cell: ({ row }) => {
          const weights = row.original.consolidatedData.weights;
          const count = row.original.consolidatedData.count;
          return (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              Ver ({count})
            </button>
          );
        },
        size: 120,
      },
      {
        accessorKey: "userResponse.threshold",
        header: "Tu Umbral",
        cell: ({ row }) => {
          const indicatorId = row.original.indicator.id;
          const threshold = row.original.userResponse.threshold;
          const indicatorName = row.original.indicator.name;
          const scale = getIndicatorScale(indicatorName);

          return (
            <input
              type="text"
              value={threshold || ""}
              onChange={(e) => onThresholdChange(indicatorId, e.target.value)}
              placeholder={scale || "Ingrese umbral"}
              maxLength={90}
              className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          );
        },
        size: 200,
      },
    ],
    [allUserResponses, onWeightChange, onThresholdChange]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-2 hover:text-slate-900"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-slate-400">
                            {{
                              asc: "↑",
                              desc: "↓",
                            }[header.column.getIsSorted() as string] ?? "↕"}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200">
            {table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <tr className="hover:bg-slate-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-slate-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
                {row.getIsExpanded() && (
                  <tr>
                    <td colSpan={columns.length} className="bg-blue-50 px-4 py-4">
                      <ExpandedRowContent row={row.original} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {tableData.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          No hay indicadores para mostrar
        </div>
      )}
    </div>
  );
}

// Componente para el contenido expandido
function ExpandedRowContent({ row }: { row: TableRow }) {
  const { indicator, consolidatedData, userResponse } = row;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Descripción del indicador */}
      {indicator.description && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-900">Descripción</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {indicator.description}
          </p>
        </div>
      )}

      {/* Ponderaciones individuales */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-900">
          Ponderaciones individuales de otros expertos
        </h4>
        <div className="flex flex-wrap gap-2">
          {consolidatedData.weights.map((weight, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium text-sm"
            >
              {weight}%
            </span>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-blue-200">
          <span className="text-sm text-slate-600">
            Promedio: <strong className="text-green-700">{consolidatedData.average.toFixed(2)}%</strong>
          </span>
        </div>
      </div>

      {/* Umbrales propuestos */}
      {consolidatedData.thresholds.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-900">
            Umbrales propuestos por otros expertos
          </h4>
          <div className="flex flex-wrap gap-2">
            {consolidatedData.thresholds.map((threshold, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-medium text-sm"
              >
                {threshold}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Escala del indicador */}
      {getIndicatorScale(indicator.name) && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-900">
            Escala del indicador
          </h4>
          <p className="text-sm text-slate-600">
            {getIndicatorScale(indicator.name)}
          </p>
        </div>
      )}
    </div>
  );
}
