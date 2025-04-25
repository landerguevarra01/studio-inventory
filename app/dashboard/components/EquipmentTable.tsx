import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

const EquipmentTable = () => {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    type: "",
    brand: "",
    model: "",
    serial_number: "",
    image_url: "",
    status: "",
    notes: "",
  });

  const fetchEquipment = async () => {
    const { data, error } = await supabase.from("equipment").select("*");
    if (error) {
      console.error("Error fetching equipment:", error);
    } else {
      setEquipment(data);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewEquipment({
      ...newEquipment,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("equipment")
      .insert([newEquipment]);

    if (error) {
      console.error("Error adding equipment:", error);
    } else {
      setNewEquipment({
        name: "",
        type: "",
        brand: "",
        model: "",
        serial_number: "",
        image_url: "",
        status: "",
        notes: "",
      });
      fetchEquipment();
      setModalOpen(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Equipment List</h2>

      {/* Button to open modal */}
      <button
        onClick={() => setModalOpen(true)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Add New Equipment
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-medium mb-4">Add New Equipment</h3>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                name="name"
                value={newEquipment.name}
                onChange={handleInputChange}
                placeholder="Name"
                required
                className="p-2 border rounded"
              />
              <input
                name="type"
                value={newEquipment.type}
                onChange={handleInputChange}
                placeholder="Type"
                required
                className="p-2 border rounded"
              />
              <input
                name="brand"
                value={newEquipment.brand}
                onChange={handleInputChange}
                placeholder="Brand"
                className="p-2 border rounded"
              />
              <input
                name="model"
                value={newEquipment.model}
                onChange={handleInputChange}
                placeholder="Model"
                className="p-2 border rounded"
              />
              <input
                name="serial_number"
                value={newEquipment.serial_number}
                onChange={handleInputChange}
                placeholder="Serial Number"
                className="p-2 border rounded"
              />
              <input
                name="image_url"
                value={newEquipment.image_url}
                onChange={handleInputChange}
                placeholder="Image URL"
                className="p-2 border rounded"
              />
              {/* Status Dropdown */}
              <select
                name="status"
                value={newEquipment.status}
                onChange={handleInputChange}
                className="p-2 border rounded"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
              <textarea
                name="notes"
                value={newEquipment.notes}
                onChange={handleInputChange}
                placeholder="Notes"
                className="p-2 border rounded col-span-1 md:col-span-2"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded col-span-1 md:col-span-2"
              >
                Add Equipment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Table */}
      <div className="overflow-x-auto">
        {equipment.length > 0 ? (
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                {Object.keys(equipment[0]).map((key) => (
                  <th key={key} className="p-2 text-left border-b capitalize">
                    {key.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {equipment.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {Object.values(item).map((value, i) => (
                    <td key={i} className="p-2 border-b">
                      {value?.toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No equipment available</p>
        )}
      </div>
    </div>
  );
};

export default EquipmentTable;
