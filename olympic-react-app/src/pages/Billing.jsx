import React, { useState, useEffect, useMemo } from "react";
import AppLayout from "../layouts/AppLayout";
import api from "../utils/api";
import "./Billing.css";

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // bill generation
  const [custNames, setCustNames] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // search filter
  const [searchCust, setSearchCust] = useState("");

  useEffect(() => {
    fetchBills();

    const handleBillPaid = () => fetchBills();
    window.addEventListener("billPaid", handleBillPaid);
    return () => window.removeEventListener("billPaid", handleBillPaid);
  }, []);

  async function fetchBills() {
    setLoading(true);
    try {
      const response = await api.get("/api/billing");
      setBills(response.data);
    } catch (err) {
      console.error("Error loading bills", err);
    } finally {
      setLoading(false);
    }
  }

  async function generateBill(e) {
    e.preventDefault();
    if (!custNames || !startDate || !endDate)
      return alert("Enter customer names, start & end date");

    try {
      await api.post("/api/billing/generate", {
        custNames: custNames.split(",").map((n) => n.trim()),
        startDate,
        endDate,
      });
      alert("Bill generated successfully!");
      setCustNames("");
      setStartDate("");
      setEndDate("");
      fetchBills();
      window.dispatchEvent(new Event("billPaid"));
    } catch (err) {
      alert(err.response?.data?.message || "Error generating bill");
    }
  }

  async function togglePaid(bill) {
    const confirmation =
      bill.status !== "paid"
        ? window.prompt('Type "paid" to confirm marking this bill as paid:')
        : true;

    if (bill.status !== "paid" && confirmation?.toLowerCase() !== "paid") {
      alert("Bill status change canceled");
      return;
    }

    try {
      await api.patch(`/api/billing/${bill._id}/status`);
      fetchBills();
      window.dispatchEvent(new Event("billPaid"));
    } catch {
      alert("Failed to update bill status");
    }
  }

  //  CSV download
 function downloadPendingCSV(bill) {
  if (!bill.creditSales?.length) {
    alert("No products found");
    return;
  }

  const headers = [
    "Customer Name",
    "Product",
    "Quantity",
    "Price",
    "Total amount",
    "Date Sold",
    "Status",
  ];

  const rows = bill.creditSales.map((item) => [
    item.custname || "",
    item.productName || "",
    item.quantity ?? 0,
    item.soldPrice ?? 0,
    item.soldPrice*item.quantity,
    item.saleDate
      ? `'${new Date(item.saleDate).toISOString().slice(0, 10)}`
      : "",
    bill.status,
  ]);

  const csv =
    [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Bill_${bill._id}.csv`;
  link.click();
}



  const filteredBills = useMemo(() => {
    return bills.filter(
      (b) =>
        !searchCust ||
        b.creditSales
          .map((cs) => cs.custname)
          .join(", ")
          .toLowerCase()
          .includes(searchCust.toLowerCase())
    );
  }, [bills, searchCust]);

  return (
    <AppLayout>
      <h1 className="page-title">Billing</h1>

      {/* Generate Bill */}
      <div className="billing-card">
        <form className="billing-form" onSubmit={generateBill}>
          <label>
            Customer Names
            <input
              placeholder="cust1, cust2"
              value={custNames}
              onChange={(e) => setCustNames(e.target.value)}
            />
          </label>

          <label>
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label>
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>

          <button className="btn primary" type="submit">
            Generate Bill
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="billing-card">
        <div className="billing-form">
          <label>
            Search by Customer Name
            <input
              placeholder="Enter customer name"
              value={searchCust}
              onChange={(e) => setSearchCust(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="billing-panel">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="billing-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Range</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
                <th>bill</th>
              </tr>
            </thead>

            <tbody>
              {filteredBills.map((b) => (
                <tr key={b._id}>
                  <td>{b.creditSales[0].custname}</td>
                  <td>
                    {new Date(b.startDate).toLocaleDateString()} →{" "}
                    {new Date(b.endDate).toLocaleDateString()}
                  </td>
                  <td>₹ {b.totalAmount}</td>
                  <td className={b.status === "paid" ? "paid" : "unpaid"}>
                    {b.status}
                  </td>
                  <td>
                    <button
                      className={
                        b.status === "paid" ? "btn success" : "btn warn"
                      }
                      onClick={() => togglePaid(b)}
                    >
                      {b.status === "paid" ? "Paid" : "UnPaid"}
                    </button>

                    
                  </td>
                  <td><button
                      className="btn secondary"
                      style={{ marginLeft: 8 }}
                      onClick={() => downloadPendingCSV(b)}
                    >
                      Download
                    </button></td>
                </tr>
              ))}

              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                    No bills found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
