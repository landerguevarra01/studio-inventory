"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/utils/supabase/client";

function ReportsSection() {
  const [equipment, setEquipment] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [eq, lg, us, as] = await Promise.all([
        supabase.from("equipment").select("*"),
        supabase.from("logs").select("*"),
        supabase.from("users").select("*"),
        supabase.from("assets").select("*"),
      ]);
      setEquipment(eq.data || []);
      setLogs(lg.data || []);
      setUsers(us.data || []);
      setAssets(as.data || []);
    };
    fetchAll();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
    doc.setFontSize(16);
    doc.text("Inventory Summary Report", 40, 30);

    const addTable = (title, data) => {
      if (data.length === 0) return;
      const headers = [Object.keys(data[0])];
      const rows = data.map((row) => headers[0].map((key) => String(row[key])));
      doc.addPage();
      doc.setFontSize(14);
      doc.text(title, 40, 40);
      autoTable(doc, {
        startY: 60,
        head: headers,
        body: rows,
        styles: { fontSize: 8 },
      });
    };

    addTable("Equipment", equipment);
    addTable("Logs", logs);
    addTable("Users", users);
    addTable("Assets", assets);

    doc.save("inventory_summary_report.pdf");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Reports Summary</h2>
      <p className="text-gray-600 mb-4">
        View or download full reports for all tables.
      </p>
      <button
        onClick={generatePDF}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        📥 Download Full Report (PDF)
      </button>

      {/* Optional: Show a preview of entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TablePreview title="Equipment" data={equipment} />
        <TablePreview title="Logs" data={logs} />
        <TablePreview title="Users" data={users} />
        <TablePreview title="Assets" data={assets} />
      </div>
    </div>
  );
}

function TablePreview({ title, data }) {
  if (!data.length) return null;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <table className="min-w-full border text-sm mb-4">
        <thead className="bg-gray-100">
          <tr>
            {Object.keys(data[0])
              .slice(0, 4)
              .map((key) => (
                <th key={key} className="border px-2 py-1 capitalize">
                  {key.replace(/_/g, " ")}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 5).map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {Object.entries(row)
                .slice(0, 4)
                .map(([key, val]) => (
                  <td key={key} className="border px-2 py-1">
                    {String(val)}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
