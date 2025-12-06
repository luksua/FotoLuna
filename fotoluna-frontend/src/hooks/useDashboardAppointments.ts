import { useEffect, useState } from 'react';
import { getNextAppointment, getPendingAppointmentsCount, getCancelledAppointmentsCount, getBookedPackagesCount, type AdminAppointment } from '../services/appointmentService';

export const useDashboardAppointments = () => {
    const [pendingCount, setPendingCount] = useState(0);
    const [cancelledCount, setCancelledCount] = useState(0);
    const [bookedPackagesCount, setBookedPackagesCount] = useState(0);
    const [nextAppointment, setNextAppointment] = useState<AdminAppointment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [pending, cancelled, packages, next] = await Promise.all([
                    getPendingAppointmentsCount(),
                    getCancelledAppointmentsCount(),
                    getBookedPackagesCount(),
                    getNextAppointment()
                ]);

                console.log("nextAppointment desde hook:", next); // 👈

                setPendingCount(pending);
                setCancelledCount(cancelled);
                setBookedPackagesCount(packages);
                setNextAppointment(next);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return {
        pendingCount,
        cancelledCount,
        bookedPackagesCount,
        nextAppointment,
        loading,
        formatDate
    };
};
