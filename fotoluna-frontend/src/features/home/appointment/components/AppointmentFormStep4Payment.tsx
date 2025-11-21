/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import PaymentErrorModal from "./PaymentModal";
import Button from "../../../../components/Home/Button";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY ?? "";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

type OnlinePaymentMethod = "Card" | "PSE";

interface Props {
  bookingId: number;
  total: number;
  currency?: string; // "COP" si luego quieres mostrar
  userEmail: string;
  onBack: () => void;
  onSuccess: () => void;           // el padre pasa a paso 5, etc.
  paymentMethod: OnlinePaymentMethod; // "Card" o "PSE"
}

const AppointmentFormStep4PaymentEmbedded: React.FC<Props> = ({
  bookingId,
  total,
  // currency = "COP",
  userEmail,
  onBack,
  onSuccess,
  paymentMethod,
}) => {
  const bricksContainerRef = useRef<HTMLDivElement | null>(null);
  const brickControllerRef = useRef<any | null>(null);

  // const [setLoading] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Validación del monto
    if (total == null || Number.isNaN(total) || total <= 0) {
      setMountError("El monto del pago no es válido. (total debe ser > 0)");
      return;
    }

    // Validar SDK
    if (!window.MercadoPago) {
      setMountError(
        "No se encontró window.MercadoPago. Revisa que el SDK esté cargado en index.html."
      );
      return;
    }

    if (!MP_PUBLIC_KEY) {
      setMountError(
        "No se encontró VITE_MP_PUBLIC_KEY. Revisa el .env del frontend y reinicia Vite."
      );
      return;
    }

    const mp = new window.MercadoPago(MP_PUBLIC_KEY, {
      locale: "es-CO",
    });

    const bricksBuilder = mp.bricks();
    let cancelled = false;

    // Config según método elegido
    const paymentMethodsConfig =
      paymentMethod === "Card"
        ? {
          creditCard: "all",
          debitCard: "all",
        }
        : {
          bankTransfer: "all", // PSE
        };

    const renderPaymentBrick = async () => {
      if (!bricksContainerRef.current) return;

      // Desmontar brick anterior
      if (brickControllerRef.current) {
        brickControllerRef.current.unmount?.();
        brickControllerRef.current = null;
      }

      const controller = await bricksBuilder.create(
        "payment",
        "paymentBrick_container",
        {
          initialization: {
            amount: total,
          },
          customization: {
            paymentMethods: paymentMethodsConfig,
            visual: {
              style: {
                theme: "default",
              },
            },
          },
          callbacks: {
            onReady: () => {
              console.log("Payment Brick listo");
            },

            // 👇 AQUÍ está la clave: devolvemos una Promesa y llamamos resolve/reject
            onSubmit: ({
              formData,
              selectedPaymentMethod,
            }: {
              formData: any;
              selectedPaymentMethod: any;
            }) => {
              return new Promise<void>(async (resolve, reject) => {
                try {
                  // setLoading(true);
                  setMountError(null);

                  const paymentMethodId =
                    selectedPaymentMethod?.id ??
                    formData?.paymentMethodId ??
                    formData?.payment_method_id ??
                    null;

                  console.log("formData =>", formData);
                  console.log("selectedPaymentMethod =>", selectedPaymentMethod);
                  console.log("paymentMethodId que se enviará =>", paymentMethodId);

                  const token = localStorage.getItem("token");

                  const res = await axios.post(
                    `${API_BASE}/api/mercadopago/checkout/pay`,
                    {
                      booking_id: bookingId,
                      transaction_amount: total,
                      payment_method_id: paymentMethodId,
                      token: formData?.token,
                      installments: formData?.installments,
                      payer: {
                        email: userEmail,
                      },
                      raw_form: formData,
                      client_payment_method: paymentMethod, // "Card" o "PSE"
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                      },
                    }
                  );

                  const { status, status_detail } = res.data;

                  if (status === "approved") {
                    onSuccess();
                    resolve(); // 👉 le decimos al Brick que todo ok
                  } else {
                    setErrorMessage(
                      `Pago con estado: ${status}. ${status_detail ? `Detalle: ${status_detail}. ` : ""
                      }Verifica tu medio de pago o intenta nuevamente.`
                    );
                    setShowErrorModal(true);
                    reject(); // 👉 el Brick sabe que falló, re-habilita el botón
                  }
                } catch (err: any) {
                  console.error("ERROR PAGO MP =>", err);

                  const backendMessage =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Ocurrió un error al procesar el pago. Intenta nuevamente.";

                  setErrorMessage(backendMessage);
                  setShowErrorModal(true);

                  reject(err); // 👉 avisamos al Brick del error
                } finally {
                  // setLoading(false);
                }
              });
            },

            onError: (error: any) => {
              console.error("Error en Payment Brick:", error);
              setErrorMessage("Ocurrió un error en el formulario de pago.");
              setShowErrorModal(true);
            },
          },
        }
      );

      if (cancelled) {
        controller.unmount?.();
        return;
      }

      brickControllerRef.current = controller;
    };

    renderPaymentBrick();

    return () => {
      cancelled = true;
      if (brickControllerRef.current) {
        brickControllerRef.current.unmount?.();
        brickControllerRef.current = null;
      }
    };
  }, [total, bookingId, userEmail, onSuccess, paymentMethod]);

  // Si el monto no es válido o hubo error de montaje
  if (total == null || Number.isNaN(total) || total <= 0 || mountError) {
    return (
      <div className="text-center mt-5">
        <h3>Pago</h3>
        <p className="mt-3">
          {mountError ?? "Cargando información de pago..."}
        </p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-outline-secondary" onClick={onBack}>
            Atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="payment-step-wrapper">
        {/* Puedes agregar título/subtitulo si quieres aquí */}

        <div className="payment-card">
          <div
            id="paymentBrick_container"
            ref={bricksContainerRef}
            className="payment-brick-container"
          />
        </div>



        <PaymentErrorModal
          show={showErrorModal}
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      </div>
      <div className="payment-actions">
        <div className="d-flex justify-content-between mt-4">
          <Button value="Atrás" onClick={onBack} />
        </div>
      </div>
    </>
  );
};

export default AppointmentFormStep4PaymentEmbedded;
