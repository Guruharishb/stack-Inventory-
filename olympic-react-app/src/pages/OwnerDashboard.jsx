import React, { useEffect, useState, useMemo } from "react";
import AppLayout from "../layouts/AppLayout";
import api from "../utils/api";
import "../styles/global.css";

export default function OwnerDashboard() {
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);

  // fetch summary
  async function loadSummary() {
    try {
      const res = await api.get("/api/dashboard/summary");
      setSummary(res.data);
    } catch {
      setSummary({
        sales: "-",
        profit: "-",
        lowStock: "-",
        employees: "-",
      });
    }
  }

  // fetch ALL credit sales
  async function loadCreditSales() {
    try {
      const res = await api.get("/api/sales", {
        params: { saleType: "credit" },
      });
      setSales(res.data.sales || []);
    } catch {
      setSales([]);
    }
  }

  useEffect(() => {
    loadSummary();
    loadCreditSales();

    function handleBillPaid() {
      loadCreditSales();
      loadSummary();
    }

    window.addEventListener("billPaid", handleBillPaid);
    return () => window.removeEventListener("billPaid", handleBillPaid);
  }, []);

  // 🔥 TOP 10 CUSTOMERS WITH HIGHEST PENDING AMOUNT
  const topPendingCustomers = useMemo(() => {
    const map = {};

    sales.forEach((sale) => {
      // only unpaid credit sales
      if (sale.status !== "unpaid") return;

      const amount = sale.items.reduce(
        (sum, i) => sum + i.soldPrice * i.quantity,
        0
      );

      const customer = sale.custname || "Occasional";

      map[customer] = (map[customer] || 0) + amount;
    });

    return Object.entries(map)
      .map(([custname, amount]) => ({ custname, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [sales]);

  return (
    <AppLayout>
      <h1 className="page-title">Dashboard</h1>

      <div className="grid grid-cards">
        <div className="card">
          <div className="card-title">Today's Sales</div>
          <div className="card-value">₹ {summary?.sales ?? "-"}</div>
        </div>
        <div className="card">
          <div className="card-title">This Month Profit</div>
          <div className="card-value">₹ {summary?.profit ?? "-"}</div>
        </div>
        <div className="card">
          <div className="card-title">Low Stock Items</div>
          <div className="card-value">{summary?.lowStock ?? "-"}</div>
        </div>
        <div className="card">
          <div className="card-title">Employees</div>
          <div className="card-value">{summary?.employees ?? "-"}</div>
        </div>
      </div>

      {/* 🔥 TOP PENDING CUSTOMERS */}
      <section style={{ marginTop: 24 }}>
        <h2 className="section-title">
          Top 10 Customers with Highest Pending Amount
        </h2>

        <div className="panel">
          {topPendingCustomers.length === 0 ? (
            <p className="muted">No pending credit sales</p>
          ) : (
            <table className="sales-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer Name</th>
                  <th>Pending Amount</th>
                </tr>
              </thead>
              <tbody>
                {topPendingCustomers.map((row, index) => (
                  <tr key={row.custname}>
                    <td>{index + 1}</td>
                    <td>{row.custname}</td>
                    <td>₹ {row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
