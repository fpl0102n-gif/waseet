import { Link, useLocation } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdminRole";
import {
    LayoutDashboard,
    Heart,
    Droplet,
    Truck,
    ShoppingBag,
    Repeat,
    FileText,
    Users,
    Settings,
    X,
    Menu,
    BarChart,
    LogOut,
    Gift
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

export const AdminSidebar = () => {
    const { isSuperAdmin, isHumanitarianAdmin } = useAdminRole();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);

    const isActive = (path: string) => location.pathname === path;

    // Define all items first
    const allMenuItems = [
        {
            title: "Overview",
            items: [
                { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard", allowed: true }, // Everyone
            ],
        },
        {
            title: "Humanitarian",
            items: [
                { icon: Heart, label: "Alkhayr Requests", href: "/admin/alkhayr", allowed: true }, // Everyone
                { icon: Droplet, label: "Blood Donation", href: "/admin/blood", allowed: true }, // Everyone
                { icon: Truck, label: "Transport Volunteers", href: "/admin/transport", allowed: true }, // Everyone
                { icon: Gift, label: "Material Donations", href: "/admin/material-donations", allowed: true }, // Everyone
            ],
        },
        {
            title: "Commerce & Brokerage",
            items: [
                { icon: ShoppingBag, label: "Orders", href: "/admin/orders", allowed: isSuperAdmin },
                { icon: ShoppingBag, label: "Store", href: "/admin/store", allowed: isSuperAdmin },
                { icon: ShoppingBag, label: "Import Requests", href: "/admin/import-requests", allowed: isSuperAdmin },
                { icon: ShoppingBag, label: "Product Suggestions", href: "/admin/product-suggestions", allowed: isSuperAdmin },
                { icon: Users, label: "Agents", href: "/admin/agent-registrations", allowed: isSuperAdmin },
                { icon: Users, label: "Referrals", href: "/admin/referrals", allowed: isSuperAdmin },
            ],
        },
        {
            title: "Currency Exchange",
            items: [
                { icon: Repeat, label: "Exchange Requests", href: "/admin/exchange", allowed: isSuperAdmin },
                { icon: Repeat, label: "Exchange Rates", href: "/admin/exchange-rates", allowed: isSuperAdmin },
            ],
        },
        {
            title: "Content & Pages",
            items: [
                { icon: FileText, label: "Static Content", href: "/admin/content", allowed: isSuperAdmin },
            ],
        },
        {
            title: "Users & Admins",
            items: [
                { icon: Users, label: "User Management", href: "/admin/users", allowed: isSuperAdmin },
            ],
        },
        {
            title: "Settings & Config",
            items: [
                { icon: Settings, label: "Platform Settings", href: "/admin/settings", allowed: isSuperAdmin },
            ],
        },
        {
            title: "Analytics & Logs",
            items: [
                { icon: BarChart, label: "System Analytics", href: "/admin/analytics", allowed: isSuperAdmin },
            ],
        },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
            </div>

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="h-16 flex items-center px-6 border-b">
                        <span className="text-xl font-bold text-primary">Admin Panel</span>
                        {isHumanitarianAdmin && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                                Humanitarian
                            </span>
                        )}
                        {isSuperAdmin && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full border border-red-200">
                                Super Admin
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                        <nav className="space-y-6 px-4">
                            {allMenuItems.map((section, idx) => {
                                // Filter items based on permissions
                                const allowedItems = section.items.filter(item => item.allowed);

                                if (allowedItems.length === 0) return null;

                                return (
                                    <div key={idx}>
                                        <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {section.title}
                                        </h3>
                                        <div className="space-y-1">
                                            {allowedItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    to={item.href}
                                                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                        }`}
                                                >
                                                    <item.icon className="mr-3 h-5 w-5" />
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-4 border-t">
                        <Link
                            to="/"
                            className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Exit to Main Site
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};
