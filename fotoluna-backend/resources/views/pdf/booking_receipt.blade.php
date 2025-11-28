<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Recibo FL-{{ $booking->bookingId }}</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #333;
            margin: 0;
            padding: 20px;
        }

        .wrapper {
            width: 100%;
            max-width: 700px;
            margin: 0 auto;
        }

        h1 {
            font-size: 22px;
            margin: 0 0 5px;
            text-align: center;
        }

        .muted {
            color: #666;
            font-size: 11px;
            text-align: center;
        }

        .section {
            margin-top: 25px;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 6px;
            text-transform: uppercase;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            padding: 4px 0;
        }

        .border-top {
            border-top: 1px solid #DDD;
            padding-top: 10px;
            margin-top: 10px;
        }

        .text-right {
            text-align: right;
        }

        .logo {
            width: 180px;
            margin-bottom: 5px;
        }
    </style>
</head>

<body>
    <div class="wrapper">

        {{-- LOGO --}}
        <div style="text-align: center; margin-bottom: 15px;">
            <img class="logo" src="{{ public_path('img/logo.png') }}" alt="Logo">

            <h1>Recibo de Pago</h1>

            <p class="muted">
                Booking ID: FL-{{ $booking->bookingId }}<br>
                FotoLuna • Ibagué, Colombia<br>
                contacto@fotoluna.com
            </p>
        </div>

        {{-- CLIENTE --}}
        @php
            $name = trim(($customer->firstNameCustomer ?? '') . ' ' . ($customer->lastNameCustomer ?? ''));
        @endphp

        <div class="section">
            <div class="section-title">Cliente</div>
            <p>
                {{ $name ?: 'Cliente' }}<br>
                {{ $customer->emailCustomer ?? '' }}
            </p>
        </div>

        {{-- DETALLES DE LA SESIÓN --}}
        <div class="section">
            <div class="section-title">Detalles de la sesión</div>
            <table>
                <tr>
                    <td>Fecha:</td>
                    <td>{{ $booking->appointment?->appointmentDate }}</td>
                </tr>
                <tr>
                    <td>Hora:</td>
                    <td>{{ $booking->appointment?->appointmentTime }}</td>
                </tr>
                <tr>
                    <td>Lugar:</td>
                    <td>{{ $booking->appointment?->place }}</td>
                </tr>
                <tr>
                    <td>Evento:</td>
                    <td>{{ $booking->appointment?->event?->eventType }}</td>
                </tr>
                <tr>
                    <td>Paquete:</td>
                    <td>{{ $booking->package?->packageName }}</td>
                </tr>
            </table>
        </div>

        {{-- PAGO --}}
        <div class="section">
            <div class="section-title">Pago</div>

            <table>
                <tr>
                    <td>Fecha de pago:</td>
                    <td>{{ $lastPayment->paid_at ?? '—' }}</td>
                </tr>
                <tr>
                    <td>Método:</td>
                    <td>{{ $lastPayment->paymentMethod ?? '—' }}</td>
                </tr>
                <tr>
                    <td>Estado:</td>
                    <td>{{ $lastPayment->paymentStatus ?? '—' }}</td>
                </tr>
                <tr>
                    <td>ID transacción MP:</td>
                    <td>{{ $lastPayment->mp_payment_id ?? '—' }}</td>
                </tr>
            </table>

            <div class="border-top text-right">
                <strong>
                    Total del servicio:
                    ${{ number_format($totalService ?? 0, 0, ',', '.') }} COP
                </strong><br>
                <strong>
                    Total pagado:
                    ${{ number_format($totalPaid ?? 0, 0, ',', '.') }} COP
                </strong>
            </div>
        </div>

        {{-- PIE --}}
        <div style="margin-top: 35px; text-align: center;">
            <p class="muted" style="font-size: 10px;">
                Este documento es generado automáticamente y no requiere firma física.<br>
                Para dudas comunícate con soporte@fotoluna.com
            </p>
        </div>

    </div>
</body>

</html>