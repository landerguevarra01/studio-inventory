// DashboardPage.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import EquipmentTable from "./components/EquipmentTable";
import LogsTable from "./components/LogsTable";
import UsersTable from "./components/UsersTable";
import AssetsTable from "./components/AssetsTable";
import { supabase } from "@/utils/supabase/client";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const MENU_TABS = ["dashboard", "inventory", "suppliers", "reports"];
const INVENTORY_TABS = ["equipment", "logs", "users", "assets"];
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff6666"];

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [activeInventoryTab, setActiveInventoryTab] = useState("equipment");
  const [dashboardClickCount, setDashboardClickCount] = useState(0);
  const [summary, setSummary] = useState({
    equipment: 0,
    logs: 0,
    users: 0,
    assets: 0,
  });

  const reportRef = useRef(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const [eq, lg, us, as] = await Promise.all([
        supabase.from("equipment").select("*", { count: "exact", head: true }),
        supabase.from("logs").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("assets").select("*", { count: "exact", head: true }),
      ]);
      setSummary({
        equipment: eq.count || 0,
        logs: lg.count || 0,
        users: us.count || 0,
        assets: as.count || 0,
      });
    };
    fetchSummary();
  }, [dashboardClickCount]);

  const handleDownload = async () => {
    if (!reportRef.current) return;

    const tables = Array.from(reportRef.current.querySelectorAll("table")); // Get all tables
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const canvas = await html2canvas(table, {
        useCORS: true,
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page (if it's the first table)
      if (i > 0) {
        pdf.addPage(); // Add a new page for the next table
      }

      // Add the current table to the PDF
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // If the content is too long, split into multiple pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }

    pdf.save("full-report.pdf");
  };

  const chartData = Object.entries(summary).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Inventory System</h2>
        <nav className="flex flex-col space-y-2">
          {MENU_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === "dashboard") {
                  setDashboardClickCount((prev) => prev + 1);
                }
                setActiveMenu(tab);
              }}
              className={`text-left px-3 py-2 rounded ${
                activeMenu === tab ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 capitalize">{activeMenu}</h1>

        {activeMenu === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INVENTORY_TABS.map((tab) => (
              <div
                key={tab}
                className="bg-white rounded-lg shadow p-4 border border-gray-200"
              >
                <h2 className="text-lg font-semibold capitalize">{tab}</h2>
                <p className="text-3xl font-bold text-blue-600">
                  {summary[tab] ?? "-"}
                </p>
                <p className="text-sm text-gray-500">Total {tab} entries</p>
              </div>
            ))}
          </div>
        )}

        {activeMenu === "inventory" && (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              {INVENTORY_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveInventoryTab(tab)}
                  className={`px-4 py-2 rounded transition-colors duration-200 ${
                    activeInventoryTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
              {activeInventoryTab === "equipment" && (
                <>
                  <h3 className="text-lg font-bold mb-2">Equipment Table</h3>
                  <EquipmentTable />
                </>
              )}
              {activeInventoryTab === "logs" && (
                <>
                  <h3 className="text-lg font-bold mb-2">Logs Table</h3>
                  <LogsTable />
                </>
              )}
              {activeInventoryTab === "users" && (
                <>
                  <h3 className="text-lg font-bold mb-2">Users Table</h3>
                  <UsersTable />
                </>
              )}
              {activeInventoryTab === "assets" && (
                <>
                  <h3 className="text-lg font-bold mb-2">Assets Table</h3>
                  <AssetsTable />
                </>
              )}
            </div>
          </>
        )}

        {activeMenu === "reports" && (
          <div className="space-y-6">
            <div
              ref={reportRef}
              className="report-wrapper space-y-6 p-4 bg-white rounded shadow border"
            >
              <h2 className="text-xl font-semibold">Summary Reports</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4">
                  <h3 className="font-medium mb-4">Bar Chart</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-4">
                  <h3 className="font-medium mb-4">Pie Chart</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {chartData.map((_, i) => (
                          <Cell
                            key={`cell-${i}`}
                            fill={COLORS[i % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary Text */}
              <ul className="text-gray-800">
                {Object.entries(summary).map(([key, value]) => (
                  <li key={key} className="capitalize">
                    {key}: <strong>{value}</strong>
                  </li>
                ))}
              </ul>

              {/* Tables */}
              <div className="pt-4 space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">Equipment Table</h3>
                  <EquipmentTable />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Logs Table</h3>
                  <LogsTable />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Users Table</h3>
                  <UsersTable />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Assets Table</h3>
                  <AssetsTable />
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
            >
              Download PDF Report
            </button>
          </div>
        )}

        {activeMenu === "suppliers" && (
          <p className="text-gray-500">Suppliers view coming soon...</p>
        )}
      </main>
    </div>
  );
}
