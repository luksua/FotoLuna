<?php
namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingPaymentInstallment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingInstallmentController extends Controller
{
    public function createInstallmentsPlan(Request $request, $bookingId)
    {
        // 1) Buscar booking y verificar que pertenece al usuario logueado
        $booking = Booking::with(['appointment.customer', 'installments'])
            ->findOrFail($bookingId);

        $user = $request->user();
        if (
            !$user
            || !$user->customer
            || $user->customer->customerId !== $booking->appointment->customerIdFK
        ) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // 2) Validar datos
        $data = $request->validate([
            'total_amount' => 'required|numeric|min:0.01',
            'mode' => 'required|in:full,partial', // full = pago total, partial = abono
            'deposit_amount' => 'required|numeric|min:0.01',
            'deposit_due_date' => 'required|date',
            'remaining_due_date' => 'nullable|date|after_or_equal:deposit_due_date',
        ]);

        $total = (float) $data['total_amount'];
        $deposit = (float) $data['deposit_amount'];

        // 💡 Regla general: el abono nunca puede ser > total
        if ($deposit > $total) {
            return response()->json([
                'message' => 'El abono no puede ser mayor que el total.',
            ], 422);
        }

        // 💡 Reglas extra solo para modo "partial"
        if ($data['mode'] === 'partial') {
            // mínimo 20% del total
            $minDeposit = $total * 0.20;
            if ($deposit < $minDeposit) {
                return response()->json([
                    'message' => 'El abono debe ser al menos el 20% del total.',
                ], 422);
            }

            if ($deposit >= $total) {
                return response()->json([
                    'message' => 'El abono debe ser menor que el total.',
                ], 422);
            }
        }

        return DB::transaction(function () use ($booking, $data, $total, $deposit) {

            // 3) Borrar cuotas anteriores (plan nuevo)
            $booking->installments()->delete();

            $installments = collect();

            if ($data['mode'] === 'full') {
                // ✅ 1 sola cuota por el total (o el monto que le mandes como deposit_amount)
                $due = Carbon::parse($data['deposit_due_date']);

                $ins = $booking->installments()->create([
                    'number' => 1,
                    'amount' => $total,     // o $deposit si quieres que sea flexible
                    'due_date' => $due,
                    'status' => 'pending',
                    'paymentIdFK' => null,
                ]);

                $installments->push($ins);

            } else {
                // ✅ Abono + saldo
                $remaining = max(0, $total - $deposit);

                $depositDue = Carbon::parse($data['deposit_due_date']);

                // Si no te enviaron fecha de saldo, por defecto el día de la cita o +7 días
                $remainingDue = !empty($data['remaining_due_date'])
                    ? Carbon::parse($data['remaining_due_date'])
                    : ($booking->appointment?->appointmentDate
                        ? Carbon::parse($booking->appointment->appointmentDate)
                        : $depositDue->copy()->addDays(7));

                // Cuota 1: abono
                $ins1 = $booking->installments()->create([
                    'number' => 1,
                    'amount' => $deposit,
                    'due_date' => $depositDue,
                    'status' => 'pending',
                    'paymentIdFK' => null,
                ]);
                $installments->push($ins1);

                // Cuota 2: saldo
                if ($remaining > 0) {
                    $ins2 = $booking->installments()->create([
                        'number' => 2,
                        'amount' => $remaining,
                        'due_date' => $remainingDue,
                        'status' => 'pending',
                        'paymentIdFK' => null,
                    ]);
                    $installments->push($ins2);
                }
            }

            $first = $installments->first();

            // 4) Respuesta
            return response()->json([
                'message' => 'Plan de cuotas creado/actualizado correctamente',
                'mode' => $data['mode'],
                'total_amount' => $total,
                'deposit_amount' => $deposit,
                'first_installment_id' => $first?->id,
                'installments' => $installments->map(
                    function (BookingPaymentInstallment $ins) {
                        return [
                            'id' => $ins->id,
                            'number' => $ins->number,
                            'amount' => (float) $ins->amount,
                            'due_date' => $ins->due_date ? Carbon::parse($ins->due_date)->toDateString() : null,
                            'status' => $ins->status,
                        ];
                    }
                )->values(),
            ], 201);
        });
    }
}
