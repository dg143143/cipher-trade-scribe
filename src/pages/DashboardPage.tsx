import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const DashboardPage = () => {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return <Dashboard />;
}

export default DashboardPage;
