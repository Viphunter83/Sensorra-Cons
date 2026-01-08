import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <Sidebar className="w-full" />
            </div>
            <div className="flex-1 md:pl-64">
                <Header />
                <main className="flex-1 space-y-4 p-8 pt-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
