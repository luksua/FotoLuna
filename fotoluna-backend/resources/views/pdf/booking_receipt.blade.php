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
        }
        .wrapper {
            max-width: 700px;
            margin: 0 auto;
        }
        h1 {
            font-size: 20px;
            margin-bottom: 5px;
        }
        .muted {
            color: #777;
            font-size: 11px;
        }
        .section {
            margin-top: 20px;
        }
        .section-title {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 11px;
            margin-bottom: 6px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            padding: 4px 0;
            vertical-align: top;
        }
        .text-right {
            text-align: right;
        }
        .border-top {
            border-top: 1px solid #eee;
            margin-top: 10px;
            padding-top: 10px;
        }
    </style>
</head>
<body>
<div class="wrapper">

    {{-- ENCABEZADO CON LOGO --}}
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{ public_path('img/logo.png') }}" alt="Logo" style="width: 200px; margin-bottom: 10px;">

        <h1 style="margin: 0; font-size: 20px;">Recibo de Pago</h1>
        <p class="muted" style="margin: 4px 0 0;">
            Booking ID: FL-{{ $booking->bookingId }}
        </p>
        <p style="margin: 0; font-size: 12px; color: #777;">
            FotoLuna • NIT 900.123.456-7<br>
            Ibagué, Colombia<br>
            contacto@fotoluna.com | www.fotoluna.com
        </p>
    </div>

    @php
        $customer = $booking->appointment?->customer;
        $customerName = trim(
            ($customer->firstNameCustomer ?? '') . ' ' . ($customer->lastNameCustomer ?? '')
        );
        if ($customerName === '') {
            $customerName = 'Cliente';
        }
    @endphp

    {{-- CLIENTE --}}
    <div class="section">
        <div class="section-title">Cliente</div>
        <p>
            {{ $customerName }}<br>
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
                <td>
                    {{ $booking->appointment?->event?->eventType ?? 'Sesión fotográfica' }}
                </td>
            </tr>
            <tr>
                <td>Paquete:</td>
                <td>
                    {{ $booking->package?->packageName ?? 'Paquete seleccionado' }}
                </td>
            </tr>
        </table>
    </div>

    {{-- PLAN DE ALMACENAMIENTO --}}
    @if($storageSubscription)
        <div class="section">
            <div class="section-title">Plan de almacenamiento</div>
            <p>
                {{ optional($storageSubscription->plan)->name ?? '' }}
                @if(!is_null($storageSubscription->duration_months ?? null))
                    · {{ $storageSubscription->duration_months }} meses
                @endif
            </p>
        </div>
    @endif

    {{-- PAGO --}}
    <div class="section">
        <div class="section-title">Pago</div>
        <table>
            <tr>
                <td>Fecha de pago:</td>
                <td>{{ optional($lastPayment)->paymentDate }}</td>
            </tr>
            <tr>
                <td>Método:</td>
                <td>{{ optional($lastPayment)->paymentMethod }}</td>
            </tr>
            <tr>
                <td>Estado:</td>
                <td>{{ optional($lastPayment)->paymentStatus }}</td>
            </tr>
            <tr>
                <td>ID transacción MP:</td>
                <td>{{ optional($lastPayment)->mp_payment_id }}</td>
            </tr>
        </table>

        <div class="border-top text-right">
            <strong>
                Total pagado:
                ${{ number_format(optional($lastPayment)->amount ?? 0, 0, ',', '.') }} COP
            </strong>
        </div>
    </div>

    {{-- FIRMA / PIE --}}
    <div style="margin-top: 40px; text-align: center;">
        <img src="{{ public_path('img/firma.png') }}" alt="Firma" style="width: 230px; opacity: 0.8;">
        <p style="font-size: 12px; margin-top: 5px;">Responsable de FotoLuna</p>

        <p style="font-size: 10px; color: #777; margin-top: 20px;">
            Este documento es generado automáticamente y no requiere firma física.<br>
            Para dudas o reclamos comunícate con soporte@fotoluna.com
        </p>
    </div>
</div>
</body>
</html>
