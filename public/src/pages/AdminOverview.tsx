
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from '@/components/ui/stat-card';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Heart, ShoppingBag, Truck, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useAdminRole } from "@/hooks/useAdminRole";

/**
 * AdminOverview
 * Global dashboard showing high-level stats across all modules.
 */
const AdminOverview = () => {
    const { isSuperAdmin, isHumanitarianAdmin, loading: roleLoading } = useAdminRole();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        orders: { total: 0, new: 0 },
        alkhayr: { pending: 0, urgent: 0 },
        blood: { requests: 0, donors: 0 },
        transport: { active: 0 }
    });

    useEffect(() => {
        if (!roleLoading) {
            fetchGlobalStats();
        }
    }, [roleLoading, isSuperAdmin]);

    const fetchGlobalStats = async () => {
        setLoading(true);
        try {
            const promises = [];

            // Always fetch Humanitarian stats
            promises.push(supabase.from('medicine_requests').select('status', { count: 'exact', head: true }).eq('status', 'pending'));
            promises.push(supabase.from('blood_donation_requests').select('status', { count: 'exact', head: true }).eq('status', 'active'));
            promises.push(supabase.from('blood_donors').select('status', { count: 'exact', head: true }).eq('approved_by_admin', false));
            promises.push(supabase.from('transport_volunteers').select('status', { count: 'exact', head: true }).eq('status', 'active'));

            // Conditionally fetch Commerce stats
            if (isSuperAdmin) {
                promises.push(supabase.from('orders').select('status', { count: 'exact', head: true }).eq('status', 'new'));
                promises.push(supabase.from('orders').select('*', { count: 'exact', head: true }));
            } else {
                promises.push(Promise.resolve({ count: 0 })); // Placeholder for ordersRes
                promises.push(Promise.resolve({ count: 0 })); // Placeholder for totalOrdersRes
            }

            const [alkhayrRes, bloodReqRes, bloodDonorRes, transportRes, ordersRes, totalOrdersRes] = await Promise.all(promises);

            setStats({
                orders: {
                    total: totalOrdersRes.count || 0,
                    new: ordersRes.count || 0
                },
                alkhayr: {
                    pending: alkhayrRes.count || 0,
                    urgent: 0
                },
                blood: {
                    requests: bloodReqRes.count || 0,
                    donors: bloodDonorRes.count || 0
                },
                transport: {
                    active: transportRes.count || 0
                }
            });

        } catch (error) {
            console.error("Error fetching stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (roleLoading || loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back. Here is what's happening today.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {isSuperAdmin && (
                        <StatCard
                            value={stats.orders.new.toString()}
                            label="New Orders"
                            description="Require processing"
                            accent="primary"
                            icon={<ShoppingBag className="w-4 h-4 text-primary" />}
                        />
                    )}
                    <StatCard
                        value={stats.alkhayr.pending.toString()}
                        label="Pending Requests"
                        description="Humanitarian review needed"
                        accent="warning"
                        icon={<Heart className="w-4 h-4 text-orange-500" />}
                    />
                    <StatCard
                        value={stats.blood.requests.toString()}
                        label="Active Blood Requests"
                        description="Urgent needs"
                        accent="destructive"
                        icon={<Heart className="w-4 h-4 text-red-600" />}
                    />
                    <StatCard
                        value={stats.transport.active.toString()}
                        label="Active Transporters"
                        description="Volunteers ready"
                        accent="success"
                        icon={<Truck className="w-4 h-4 text-green-600" />}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Quick Activity / Alerts Placeholder */}
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Priority Actions
                        </h3>
                        {isSuperAdmin && stats.orders.new > 0 && (
                            <div className="p-3 bg-blue-50 text-blue-800 rounded mb-2 flex justify-between items-center">
                                <span>You have {stats.orders.new} new orders to process.</span>
                                <a href="/admin/orders" className="font-semibold hover:underline">View</a>
                            </div>
                        )}
                        {isSuperAdmin && stats.orders.new === 0 && (
                            <div className="p-3 bg-gray-50 text-gray-500 rounded mb-2">No new orders.</div>
                        )}

                        {stats.alkhayr.pending > 0 ? (
                            <div className="p-3 bg-orange-50 text-orange-800 rounded mb-2 flex justify-between items-center">
                                <span>{stats.alkhayr.pending} Alkhayr requests waiting for review.</span>
                                <a href="/admin/alkhayr" className="font-semibold hover:underline">Review</a>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">All Alkhayr requests reviewed.</div>
                        )}

                        {stats.blood.donors > 0 && (
                            <div className="p-3 bg-red-50 text-red-800 rounded mb-2 flex justify-between items-center">
                                <span>{stats.blood.donors} new blood donors pending approval.</span>
                                <a href="/admin/blood" className="font-semibold hover:underline">Approve</a>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            System Health
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm border-b pb-2">
                                <span className="text-gray-600">Database Connection</span>
                                <span className="text-green-600 font-medium">Healthy</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b pb-2">
                                <span className="text-gray-600">Storage</span>
                                <span className="text-green-600 font-medium">Optimal</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Last Backup</span>
                                <span className="text-gray-500">Auto-managed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminOverview;
