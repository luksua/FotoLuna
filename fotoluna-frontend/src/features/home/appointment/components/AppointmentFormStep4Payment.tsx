/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import PaymentErrorModal from "./PaymentModal";
import Button from "../../../../components/Home/Button";
import "../styles/appointment.css";

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY ?? "";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

type OnlinePaymentMethod = "Card" | "PSE";

interface Props {
  bookingId?: number | null;
  total: number;
  currency?: string;
  userEmail: string;
  onBack: () => void;
  onSuccess: () => void;
  paymentMethod: OnlinePaymentMethod;
  storagePlanId?: number | null;
  installmentId?: number | null;
}

const AppointmentFormStep4PaymentEmbedded: React.FC<Props> = ({
  bookingId,
  total,
  userEmail,
  onBack,
  onSuccess,
  paymentMethod,
  storagePlanId,
  installmentId,
}) => {
  const bricksContainerRef = useRef<HTMLDivElement | null>(null);
  const brickControllerRef = useRef<any | null>(null);

  const [mountError, setMountError] = useState<string | null>(null);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 👉 Ref para tener siempre el installmentId actualizado dentro del callback de MP
  const installmentIdRef = useRef<number | null>(null);

  useEffect(() => {
    installmentIdRef.current = installmentId ?? null;
  }, [installmentId]);

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

    const isCard = paymentMethod === "Card";
    const brickName = isCard ? "cardPayment" : "payment";

    const renderPaymentBrick = async () => {
      if (!bricksContainerRef.current) return;

      // Desmontar brick anterior de forma segura
      if (brickControllerRef.current) {
        try {
          await brickControllerRef.current.unmount?.();
        } catch (e) {
          console.warn("Mercado Pago unmount warning:", e);
        }
        brickControllerRef.current = null;
      }

      if (cancelled || !bricksContainerRef.current) return;

      // Asegurar contenedor limpio antes de montar
      bricksContainerRef.current.innerHTML = "";

      const visualConfig = {
        style: {
          theme: "bootstrap",
          customVariables: {
            baseColor: "#C792DF",
            baseColorFirstVariant: "#B370D4",
            baseColorSecondVariant: "#9C4CBD",
            buttonTextColor: "#ffffff",
            borderRadiusMedium: "10px",
            borderRadiusSmall: "6px",
            borderRadiusLarge: "14px",
          },
        },
      };

      const customizationConfig: any = isCard
        ? {
          visual: visualConfig,
          paymentMethods: {
            maxInstallments: 12,
          },
        }
        : {
          visual: visualConfig,
          paymentMethods: {
            bankTransfer: "all", // PSE
          },
        };

      try {
        const controller = await bricksBuilder.create(
        brickName,
        "paymentBrick_container",
        {
          initialization: {
            amount: total,
            payer: {
              email: userEmail,
            },
          },
          customization: customizationConfig,
          callbacks: {
            onReady: () => {
              console.log(`${brickName} listo`);
            },

            onSubmit: (arg1: any, arg2?: any) => {
              return new Promise<void>(async (resolve, reject) => {
                try {
                  setMountError(null);

                  // En cardPayment: arg1 es formData, arg2 es additionalData
                  // En payment (PSE): arg1 es { formData, selectedPaymentMethod }
                  const formData = arg1?.formData ?? arg1;
                  const selectedPaymentMethod = arg1?.selectedPaymentMethod ?? arg2;

                  const paymentMethodId =
                    selectedPaymentMethod?.id ??
                    formData?.paymentMethodId ??
                    formData?.payment_method_id ??
                    null;

                  console.log("formData =>", formData);
                  console.log("selectedPaymentMethod =>", selectedPaymentMethod);
                  console.log("paymentMethodId que se enviará =>", paymentMethodId);
                  console.log("installmentIdRef.current =>", installmentIdRef.current);

                  const token = localStorage.getItem("token");

                  let endpoint = "";
                  let payload: any = {};

                  // 🔹 CASO 1: PAGO DE PLAN DE ALMACENAMIENTO (NO hay booking)
                  if (storagePlanId && !bookingId) {
                    endpoint = "/api/mercadopago/storage/pay";
                    payload = {
                      storage_plan_id: storagePlanId,
                      transaction_amount: total,
                      payment_method_id: paymentMethodId,
                      token: formData?.token,
                      installments: formData?.installments,
                      payer: { email: userEmail },
                      client_payment_method: paymentMethod, // "Card" o "PSE"
                    };
                  } else {
                    // 🔹 CASO 2: PAGO DE RESERVA (booking)
                    endpoint = "/api/mercadopago/checkout/pay";
                    payload = {
                      booking_id: bookingId,
                      transaction_amount: total,
                      payment_method_id: paymentMethodId,
                      token: formData?.token,
                      installments: formData?.installments,
                      payer: { email: userEmail },
                      raw_form: formData,
                      client_payment_method: paymentMethod, // "Card" o "PSE"
                      installment_id: installmentIdRef.current ?? null,
                      storage_plan_id: storagePlanId ?? null,
                    };
                  }
                  console.log("Payload que se envía al backend:", payload);

                  const res = await axios.post(
                    `${endpoint}`,
                    payload,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                      },
                    }
                  );

                  const { status, status_detail } = res.data;

                  if (status === "approved" || status === "in_process") {
                    onSuccess();
                    resolve();
                  } else {
                    setErrorMessage(
                      `Pago con estado: ${status}. ${status_detail ? `Detalle: ${status_detail}. ` : ""
                      }Verifica tu medio de pago o intenta nuevamente.`
                    );
                    setShowErrorModal(true);
                    reject();
                  }
                } catch (err: any) {
                  console.error("ERROR PAGO MP =>", err);
                  console.log("RESPUESTA BACK =>", err?.response?.data);
                  const backendMessage =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Ocurrió un error al procesar el pago. Intenta nuevamente.";

                  setErrorMessage(backendMessage);
                  setShowErrorModal(true);

                  reject(err);
                }
              });
            },

            // onSubmit: ({
            //   formData,
            //   selectedPaymentMethod,
            // }: {
            //   formData: any;
            //   selectedPaymentMethod: any;
            // }) => {
            //   return new Promise<void>(async (resolve, reject) => {
            //     try {
            //       setMountError(null);

            //       const paymentMethodId =
            //         selectedPaymentMethod?.id ??
            //         formData?.paymentMethodId ??
            //         formData?.payment_method_id ??
            //         null;

            //       console.log("formData =>", formData);
            //       console.log("selectedPaymentMethod =>", selectedPaymentMethod);
            //       console.log("paymentMethodId que se enviará =>", paymentMethodId);
            //       console.log("installmentIdRef.current =>", installmentIdRef.current);

            //       const token = localStorage.getItem("token");

            //       let endpoint = "/api/mercadopago/checkout/pay";
            //       let payload: any = {
            //         booking_id: bookingId,
            //         transaction_amount: total,
            //         payment_method_id: paymentMethodId,
            //         token: formData?.token,
            //         installments: formData?.installments,
            //         payer: { email: userEmail },
            //         raw_form: formData,
            //         client_payment_method: paymentMethod,
            //         installment_id: installmentIdRef.current ?? null,
            //       };

            //       // 👇 SI ES COMPRA DE PLAN, USAR OTRO ENDPOINT Y OTRO PAYLOAD
            //       if (storagePlanId) {
            //         endpoint = "/api/mercadopago/storage/pay";
            //         payload = {
            //           storage_plan_id: storagePlanId,
            //           transaction_amount: total,
            //           payment_method_id: paymentMethodId,
            //           token: formData?.token,
            //           installments: formData?.installments,
            //           payer: { email: userEmail },
            //           client_payment_method: paymentMethod,
            //         };
            //       }

            //       const res = await axios.post(
            //         `${API_BASE}${endpoint}`,
            //         payload,
            //         {
            //           headers: {
            //             Authorization: `Bearer ${token}`,
            //             Accept: "application/json",
            //           },
            //         }
            //       );


            //       const { status, status_detail } = res.data;

            //       if (status === "approved" || status === "in_process") {
            //         onSuccess();
            //         resolve();
            //       } else {
            //         setErrorMessage(
            //           `Pago con estado: ${status}. ${status_detail ? `Detalle: ${status_detail}. ` : ""
            //           }Verifica tu medio de pago o intenta nuevamente.`
            //         );
            //         setShowErrorModal(true);
            //         reject();
            //       }
            //     } catch (err: any) {
            //       console.error("ERROR PAGO MP =>", err);

            //       const backendMessage =
            //         err.response?.data?.message ||
            //         err.response?.data?.error ||
            //         "Ocurrió un error al procesar el pago. Intenta nuevamente.";

            //       setErrorMessage(backendMessage);
            //       setShowErrorModal(true);

            //       reject(err);
            //     } finally {
            //       // setLoading(false);
            //     }
            //   });
            // },

            onError: (error: any) => {
              console.error("Error en Payment Brick (OBJETO COMPLETO):", error);
              console.error("Mensaje:", error?.message);
              console.error("Causa:", error?.cause);

              setErrorMessage(
                error?.message || "Ocurrió un error en el formulario de pago."
              );
              setShowErrorModal(true);
            },
          },
        }
        );
        if (cancelled) {
          try {
            await controller.unmount?.();
          } catch (e) {
            console.warn("Mercado Pago unmount on cancelled:", e);
          }
          return;
        }

        brickControllerRef.current = controller;
      } catch (err: any) {
        if (!cancelled) {
          console.error("Error creating Mercado Pago brick:", err);
        }
      }
    };

    renderPaymentBrick();

    return () => {
      cancelled = true;
      if (brickControllerRef.current) {
        try {
          brickControllerRef.current.unmount?.();
        } catch (e) {
          console.warn("Mercado Pago cleanup warning:", e);
        }
        brickControllerRef.current = null;
      }
    };
    // 👇 importante: NO incluimos installmentId aquí
  }, [total, bookingId, userEmail, onSuccess, paymentMethod, storagePlanId]);

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
        <div className="payment-card">
          <div className="payment-card-header">
            <h5 className="payment-card-title">
              <i className="bi bi-shield-check text-success me-2"></i>
              {paymentMethod === "Card" ? "Pago con Tarjeta de Crédito / Débito" : "Pago con PSE"}
            </h5>
            <span className="payment-badge-secure">
              <i className="bi bi-lock-fill me-1"></i> Transacción 100% Segura
            </span>
          </div>

          <div className="payment-amount-banner mb-3 p-3 rounded-3 d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted small d-block">
                {storagePlanId && !bookingId ? "Total del plan a pagar:" : "Monto a pagar en este paso:"}
              </span>
              <strong className="fs-5 text-purple">${total.toLocaleString("es-CO")} COP</strong>
            </div>
            <div className="d-flex gap-2">
              <i className="bi bi-credit-card-2-front fs-3 text-purple"></i>
            </div>
          </div>

          <div
            id="paymentBrick_container"
            ref={bricksContainerRef}
            className="payment-brick-container"
            translate="no"
          />
        </div>

        <PaymentErrorModal
          show={showErrorModal}
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      </div>
      <div className="payment-actions">
        <div className="d-flex justify-content-start mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2 fw-semibold"
            onClick={onBack}
          >
            <i className="bi bi-arrow-left"></i> Atrás
          </button>
        </div>
      </div>
    </>
  );
};

export default AppointmentFormStep4PaymentEmbedded;

