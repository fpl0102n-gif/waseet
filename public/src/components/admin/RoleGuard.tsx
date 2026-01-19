import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminRole, AdminRole } from '@/hooks/useAdminRole';
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles?: AdminRole[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const { role, isActive, loading } = useAdminRole();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!role) {
                // Not an admin at all
                navigate('/admin'); // Redirect to login
                return;
            }

            if (!isActive) {
                // Admin but disabled
                navigate('/admin'); // Or some 'account disabled' page
                return;
            }

            if (allowedRoles && !allowedRoles.includes(role)) {
                // Wrong role
                navigate('/admin/dashboard'); // Safe fallback
            }
        }
    }, [role, isActive, loading, navigate, allowedRoles]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Double check render logic to avoid flash of content
    if (!role || !isActive) return null;
    if (allowedRoles && !allowedRoles.includes(role)) return null;

    return <>{children}</>;
};
