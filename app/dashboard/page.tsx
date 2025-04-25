"use client";

import { useEffect, useState } from "react";
import EquipmentTable from "./components/EquipmentTable";
import LogsTable from "./components/LogsTable";
import UsersTable from "./components/UsersTable";
import { supabase } from "@/utils/supabase/client";

const MENU_TABS = ["dashboard", "inventory", "suppliers"];
const INVENTORY_TABS = ["equipment", "logs", "users"];

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [activeInventoryTab, setActiveInventoryTab] = useState("equipment");
  const [dashboardClickCount, setDashboardClickCount] = useState(0);
  const [summary, setSummary] = useState({
    equipment: 0,
    logs: 0,
    users: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      const [eq, lg, us] = await Promise.all([
        supabase.from("equipment").select("*", { count: "exact", head: true }),
        supabase.from("logs").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }),
      ]);
      setSummary({
        equipment: eq.count || 0,
        logs: lg.count || 0,
        users: us.count || 0,
      });
    };
    fetchSummary();
  }, [dashboardClickCount]);

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

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 capitalize">{activeMenu}</h1>

        {/* Dashboard Summary */}
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

        {/* Inventory View */}
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
            </div>
          </>
        )}

        {/* Suppliers Placeholder */}
        {activeMenu === "suppliers" && (
          <p className="text-gray-500">Suppliers view coming soon...</p>
        )}
      </main>
    </div>
  );
}
