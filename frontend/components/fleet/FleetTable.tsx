"use client";

import Link from "next/link";
import type { FleetSummaryRow } from "@/lib/types";
import { Plane, FileText, AlertTriangle, Gauge, ArrowRight } from "lucide-react";

interface FleetTableProps {
    data: FleetSummaryRow[];
}

function getSeverityIndicator(findingCount: number) {
    if (findingCount === 0) return "fleet-table__severity--clear";
    if (findingCount <= 2) return "fleet-table__severity--advisory";
    if (findingCount <= 5) return "fleet-table__severity--flag";
    return "fleet-table__severity--stop";
}

export default function FleetTable({ data }: FleetTableProps) {
    return (
        <div className="fleet-table-wrapper">
            <table className="fleet-table" id="fleet-table">
                <thead>
                    <tr>
                        <th>Case ID</th>
                        <th>Registration</th>
                        <th>Aircraft Type</th>
                        <th>Engine Type</th>
                        <th>
                            <div className="fleet-table__th-icon">
                                <FileText size={13} /> Docs
                            </div>
                        </th>
                        <th>
                            <div className="fleet-table__th-icon">
                                <AlertTriangle size={13} /> Findings
                            </div>
                        </th>
                        <th>
                            <div className="fleet-table__th-icon">
                                <Gauge size={13} /> Metrics
                            </div>
                        </th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.case_id} className="fleet-table__row">
                            <td>
                                <Link
                                    href={`/cases/${row.case_id}`}
                                    className="fleet-table__case-link"
                                >
                                    {row.case_id}
                                </Link>
                            </td>
                            <td>
                                <div className="fleet-table__reg">
                                    <Plane size={14} style={{ color: "#1e4d8a" }} />
                                    <span style={{ fontWeight: 600, color: "#1a2233" }}>{row.registration}</span>
                                </div>
                            </td>
                            <td style={{ color: "#334155" }}>{row.aircraft_type}</td>
                            <td style={{ color: "#64748b" }}>{row.engine_type}</td>
                            <td>
                                <span className="fleet-table__count">{row.doc_count}</span>
                            </td>
                            <td>
                                <span
                                    className={`fleet-table__count ${getSeverityIndicator(
                                        row.finding_count
                                    )}`}
                                >
                                    {row.finding_count}
                                </span>
                            </td>
                            <td>
                                <span className="fleet-table__count">
                                    {row.engine_metric_count}
                                </span>
                            </td>
                            <td>
                                <Link
                                    href={`/cases/${row.case_id}`}
                                    className="fleet-table__view-btn"
                                >
                                    <ArrowRight size={16} />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
