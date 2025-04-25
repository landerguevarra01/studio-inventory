"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function LogsTable() {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    user_id: "",
    action: "",
    equipment_id: "",
    timestamp: new Date().toISOString().slice(0, 16),
  });
  const [users, setUsers] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);

  // Fetch logs data
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching logs:", error);
        setData([]);
      } else {
        setData(data || []);
      }
    };
    fetchData();
  }, []);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("id, name");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data || []);
      }
    };
    fetchUsers();
  }, []);

  // Fetch equipment data
  useEffect(() => {
    const fetchEquipment = async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("id, name");
      if (error) {
        console.error("Error fetching equipment:", error);
      } else {
        setEquipment(data || []);
      }
    };
    fetchEquipment();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewLog((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user_id, action, equipment_id, timestamp } = newLog;

    const { data, error } = await supabase
      .from("logs")
      .insert([{ user_id, action, equipment_id, timestamp }])
      .select();

    if (error) {
      console.error("Error adding log:", error);
    } else {
      setIsModalOpen(false);
      setNewLog({
        user_id: "",
        action: "",
        equipment_id: "",
        timestamp: new Date().toISOString().slice(0, 16),
      });
      setData((prevData) => [...(data || []), ...prevData]);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Logs</h2>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white p-2 rounded mb-4"
      >
        Add Log
      </button>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        {data.length > 0 ? (
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left border-b">ID</th>
                <th className="p-2 text-left border-b">User</th>
                <th className="p-2 text-left border-b">Action</th>
                <th className="p-2 text-left border-b">Equipment</th>
                <th className="p-2 text-left border-b">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-2 border-b">{row.id}</td>
                  <td className="p-2 border-b">{row.user_id}</td>
                  <td className="p-2 border-b">{row.action}</td>
                  <td className="p-2 border-b">{row.equipment_id}</td>
                  <td className="p-2 border-b">
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No logs data available.</p>
        )}
      </div>

      {/* Modal for adding log */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h3 className="text-lg font-medium mb-4">Add New Log</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Dropdown */}
              <select
                name="user_id"
                value={newLog.user_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

              {/* Action Input */}
              <input
                type="text"
                name="action"
                value={newLog.action}
                onChange={handleInputChange}
                placeholder="Action"
                required
                className="w-full p-2 border rounded"
              />

              {/* Equipment Dropdown */}
              <select
                name="equipment_id"
                value={newLog.equipment_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Equipment</option>
                {equipment.map((equip) => (
                  <option key={equip.id} value={equip.id}>
                    {equip.name}
                  </option>
                ))}
              </select>

              {/* Timestamp Input */}
              <input
                type="datetime-local"
                name="timestamp"
                value={newLog.timestamp}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 p-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-2 rounded"
                >
                  Add Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
