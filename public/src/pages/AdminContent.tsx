
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";

const AdminContent = () => {
    const pages = [
        { title: "Home Page", path: "/", description: "Main landing page" },
        { title: "Privacy Policy", path: "/privacy", description: "Legal data protection policy" },
        { title: "Terms & Conditions", path: "/terms", description: "User agreement and rules" },
        { title: "FAQ", path: "/faq", description: "Frequently Asked Questions" },
        { title: "About Us", path: "/about", description: "Company information" },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Content Management</h1>
                    <p className="text-gray-500">Manage static pages and platform content.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pages.map((page) => (
                        <Card key={page.path} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    {page.title}
                                </CardTitle>
                                <CardDescription>{page.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href={page.path} target="_blank" rel="noreferrer">
                                            View Page <ExternalLink className="w-3 h-3 ml-2" />
                                        </a>
                                    </Button>
                                    {/* Future: Add Edit button here when CMS is built */}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader>
                        <CardTitle className="text-blue-800">Note for Admin</CardTitle>
                    </CardHeader>
                    <CardContent className="text-blue-700">
                        Currently, these pages are static code files. To edit the text content, you need to ask your developer or update the code files directly. A dynamic CMS can be implemented in the future.
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminContent;
