
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col lg:flex-row">
            <AdminSidebar />
            <main className="flex-1 lg:pl-72 w-full">
                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
            <Toaster />
            <Sonner />
        </div>
    );
};
