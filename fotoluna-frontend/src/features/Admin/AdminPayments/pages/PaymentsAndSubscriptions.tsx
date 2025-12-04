import React, { useState } from "react";
import Subscriptions from "../components/Subscriptions";
import StoragePlan from "../components/StoragePlan";
import "../styles/payment.css";
import HomeLayout from "../../../../layouts/HomeAdminLayout";
import AdminBookingPayments from "../components/BookingPayments";

type Tab = "bookingPayments" | "subscriptions" | "storage";

const PaymentsAndSubscriptions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("bookingPayments");

  return (
    <HomeLayout>
      <div className="admin-container">
        <h1 className="admin-title">Gestión de Pagos y Suscripciones</h1>

        <div className="admin-tabs">
          <button
            type="button"
            onClick={() => setActiveTab("bookingPayments")}
            className={
              "admin-tab" +
              (activeTab === "bookingPayments" ? " active" : "")
            }
          >
            Pagos de reservas
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("subscriptions")}
            className={
              "admin-tab" +
              (activeTab === "subscriptions" ? " active" : "")
            }
          >
            Pagos de almacenamiento
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("storage")}
            className={
              "admin-tab" + (activeTab === "storage" ? " active" : "")
            }
          >
            Planes de almacenamiento
          </button>
        </div>

        {activeTab === "bookingPayments" && <AdminBookingPayments />}
        {activeTab === "subscriptions" && <Subscriptions />}
        {activeTab === "storage" && <StoragePlan />}
      </div>
    </HomeLayout>
  );
};

export default PaymentsAndSubscriptions;
