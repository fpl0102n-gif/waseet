import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AdminRole = 'super_admin' | 'humanitarian_admin' | null;

interface AdminRoleState {
    role: AdminRole;
    isActive: boolean;
    loading: boolean;
    isSuperAdmin: boolean;
    isHumanitarianAdmin: boolean;
}

export const useAdminRole = () => {
    const [state, setState] = useState<AdminRoleState>({
        role: null,
        isActive: false,
        loading: true,
        isSuperAdmin: false,
        isHumanitarianAdmin: false,
    });

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setState(prev => ({ ...prev, loading: false }));
                    return;
                }

                const { data, error } = await supabase
                    .from('user_roles')
                    .select('role, is_active')
                    .eq('user_id', user.id)
                    .single();

                if (error || !data) {
                    console.error('Error fetching admin role:', error);
                    setState(prev => ({ ...prev, loading: false }));
                    return;
                }

                const role = data.role as AdminRole;
                const isActive = data.is_active ?? true;

                setState({
                    role,
                    isActive,
                    loading: false,
                    isSuperAdmin: role === 'super_admin' && isActive,
                    isHumanitarianAdmin: role === 'humanitarian_admin' && isActive,
                });

            } catch (error) {
                console.error('Error in useAdminRole:', error);
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        fetchRole();
    }, []);

    return state;
};
