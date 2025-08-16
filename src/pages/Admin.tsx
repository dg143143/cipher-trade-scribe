import { AdminPanel } from "@/components/admin/AdminPanel";
import { Sidebar } from "@/components/ui/sidebar";

const AdminPage = () => {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <AdminPanel />
      </main>
    </div>
  );
};

export default AdminPage;
