import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

const AssetsTable = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newAssets, setNewAssets] = useState({
    asset_tag: "",
    name: "",
    category: "studio equipment",
    condition: "",
    qty: "",
    details: "",
    remarks: "",
    created_at: getNowInManila(),
  });
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  // Helper to get Manila time in 'yyyy-MM-ddTHH:mm' format
  function getNowInManila() {
    const manilaTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Manila",
    });
    const localDate = new Date(manilaTime);
    const iso = new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);
    return iso;
  }

  const fetchAssets = async () => {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching assets:", error);
    } else {
      setAssets(data || []);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewAssets((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create new asset
    const { data, error } = await supabase.from("assets").insert([
      {
        ...newAssets,
        qty: parseInt(newAssets.qty),
        created_at: newAssets.created_at, // raw input as string
      },
    ]);

    if (error) {
      console.error("Error adding asset:", error);
    } else {
      setNewAssets({
        asset_tag: "",
        name: "",
        category: "studio equipment",
        condition: "",
        qty: "",
        details: "",
        remarks: "",
        created_at: getNowInManila(),
      });
      fetchAssets();
      setModalOpen(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Update asset
    const { data, error } = await supabase
      .from("assets")
      .update({
        name: newAssets.name,
        category: newAssets.category,
        condition: newAssets.condition,
        qty: parseInt(newAssets.qty),
        details: newAssets.details,
        remarks: newAssets.remarks,
        created_at: newAssets.created_at,
      })
      .eq("asset_tag", selectedAsset.asset_tag);

    if (error) {
      console.error("Error updating asset:", error);
    } else {
      setNewAssets({
        asset_tag: "",
        name: "",
        category: "studio equipment",
        condition: "",
        qty: "",
        details: "",
        remarks: "",
        created_at: getNowInManila(),
      });
      fetchAssets();
      setUpdateModalOpen(false);
      setSelectedAsset(null);
    }
  };

  const handleEdit = (asset: any) => {
    setSelectedAsset(asset);
    setNewAssets({
      asset_tag: asset.asset_tag,
      name: asset.name,
      category: asset.category,
      condition: asset.condition,
      qty: asset.qty.toString(),
      details: asset.details,
      remarks: asset.remarks,
      created_at: asset.created_at,
    });
    setUpdateModalOpen(true);
  };

  const handleDeleteConfirmation = () => {
    setDeleteModalOpen(true);
  };

  const handleDelete = async (asset: any) => {
    // Move the asset to the assets_trash table
    const { data: moveData, error: moveError } = await supabase
      .from("assets_trash")
      .insert([asset]);

    if (moveError) {
      console.error("Error moving asset to trash:", moveError);
      return;
    }

    // Delete the asset from the assets table
    const { data: deleteData, error: deleteError } = await supabase
      .from("assets")
      .delete()
      .eq("asset_tag", asset.asset_tag);

    if (deleteError) {
      console.error("Error deleting asset:", deleteError);
    } else {
      fetchAssets();
      setDeleteModalOpen(false);
    }
  };

  const handleMultiDelete = async () => {
    // Move selected assets to assets_trash
    const assetsToDelete = assets.filter((asset) =>
      selectedAssets.includes(asset.asset_tag)
    );

    const { data: moveData, error: moveError } = await supabase
      .from("assets_trash")
      .insert(assetsToDelete);

    if (moveError) {
      console.error("Error moving assets to trash:", moveError);
      return;
    }

    // Delete selected assets from the assets table
    const { data: deleteData, error: deleteError } = await supabase
      .from("assets")
      .delete()
      .in("asset_tag", selectedAssets);

    if (deleteError) {
      console.error("Error deleting assets:", deleteError);
    } else {
      fetchAssets();
      setDeleteModalOpen(false);
      setSelectedAssets([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((asset) => asset.asset_tag));
    }
  };

  const handleSelectAsset = (asset_tag: string) => {
    if (selectedAssets.includes(asset_tag)) {
      setSelectedAssets(selectedAssets.filter((tag) => tag !== asset_tag));
    } else {
      setSelectedAssets([...selectedAssets, asset_tag]);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Assets List</h2>

      <div className="flex gap-8">
        <button
          onClick={() => setModalOpen(true)}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Equipment
        </button>
        <button
          onClick={() => handleDeleteConfirmation()}
          className="mb-4 bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>

      {/* Add New Equipment Modal */}
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
                name="asset_tag"
                value={newAssets.asset_tag}
                onChange={handleInputChange}
                placeholder="Asset Tag"
                required
                className="p-2 p-2 border-b rounded"
              />

              <input
                name="name"
                value={newAssets.name}
                onChange={handleInputChange}
                placeholder="Name"
                required
                className="p-2 p-2 border-b rounded"
              />
              <select
                name="category"
                value={newAssets.category}
                onChange={handleInputChange}
                className="p-2 p-2 border-b rounded"
              >
                <option value="studio equipment">Studio Equipment</option>
                <option value="furnitures">Furnitures</option>
                <option value="office equipment">Office Equipment</option>
                <option value="pantry supplies">Pantry Supplies</option>
                <option value="wardrobe">Wardrobe</option>
                <option value="make up station">Make up Station</option>
                <option value="bathroom">Bathroom</option>
              </select>
              <input
                name="condition"
                value={newAssets.condition}
                onChange={handleInputChange}
                placeholder="Condition"
                className="p-2 p-2 border-b rounded"
              />
              <input
                name="qty"
                value={newAssets.qty}
                onChange={handleInputChange}
                placeholder="Quantity"
                className="p-2 p-2 border-b rounded"
              />
              <textarea
                name="details"
                value={newAssets.details}
                onChange={handleInputChange}
                placeholder="Details"
                className="p-2 p-2 border-b rounded col-span-1 md:col-span-2"
              />
              <textarea
                name="remarks"
                value={newAssets.remarks}
                onChange={handleInputChange}
                placeholder="Remarks"
                className="p-2 p-2 border-b rounded col-span-1 md:col-span-2"
              />
              <input
                type="datetime-local"
                name="created_at"
                value={newAssets.created_at}
                onChange={handleInputChange}
                required
                className="p-2 p-2 border-b rounded col-span-1 md:col-span-2"
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

      {/* Update Equipment Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl relative">
            <button
              onClick={() => setUpdateModalOpen(false)}
              className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-medium mb-4">Update Equipment</h3>
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                name="asset_tag"
                value={newAssets.asset_tag}
                onChange={handleInputChange}
                placeholder="Asset Tag"
                disabled
                className="p-2 p-2 border-b rounded"
              />

              <input
                name="name"
                value={newAssets.name}
                onChange={handleInputChange}
                placeholder="Name"
                required
                className="p-2 p-2 border-b rounded"
              />
              <select
                name="category"
                value={newAssets.category}
                onChange={handleInputChange}
                className="p-2 p-2 border-b rounded"
              >
                <option value="studio equipment">Studio Equipment</option>
                <option value="furnitures">Furnitures</option>
                <option value="office equipment">Office Equipment</option>
                <option value="pantry supplies">Pantry Supplies</option>
                <option value="wardrobe">Wardrobe</option>
                <option value="make up station">Make up Station</option>
                <option value="bathroom">Bathroom</option>
              </select>
              <input
                name="condition"
                value={newAssets.condition}
                onChange={handleInputChange}
                placeholder="Condition"
                className="p-2 p-2 border-b rounded"
              />
              <input
                name="qty"
                value={newAssets.qty}
                onChange={handleInputChange}
                placeholder="Quantity"
                className="p-2 p-2 border-b rounded"
              />
              <textarea
                name="details"
                value={newAssets.details}
                onChange={handleInputChange}
                placeholder="Details"
                className="p-2 p-2 border-b rounded col-span-1 md:col-span-2"
              />
              <textarea
                name="remarks"
                value={newAssets.remarks}
                onChange={handleInputChange}
                placeholder="Remarks"
                className="p-2 p-2 border-b rounded col-span-1 md:col-span-2"
              />
              <input
                type="datetime-local"
                name="created_at"
                value={newAssets.created_at}
                onChange={handleInputChange}
                required
                className="p-2 p-2 border-b rounded col-span-1 md:col-span-2"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded col-span-1 md:col-span-2"
              >
                Update Equipment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl relative">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-medium mb-4">Delete Equipment?</h3>
            <p className="mb-4">
              Are you sure you want to move the selected item(s) to trash?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleMultiDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table of Assets */}
      <table className="table-auto w-full p-2 border-b">
        <thead>
          <tr className="p-2 border-b">
            <th className="p-2 border-b">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedAssets.length === assets.length}
              />
            </th>
            <th className="p-2 border-b">Asset Tag</th>
            <th className="p-2 border-b">Name</th>
            <th className="p-2 border-b">Category</th>
            <th className="p-2 border-b">Condition</th>
            <th className="p-2 border-b">Qty</th>
            <th className="p-2 border-b">Details</th>
            <th className="p-2 border-b">Remarks</th>
            <th className="p-2 border-b">Created At</th>
            <th className="p-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.asset_tag}>
              <td className="p-2 border-b">
                <input
                  type="checkbox"
                  checked={selectedAssets.includes(asset.asset_tag)}
                  onChange={() => handleSelectAsset(asset.asset_tag)}
                />
              </td>
              <td className="p-2 border-b">{asset.asset_tag}</td>
              <td className="p-2 border-b">{asset.name}</td>
              <td className="p-2 border-b">{asset.category}</td>
              <td className="p-2 border-b">{asset.condition}</td>
              <td className="p-2 border-b">{asset.qty}</td>
              <td className="p-2 border-b">{asset.details}</td>
              <td className="p-2 border-b">{asset.remarks}</td>
              <td className="p-2 border-b">{asset.created_at}</td>
              <td className="p-2 border-b">
                <button
                  onClick={() => handleEdit(asset)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetsTable;
