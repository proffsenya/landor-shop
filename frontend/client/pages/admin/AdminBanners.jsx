import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";
import { initNotifications } from "@/utils/notifications";
import { safeError } from "@/utils/logger";
import { ToastMotion } from "@/utils/PageAnimations";
import { handleApiError } from "@/utils/errorMessages";
import { Plus, Trash2, Image as ImageIcon, Upload, X } from "lucide-react";

export default function AdminBanners() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success", show: false });
  const [homeBanners, setHomeBanners] = useState([]); // Баннеры на главной странице (максимум 2)

  useEffect(() => {
    const { isStaff: staff, isSuperUser: superUser, hasAccess } = checkAdminAccess();

    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setIsStaff(staff);
    setIsSuperUser(superUser);
    loadBanners();

    // Инициализируем систему уведомлений
    const adminToken = getAdminToken();
    let cleanupNotifications = null;
    if (adminToken && (staff || superUser)) {
      initNotifications(adminToken, staff, superUser).then((cleanup) => {
        cleanupNotifications = cleanup;
      }).catch((e) => {
        safeError("Error initializing notifications:", e);
      });
    }

    // Cleanup при размонтировании
    return () => {
      if (cleanupNotifications) {
        cleanupNotifications();
      }
    };
  }, [navigate]);

  const showToast = (message, type = "success") => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: "", type: "success", show: false }), 3000);
  };

  const loadBanners = async () => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch("/api/banners", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        const allBanners = Array.isArray(data) ? data : [];
        setBanners(allBanners);
        
        // Все баннеры из API идут на главную (максимум 3: первый + еще 2)
        setHomeBanners(allBanners.slice(0, 3));
      } else {
        safeError("Error loading banners:", res.status);
        showToast("Ошибка при загрузке баннеров", "error");
      }
    } catch (e) {
      safeError("Error loading banners:", e);
      showToast("Ошибка при загрузке баннеров", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast("Выберите файл для загрузки", "error");
      return;
    }

    // Проверяем лимит баннеров (максимум 3)
    if (banners.length >= 3) {
      showToast("Можно загрузить максимум 3 баннера. Удалите один перед загрузкой нового", "error");
      return;
    }

    try {
      setUploading(true);
      const adminToken = getAdminToken();
      
      const formData = new FormData();
      
      // Добавляем файл с явным указанием Content-Type
      // Если у файла нет типа, определяем по расширению или используем image/jpeg по умолчанию
      let fileToUpload = selectedFile;
      if (!selectedFile.type) {
        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
        const mimeTypes = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp'
        };
        const mimeType = mimeTypes[fileExtension] || 'image/jpeg';
        fileToUpload = new File([selectedFile], selectedFile.name, { type: mimeType });
      }
      formData.append("file", fileToUpload);
      
      // Добавляем JSON с явным указанием Content-Type
      const bannerDtoBlob = new Blob([JSON.stringify({ isActive: true })], { type: 'application/json' });
      formData.append("bannerDto", bannerDtoBlob);

      const res = await fetch("/api/banners", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      if (res.ok) {
        const newBanner = await res.json();
        setBanners([...banners, newBanner]);
        setSelectedFile(null);
        setShowUploadForm(false);
        showToast("Баннер успешно загружен");
      } else {
        const errorMessage = await handleApiError(res, "загрузку", "баннер");
        showToast(errorMessage, "error");
      }
    } catch (e) {
      safeError("Error uploading banner:", e);
      const errorMessage = await handleApiError(e, "загрузку", "баннер");
      showToast(errorMessage, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (bannerId) => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/banners/${bannerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        const updatedBanners = banners.filter((b) => b.id !== bannerId);
        setBanners(updatedBanners);
        // Обновляем баннеры на главной (первые 3)
        setHomeBanners(updatedBanners.slice(0, 3));
        showToast("Баннер успешно удален");
      } else {
        const errorMessage = await handleApiError(res, "удаление", "баннер");
        showToast(errorMessage, "error");
      }
    } catch (e) {
      safeError("Error deleting banner:", e);
      const errorMessage = await handleApiError(e, "удаление", "баннер");
      showToast(errorMessage, "error");
    }
  };


  const getImageUrl = (banner) => {
    if (banner.imageUrl) {
      return banner.imageUrl;
    }
    if (banner.id) {
      return `/api/banners/${banner.id}/image`;
    }
    return null;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6F2A2B]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader 
        isSuperUser={isSuperUser} 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex">
        <AdminSidebar 
          isSuperUser={isSuperUser}
          isStaff={isStaff}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 lg:w-auto">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between sm:mb-6">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Баннеры</h1>
              <Button
                onClick={() => setShowUploadForm(true)}
                className="bg-[#6F2A2B] text-white hover:bg-[#5a2223] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Загрузить баннер</span>
                <span className="sm:hidden">Загрузить</span>
              </Button>
            </div>

            {/* Информация о баннерах на главной странице */}
            <div className="p-4 mb-6 bg-white rounded-lg shadow sm:p-6">
              <h2 className="mb-4 text-lg font-semibold">Баннеры на главной странице</h2>
              
              <div className="p-3 mb-4 border border-blue-200 rounded bg-blue-50">
                <p className="text-sm text-blue-800">
                  <strong>Примечание:</strong> Первый баннер нельзя удалить. 
                  Все баннеры из API автоматически отображаются на главной (максимум 3 баннера: первый + еще 2).
                </p>
              </div>
              
              <div className="space-y-2">
                {/* Баннеры из API */}
                {homeBanners.map((banner, index) => {
                  const imageUrl = getImageUrl(banner);
                  const displayIndex = index + 1;
                  const isFirstBanner = index === 0;
                  return (
                    <div key={banner.id} className="flex items-center gap-3 p-2 rounded bg-gray-50">
                      <span className="w-8 text-xs font-medium text-gray-600">#{displayIndex}</span>
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={banner.fileName}
                          className="object-cover w-12 h-12 rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      )}
                      <span className="flex-1 text-sm text-gray-900">{banner.fileName || `Баннер #${banner.id}`}</span>
                      {isFirstBanner && (
                        <span className="text-xs text-gray-500">Нельзя удалить</span>
                      )}
                    </div>
                  );
                })}
                
                {homeBanners.length === 0 && (
                  <p className="text-sm italic text-gray-500">Нет баннеров. Загрузите первый баннер выше (максимум 3).</p>
                )}
                
                {banners.length >= 3 && (
                  <p className="mt-2 text-sm italic text-yellow-600">
                    ⚠️ У вас уже загружено {banners.length} баннера(ов). Максимум 3 баннера будут отображаться на главной странице. Размер баннера: 1920x600
                  </p>
                )}
              </div>
            </div>

            {/* Форма загрузки */}
            {showUploadForm && (
              <div className="p-4 mb-6 bg-white rounded-lg shadow sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold sm:text-xl">Загрузить новый баннер</h2>
                  <button
                    onClick={() => {
                      setShowUploadForm(false);
                      setSelectedFile(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Выберите изображение
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
                    />
                    {selectedFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Выбран файл: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="bg-[#6F2A2B] text-white hover:bg-[#5a2223] w-full sm:w-auto"
                    >
                      {uploading ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Загрузка...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Загрузить
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowUploadForm(false);
                        setSelectedFile(null);
                      }}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Список баннеров */}
            <div className="overflow-hidden bg-white rounded-lg shadow">
              {banners.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="mb-2 text-lg font-medium">Нет загруженных баннеров</p>
                  <p className="text-sm">Загрузите первый баннер, используя кнопку выше</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Десктопная таблица */}
                  <table className="hidden w-full min-w-[800px] md:table">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Изображение</th>
                        <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Имя файла</th>
                        <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Тип</th>
                        <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Размер</th>
                        <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Дата создания</th>
                        <th className="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {banners.map((banner, index) => {
                        const imageUrl = getImageUrl(banner);
                        const isFirstBanner = index === 0;
                        return (
                          <tr key={banner.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{banner.id}</td>
                            <td className="px-6 py-4 text-sm">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={banner.fileName || `Banner ${banner.id}`}
                                  className="object-cover w-20 h-20 rounded"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center w-20 h-20 bg-gray-200 rounded">
                                  <ImageIcon className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{banner.fileName || "-"}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{banner.contentType || "-"}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatFileSize(banner.size)}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(banner.createdAt)}</td>
                            <td className="px-6 py-4 text-sm text-center whitespace-nowrap">
                              {isFirstBanner ? (
                                <span className="text-xs text-gray-500">Нельзя удалить</span>
                              ) : (
                                <button
                                  onClick={() => handleDelete(banner.id)}
                                  className="inline-flex items-center justify-center text-red-600 hover:text-red-800"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Мобильные карточки */}
                  <div className="divide-y divide-gray-200 md:hidden">
                    {banners.map((banner, index) => {
                      const imageUrl = getImageUrl(banner);
                      const isFirstBanner = index === 0;
                      return (
                        <div key={banner.id} className="p-4">
                          <div className="flex items-start gap-4">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={banner.fileName || `Banner ${banner.id}`}
                                className="flex-shrink-0 object-cover w-20 h-20 rounded"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 bg-gray-200 rounded">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {banner.fileName || `Баннер #${banner.id}`}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500">ID: {banner.id}</p>
                                </div>
                                {isFirstBanner ? (
                                  <span className="flex-shrink-0 text-xs text-gray-500">Нельзя удалить</span>
                                ) : (
                                  <button
                                    onClick={() => handleDelete(banner.id)}
                                    className="flex-shrink-0 p-1 text-red-600 hover:text-red-800"
                                    title="Удалить"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex justify-between">
                                  <span>Тип:</span>
                                  <span className="font-medium">{banner.contentType || "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Размер:</span>
                                  <span className="font-medium">{formatFileSize(banner.size)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Создан:</span>
                                  <span className="font-medium">{formatDate(banner.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <ToastMotion show={toast.show} type={toast.type}>
        {toast.message}
      </ToastMotion>
    </div>
  );
}

