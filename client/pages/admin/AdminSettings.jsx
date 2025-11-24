import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    contactPhone: "",
  });

  useEffect(() => {
    const { isSuperUser: superUser, hasAccess } = checkAdminAccess();

    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setIsSuperUser(superUser);
    loadSettings();
  }, [navigate]);

  const loadSettings = async () => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error("Error loading settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert("Настройки сохранены");
      } else {
        alert("Ошибка при сохранении");
      }
    } catch (e) {
      console.error("Error saving settings:", e);
      alert("Ошибка при сохранении");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6F2A2B]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader isSuperUser={isSuperUser} />
      <div className="flex">
        <AdminSidebar isSuperUser={isSuperUser} />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Настройки</h1>

            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Основные настройки</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название сайта
                    </label>
                    <Input
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Описание сайта
                    </label>
                    <textarea
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email для связи
                    </label>
                    <Input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Телефон для связи
                    </label>
                    <Input
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSave}
                  className="bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить настройки
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

