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
import {
  getIndicatorScale,
  getThirdIterationIndicatorDetail,
} from "@/domain/constants";

// Estilos para tooltip rápido
const tooltipStyles = `
  .fast-tooltip {
    position: relative;
  }
  .fast-tooltip[title]:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 0;
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: normal;
    max-width: 300px;
    z-index: 1000;
    margin-bottom: 5px;
    animation: fadeIn 0.15s ease-in;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

interface UserResponse {
  indicatorId: string;
  weight: number;
  excluded: boolean;
  isOriginal: boolean;
}

interface ConsolidatedIndicator {
  indicatorId: string;
  indicatorName: string;
  indicatorDescription: string | null;
  weights: number[];
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
  };
  userResponse: UserResponse;
}

interface ConsolidatedIndicatorsTableProps {
  indicators: Indicator[];
  consolidatedIndicators: ConsolidatedIndicator[];
  userResponses: Record<string, UserResponse>;
  onWeightChange: (indicatorId: string, value: number) => void;
  onWeightInputError: (message: string) => void;
}

export function ConsolidatedIndicatorsTable({
  indicators,
  consolidatedIndicators,
  userResponses,
  onWeightChange,
  onWeightInputError,
}: ConsolidatedIndicatorsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Preparar datos para la tabla
  const { originalIndicators, newIndicators } = useMemo(() => {
    const allData = consolidatedIndicators
      .map((consInd) => {
        const indicator = indicators.find((ind) => ind.id === consInd.indicatorId);
        if (!indicator) return null;

        const userResponse = userResponses[consInd.indicatorId] || {
          indicatorId: consInd.indicatorId,
          weight: 0,
          excluded: false,
          isOriginal: false,
        };

        return {
          indicator,
          consolidatedData: {
            weights: consInd.weights,
            average: consInd.average,
            count: consInd.count,
          },
          userResponse,
        };
      })
      .filter((item): item is TableRow => item !== null);

    const original = allData.filter(item => item.userResponse.isOriginal);
    const newOnes = allData.filter(item => !item.userResponse.isOriginal);

    return { originalIndicators: original, newIndicators: newOnes };
  }, [consolidatedIndicators, indicators, userResponses]);

  // Definir columnas (sin columna de umbral)
  const columns = useMemo<ColumnDef<TableRow>[]>(
    () => [
      {
        id: "detalle",
        header: "Detalle",
        cell: ({ row }) => (
          <button
            onClick={row.getToggleExpandedHandler()}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            {row.getIsExpanded() ? "Ocultar" : "Ver detalle"}
          </button>
        ),
        size: 100,
      },
      {
        accessorKey: "indicator.name",
        header: "Indicador",
        cell: ({ row }) => {
          const indicator = row.original.indicator;
          return (
            <div className="flex items-center gap-2">
              <span
                className="font-medium text-slate-900 text-sm fast-tooltip"
                title={indicator.description || undefined}
              >
                {indicator.name}
                {getIndicatorScale(indicator.name) && (
                  <span className="text-slate-500 font-normal ml-2">
                    ({getIndicatorScale(indicator.name)})
                  </span>
                )}
              </span>
            </div>
          );
        },
        size: 360,
      },
      {
        accessorKey: "userResponse.weight",
        header: "Su Peso",
        cell: ({ row }) => {
          const indicatorId = row.original.indicator.id;
          const weight = row.original.userResponse.weight;

          return (
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={weight === 0 ? "" : Math.round(weight)}
                onChange={(e) => {
                  const rawValue = e.target.value;

                  if (!/^\d*$/.test(rawValue)) {
                    onWeightInputError("Ingrese solo números enteros para el peso.");
                    return;
                  }

                  const value = rawValue === "" ? 0 : Number.parseInt(rawValue, 10);
                  if (value > 100) {
                    onWeightInputError("El peso de un indicador no puede superar 100%.");
                    return;
                  }

                  onWeightChange(indicatorId, value);
                }}
                onKeyDown={(e) => {
                  const allowedControlKeys = [
                    "Backspace",
                    "Delete",
                    "Tab",
                    "ArrowLeft",
                    "ArrowRight",
                    "Home",
                    "End",
                  ];

                  if (
                    e.ctrlKey ||
                    e.metaKey ||
                    allowedControlKeys.includes(e.key)
                  ) {
                    return;
                  }

                  if (!/^\d$/.test(e.key)) {
                    e.preventDefault();
                    onWeightInputError("Ingrese solo números enteros para el peso.");
                  }
                }}
                placeholder="0"
                aria-label={`Peso para ${row.original.indicator.name}`}
                className="w-16 rounded border border-slate-300 px-2 py-1 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-600">%</span>
            </div>
          );
        },
        size: 140,
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
        size: 200,
        sortingFn: "auto",
      },
    ],
    [onWeightChange, onWeightInputError]
  );

  const originalTable = useReactTable({
    data: originalIndicators,
    columns,
    state: { sorting, expanded },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getRowId: (row) => row.indicator.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  const newTable = useReactTable({
    data: newIndicators,
    columns,
    state: { sorting, expanded },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getRowId: (row) => row.indicator.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  return (
    <div className="space-y-6">
      <style>{tooltipStyles}</style>

      {/* Sección de indicadores originales */}
      {originalIndicators.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-blue-900">
              Tus indicadores seleccionados
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                {originalTable.getHeaderGroups().map((headerGroup) => (
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
                {originalTable.getRowModel().rows.map((row) => (
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
        </div>
      )}

      {/* Sección de indicadores nuevos */}
      {newIndicators.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-purple-50 border-b border-purple-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-purple-900">
              Indicadores seleccionados por otros expertos
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                {newTable.getHeaderGroups().map((headerGroup) => (
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
                {newTable.getRowModel().rows.map((row) => (
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
        </div>
      )}

      {originalIndicators.length === 0 && newIndicators.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          No hay indicadores para mostrar
        </div>
      )}
    </div>
  );
}

function IndicatorInfoCard({ indicator }: { indicator: Indicator }) {
  const detail = getThirdIterationIndicatorDetail(indicator.id);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-base text-slate-500">Qué mide</p>
        <p className="mt-1 text-lg text-slate-900">
          {detail?.whatMeasures ||
            indicator.description ||
            "Descripción no registrada para este indicador."}
        </p>
      </div>

      <div className="mt-5">
        <p className="text-base text-slate-500">Cuándo se activa</p>
        <p className="mt-1 text-lg text-slate-900">
          {detail?.whenActivates ||
            "Use este indicador como referencia contextual para valorar si la estrategia responde al riesgo observado en el territorio."}
        </p>
      </div>
    </div>
  );
}

// Componente para el contenido expandido (solo ponderaciones, sin umbrales)
function ExpandedRowContent({ row }: { row: TableRow }) {
  const { consolidatedData } = row;

  return (
    <div className="space-y-4">
      <IndicatorInfoCard indicator={row.indicator} />
      <PonderacionesContent consolidatedData={consolidatedData} />
    </div>
  );
}

function PonderacionesContent({ consolidatedData }: { consolidatedData: TableRow["consolidatedData"] }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-slate-900">
        Ponderaciones individuales de otros expertos ({consolidatedData.count} respuestas)
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
  );
}
