import React, { useState, useEffect } from "react";
import api from "../utils/api";
import AppLayout from "../layouts/AppLayout";
import "./Sales.css";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    productName: "",
    buyer: "",
    saleType: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [newSale, setNewSale] = useState({
    items: [{ productId: "", productName: "", quantity: 1, soldPrice: 0, priceType: "customer" }],
    saleType: "cash",
    buyer: "customer",
    custname: "",
  });
  const [saleTotal, setSaleTotal] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredTotal, setFilteredTotal] = useState(null);

  const owner = true;

  // Calculate total
  useEffect(() => {
    if (newSale.saleType === "credit") {
      setSaleTotal(0);
      return;
    }
    const total = newSale.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.soldPrice) || 0),
      0
    );
    setSaleTotal(total);
  }, [newSale]);

  // Fetch products and sales
  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [filters, pagination.page, pagination.limit]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/purchases");
      setProducts(res.data);
    } catch {
      alert("Failed to load products");
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: pagination.page, limit: pagination.limit };
      const res = await api.get("/api/sales", { params });
      setSales(res.data.sales);
      setPagination((prev) => ({ ...prev, totalPages: res.data.pages }));
      return res.data.sales;
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch sales");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handlePageChange = (newPage) => setPagination((prev) => ({ ...prev, page: newPage }));

  const handleNewSaleChange = (index, field, value) => {
    const updated = [...newSale.items];

    if (field === "productId") {
      updated[index].productId = value; // always set productId
      const product = products.find((p) => p._id === value);
      if (product) {
        updated[index].productName = product.productName;
        updated[index].soldPrice =
          updated[index].priceType === "wholesale"
            ? product.wholesalePrice || product.customerPrice
            : product.customerPrice;
      } else {
        updated[index].productName = "";
        updated[index].soldPrice = 0;
      }
    } else {
      updated[index][field] = value;
    }

    setNewSale({ ...newSale, items: updated });
  };

  const selectPriceType = (index, type) => handleNewSaleChange(index, "priceType", type);

  const addItemRow = () =>
    setNewSale({
      ...newSale,
      items: [...newSale.items, { productId: "", productName: "", quantity: 1, soldPrice: 0, priceType: "customer" }],
    });

  const removeItemRow = (index) => {
    if (newSale.items.length === 1) return;
    const updated = [...newSale.items];
    updated.splice(index, 1);
    setNewSale({ ...newSale, items: updated });
  };

  const submitNewSale = async (e) => {
    e.preventDefault();
    if (newSale.saleType === "credit" && !newSale.custname.trim()) {
      alert("Customer name is required for credit sales");
      return;
    }

    // Validate productIds
    if (newSale.items.some((item) => !item.productId)) {
      alert("Please select a product for all items.");
      return;
    }

    try {
      await api.post("/api/sales", newSale);
      alert("Sale added successfully");
      setNewSale({
        items: [{ productId: "", productName: "", quantity: 1, soldPrice: 0, priceType: "customer" }],
        saleType: "cash",
        buyer: "customer",
        custname: "",
      });
      fetchSales();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add sale");
    }
  };

  const deleteSale = async (saleId) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) return;
    try {
      await api.delete(`/api/sales/${saleId}`);
      alert("Sale deleted and products restored to stock");
      fetchSales();
    } catch {
      alert("Failed to delete sale");
    }
  };

  const calculateFilteredTotal = (salesData) =>
    salesData
      .filter((sale) => sale.saleType !== "credit")
      .reduce((total, sale) => total + sale.items.reduce((sum, i) => sum + i.quantity * i.soldPrice, 0), 0);

  return (
    <AppLayout>
      <h1 className="page-title">Sales</h1>

      <button className="btn-primary" onClick={() => setShowFilterModal(true)}>
        Filter Sales
      </button>

      {filteredTotal !== null && (
        <div className="total-amount-box">
          <strong>Total Filtered Sales:</strong> ₹ {filteredTotal}
        </div>
      )}

      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Filter Sales</h3>
            <div className="filter-grid">
              <input name="productName" placeholder="Product" value={filters.productName} onChange={handleFilterChange} />
              <select name="buyer" value={filters.buyer} onChange={handleFilterChange}>
                <option value="">Buyer</option>
                <option value="customer">Customer</option>
                <option value="wholesale">Wholesale</option>
              </select>
              <select name="saleType" value={filters.saleType} onChange={handleFilterChange}>
                <option value="">Sale Type</option>
                <option value="cash">Cash</option>
                <option value="Gpay">GPay</option>
                <option value="credit">Credit</option>
              </select>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
              <button
                className="btn-primary"
                onClick={async () => {
                  const data = await fetchSales();
                  setFilteredTotal(calculateFilteredTotal(data));
                  setShowFilterModal(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Sale Form */}
      <div className="card new-sale-card">
        <h3>Add New Sale</h3>
        <form className="new-sale-form" onSubmit={submitNewSale}>
          {newSale.items.map((item, idx) => (
            <div key={idx} className="sale-item-row">
              <select
                value={item.productId}
                onChange={(e) => handleNewSaleChange(idx, "productId", e.target.value)}
                required
              >
                <option value="">Select Product</option>
                {products
                  .filter((p) => p.quantity > 0)
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.productName} (₹{p.customerPrice}, stock: {p.quantity})
                    </option>
                  ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleNewSaleChange(idx, "quantity", parseInt(e.target.value))}
                required
              />

              <div className="price-buttons">
                <button type="button" className={item.priceType === "customer" ? "active" : ""} onClick={() => selectPriceType(idx, "customer")}>Customer</button>
                <button type="button" className={item.priceType === "wholesale" ? "active" : ""} onClick={() => selectPriceType(idx, "wholesale")}>Wholesale</button>
                <button type="button" className={item.priceType === "custom" ? "active" : ""} onClick={() => selectPriceType(idx, "custom")}>Custom</button>
              </div>

              <input
                type="number"
                min="0"
                value={item.soldPrice}
                onChange={(e) => handleNewSaleChange(idx, "soldPrice", parseFloat(e.target.value))}
                disabled={item.priceType !== "custom"}
              />

              {newSale.items.length > 1 && (
                <button type="button" className="btn-delete" onClick={() => removeItemRow(idx)}>Remove</button>
              )}
            </div>
          ))}

          <button type="button" className="btn-add-item" onClick={addItemRow}>
            + Add Item
          </button>

          <div className="sale-meta">
            <select value={newSale.saleType} onChange={(e) => setNewSale({ ...newSale, saleType: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="Gpay">GPay</option>
              <option value="credit">Credit</option>
            </select>

            <select value={newSale.buyer} onChange={(e) => setNewSale({ ...newSale, buyer: e.target.value })}>
              <option value="customer">Customer</option>
              <option value="wholesale">Wholesale</option>
            </select>

            <input
              placeholder="Customer Name (required for credit)"
              value={newSale.custname}
              required={newSale.saleType === "credit"}
              onChange={(e) => setNewSale({ ...newSale, custname: e.target.value })}
            />
          </div>

          <div className="total-amount-box">
            <strong>Total Amount:</strong> ₹ {saleTotal}
          </div>

          <button type="submit" className="btn-submit-sale">Submit Sale</button>
        </form>
      </div>

      {/* Sales Table */}
      <div className="card">
        {loading ? <p>Loading...</p> : (
          <table className="sales-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Sale Type</th>
                <th>Products</th>
                <th>Total Amount</th>
                <th>Salesperson</th>
                <th>Date</th>
                {owner && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td>{sale.buyer}</td>
                  <td>{sale.saleType}</td>
                  <td>{sale.items.map((i) => i.productName + `(${i.quantity})`).join(", ")}</td>
                  <td>{sale.saleType === "credit" ? "Pending" : `₹ ${sale.items.reduce((sum, i) => sum + i.soldPrice * i.quantity, 0)}`}</td>
                  <td>{sale.salesperson}</td>
                  <td>{new Date(sale.saleDate).toLocaleString()}</td>
                  {owner && <td><button className="btn-delete" onClick={() => deleteSale(sale._id)}>Delete</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="pagination">
          <button disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>Prev</button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)}>Next</button>
        </div>
      </div>
    </AppLayout>
  );
}
