@component('mail::message')
# ¡Tu sesión ha sido reservada!

Hola {{ $booking->appointment?->customer?->nameCustomer ?? 'cliente' }},

Tu sesión de fotos ha sido confirmada. Aquí un resumen:

- **Fecha:** {{ $booking->appointment?->date }}
- **Hora:** {{ $booking->appointment?->time }}
- **Lugar:** {{ $booking->appointment?->place }}
- **Evento:** {{ $booking->event->name ?? 'Sesión fotográfica' }}
- **Paquete:** {{ $booking->package->name ?? 'Paquete seleccionado' }}

@isset($storageSubscription)
    - **Plan de almacenamiento:** {{ $storageSubscription->plan->name ?? '' }}
    ({{ $storageSubscription->duration_months }} meses)
@endisset

- **Estado de pago:** {{ $lastPayment->paymentStatus ?? '—' }}
- **Total pagado:** ${{ number_format($lastPayment->amount ?? 0, 0, ',', '.') }} COP
- **Booking ID:** FL-{{ $booking->bookingId }}

Puedes descargar tu recibo en el archivo adjunto.

Gracias por reservar con **FotoLuna** 

@endcomponent