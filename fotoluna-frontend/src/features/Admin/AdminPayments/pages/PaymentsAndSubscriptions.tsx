// src/modules/AdminPayments/pages/PaymentsAndSubscriptions.tsx
import React, { useState } from "react";
import Subscriptions from "../components/Subscriptions";
import StoragePlan from "../components/StoragePlan";
import "../styles/payment.css";
import HomeLayout from "../../../../layouts/HomeAdminLayout";

type Tab = "subscriptions" | "storage";

const PaymentsAndSubscriptions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("subscriptions");

  return (
    <HomeLayout>
      <div className="admin-container">
        <h1 className="admin-title">Gestión de Pagos y Suscripciones</h1>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            type="button"
            onClick={() => setActiveTab("subscriptions")}
            className={
              "admin-tab" +
              (activeTab === "subscriptions" ? " active" : "")
            }
          >
            Transacciones / Suscripciones
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("storage")}
            className={
              "admin-tab" +
              (activeTab === "storage" ? " active" : "")
            }
          >
            Planes de almacenamiento
          </button>
        </div>

        {/* Contenido de cada tab */}
        {activeTab === "subscriptions" && <Subscriptions />}
        {activeTab === "storage" && <StoragePlan />}
      </div>
    </HomeLayout>
  );
};

export default PaymentsAndSubscriptions;
