"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function UsersTable() {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "staff", // Default role
  });

  // Fetch users data
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        setData([]); // Reset data on error
      } else {
        setData(data || []);
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, role } = newUser;

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email, role }])
      .select(); // Ensure we get the inserted data

    if (error) {
      console.error("Error adding user:", error);
      return;
    }

    if (!data || !Array.isArray(data)) {
      console.error("Error: Data is not in the expected array format", data);
      return;
    }

    // Close modal and reset input fields
    setIsModalOpen(false);
    setNewUser({ name: "", email: "", role: "staff" });

    // Prepend the new user to the list (latest first)
    setData((prevData) => [...data, ...prevData]);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Users</h2>

      {/* Button to open the modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white p-2 rounded mb-4"
      >
        Add User
      </button>

      {/* Users Table */}
      <div className="overflow-x-auto">
        {data.length > 0 ? (
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left border-b">ID</th>
                <th className="p-2 text-left border-b">Name</th>
                <th className="p-2 text-left border-b">Email</th>
                <th className="p-2 text-left border-b">Role</th>
                <th className="p-2 text-left border-b">Created At</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-2 border-b">{row.id}</td>
                  <td className="p-2 border-b">{row.name}</td>
                  <td className="p-2 border-b">{row.email}</td>
                  <td className="p-2 border-b">{row.role}</td>
                  <td className="p-2 border-b">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users data available.</p>
        )}
      </div>

      {/* Modal for adding user */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h3 className="text-lg font-medium mb-4">Add New User</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <input
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                placeholder="Name"
                required
                className="w-full p-2 border rounded"
              />

              {/* Email Input */}
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                className="w-full p-2 border rounded"
              />

              {/* Role Dropdown */}
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>

              {/* Submit and Cancel Buttons */}
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
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
