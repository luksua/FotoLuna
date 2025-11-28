<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Recibo de Cuota #{{ $installment->id }} – FL-{{ $booking->bookingId }}</title>

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
        .logo {
            width: 180px;
            margin-bottom: 10px;
        }
        h1 {
            font-size: 20px;
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
            text-transform: uppercase;
            margin-bottom: 6px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            padding: 4px 0;
        }
        .border-top {
            border-top: 1px solid #ddd;
            padding-top: 10px;
            margin-top: 10px;
        }
        .text-right { text-align: right; }
    </style>
</head>

<body>
<div class="wrapper">

    {{-- LOGO --}}
    <div style="text-align:center;">
        <img class="logo" src="{{ public_path('img/logo.png') }}" alt="Logo">

        <h1>Recibo de Pago – Cuota #{{ $installment->id }}</h1>

        <p class="muted">
            Booking FL-{{ $booking->bookingId }}<br>
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

    {{-- DETALLES DE LA CUOTA --}}
    <div class="section">
        <div class="section-title">Detalle de la cuota</div>

        <table>
            <tr>
                <td>Cuota N°:</td>
                <td>{{ $installment->id }}</td>
            </tr>
            <tr>
                <td>Monto:</td>
                <td>${{ number_format($installment->amount, 0, ',', '.') }} COP</td>
            </tr>
            <tr>
                <td>Fecha de vencimiento:</td>
                <td>{{ $installment->due_date }}</td>
            </tr>
            <tr>
                <td>Estado:</td>
                <td>
                    @if($installment->status === 'paid')
                        Pagada
                    @elseif($installment->status === 'overdue')
                        Vencida
                    @else
                        Pendiente
                    @endif
                </td>
            </tr>
        </table>
    </div>

    {{-- PAGO --}}
    <div class="section">
        <div class="section-title">Pago</div>

        <table>
            <tr>
                <td>Fecha de pago:</td>
                <td>{{ $installment->paid_at ?? '—' }}</td>
            </tr>

            @if($lastPayment)
                <tr>
                    <td>Método:</td>
                    <td>{{ $lastPayment->paymentMethod ?? '—' }}</td>
                </tr>
                <tr>
                    <td>ID transacción MP:</td>
                    <td>{{ $lastPayment->mp_payment_id ?? '—' }}</td>
                </tr>
            @endif
        </table>

        <div class="border-top text-right">
            <strong>
                Total pagado:
                ${{ number_format($installment->amount, 0, ',', '.') }} COP
            </strong>
        </div>
    </div>

    {{-- PIE --}}
    <div style="margin-top:30px; text-align:center;">
        <p class="muted" style="font-size:10px;">
            Este documento es generado automáticamente y no requiere firma física.<br>
            Para dudas o reclamos: soporte@fotoluna.com
        </p>
    </div>

</div>
</body>
</html>
