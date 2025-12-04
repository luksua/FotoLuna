// AdminPhotos/pages/AdminPhotosPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/AdminPhotos.css";
import type { CustomerPhotoSummary, CloudPhoto } from "../Components/Types/types";
import { CustomerPhotoCard } from "../Components/CustomerPhotoCard";
import { PhotoModal } from "../Components/PhotoModal";
import HomeLayout from "../../../../layouts/HomeAdminLayout";

// URL del backend
const API_BASE_URL = "http://127.0.0.1:8000/api";

export const AdminPhotosPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerPhotoSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPhoto, setSelectedPhoto] = useState<CloudPhoto | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // 🔥 NUEVO: controla qué tarjeta está expandida
  const [expandedCustomerId, setExpandedCustomerId] = useState<number | null>(null);

  const handleToggleRecent = (customerId: number) => {
    setExpandedCustomerId((prev) => (prev === customerId ? null : customerId));
  };

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No se encontró la sesión activa. Inicia sesión.");
        }

        const response = await fetch(`${API_BASE_URL}/admin/cloud-photos/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error("Acceso no autorizado o sesión expirada (401/403).");
        }

        if (!response.ok) {
          throw new Error("Error al cargar los datos: " + response.statusText);
        }

        const data: CustomerPhotoSummary[] = await response.json();
        setCustomers(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Error inesperado (verifica CORS)");
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  // Clic en foto miniatura → abre modal
  const handlePhotoClick = (photo: CloudPhoto, customer: CustomerPhotoSummary) => {
    setSelectedPhoto(photo);
    setSelectedCustomerName(customer.customerName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
    setSelectedCustomerName(undefined);
  };

  // Clic en “ver todas las fotos”
  const handleViewAll = (customerId: number) => {
    navigate(`/admin/customers/${customerId}/photos`);
  };

  return (
    <HomeLayout>
      <div className="ap-page">
        <header className="ap-page__header">
          <div>
            <h1>Fotos en la nube · Admin</h1>
            <p className="ap-page__subtitle">
              Tarjetas por cliente. Puedes ver sus fotos recientes o ir a la galería completa.
            </p>
          </div>
        </header>

        {loading && <p>Cargando clientes...</p>}
        {error && <p className="ap-error">{error}</p>}

        {!loading && !error && (
          <section className="ap-grid">
            {customers.map((customer) => (
              <CustomerPhotoCard
                key={customer.customerId}
                customer={customer}
                onViewAll={handleViewAll}
                onPhotoClick={handlePhotoClick}

                // 👇 PROPS NUEVOS
                isExpanded={expandedCustomerId === customer.customerId}
                onToggleRecent={handleToggleRecent}
              />
            ))}

            {customers.length === 0 && (
              <p className="ap-empty-text">No se encontraron clientes con fotos en la nube.</p>
            )}
          </section>
        )}

        {/* Modal global */}
        <PhotoModal
          photo={selectedPhoto}
          isOpen={isModalOpen}
          customerName={selectedCustomerName}
          onClose={handleCloseModal}
        />
      </div>
    </HomeLayout>
  );
};

export default AdminPhotosPage;
