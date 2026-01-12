import { useState, useEffect } from "react";
import api from "../utils/api";
import AppLayout from "../layouts/AppLayout";
import styles from "./Purchase.module.css"; // using CSS module

export default function Purchase() {
  const [form, setForm] = useState({
    productName: "",
    quantity: "",
    purchasePrice: "",
    customerPrice: "",
    wholesalePrice: "",
    supplier: "",
  });

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchPurchases = async () => {
    try {
      const res = await api.get("/api/purchases");
      setPurchases(res.data);
    } catch (err) {
      console.error("Failed to load purchases");
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/api/purchases", {
        ...form,
        quantity: Number(form.quantity),
        purchasePrice: Number(form.purchasePrice),
        customerPrice: Number(form.customerPrice),
        wholesalePrice: form.wholesalePrice
          ? Number(form.wholesalePrice)
          : undefined,
      });

      setSuccess("Purchase added successfully ✅");
      setForm({
        productName: "",
        quantity: "",
        purchasePrice: "",
        customerPrice: "",
        wholesalePrice: "",
        supplier: "",
      });

      fetchPurchases();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add purchase");
    } finally {
      setLoading(false);
    }
  };

  const deletePurchase = async (id) => {
    if (!window.confirm("Delete this purchase?")) return;

    try {
      await api.delete(`/api/purchases/${id}`);
      fetchPurchases();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <AppLayout>
      <h1 className="page-title">Purchase List</h1>
      <button
        className={styles.openModalBtn}
        onClick={() => setShowModal(true)}
      >
        Add Purchase
      </button>

      {/* ---------- MODAL ---------- */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Add Purchase</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                name="productName"
                placeholder="Product Name"
                value={form.productName}
                onChange={handleChange}
                required
              />
              <input
                name="quantity"
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />
              <input
                name="purchasePrice"
                type="number"
                placeholder="Purchase Price"
                value={form.purchasePrice}
                onChange={handleChange}
                required
              />
              <input
                name="customerPrice"
                type="number"
                placeholder="Customer Price"
                value={form.customerPrice}
                onChange={handleChange}
                required
              />
              <input
                name="wholesalePrice"
                type="number"
                placeholder="Wholesale Price (optional)"
                value={form.wholesalePrice}
                onChange={handleChange}
              />
              <input
                name="supplier"
                placeholder="Supplier"
                value={form.supplier}
                onChange={handleChange}
              />
              <div className={styles.buttons}>
                <button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Add Purchase"}
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.success}>{success}</p>}
            </form>
          </div>
        </div>
      )}

      {/* ---------- PURCHASE LIST ---------- */}
      <div className={styles.tableCard}>
        {purchases.length === 0 ? (
          <p>No purchases found</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Purchase ₹</th>
                <th>Customer ₹</th>
                <th>Wholesale ₹</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p._id}>
                  <td>{p.productName}</td>
                  <td>{p.quantity}</td>
                  <td>₹{p.purchasePrice}</td>
                  <td>₹{p.customerPrice}</td>
                  <td>{p.wholesalePrice ? `₹${p.wholesalePrice}` : "-"}</td>
                  <td>{p.supplier || "-"}</td>
                  <td>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => deletePurchase(p._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
