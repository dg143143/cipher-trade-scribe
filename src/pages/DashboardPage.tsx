import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import { MatrixRain } from '@/components/ui/matrix-rain';

const DashboardPage = () => {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
                <MatrixRain />
                <div className="relative z-10 text-emerald-400 font-trading text-xl">
                    LOADING DASHBOARD...
                </div>
            </div>
        );
    }

    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return <Dashboard />;
};

export default DashboardPage;
