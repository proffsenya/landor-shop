import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";
import { initNotifications } from "@/utils/notifications";
import { safeError } from "@/utils/logger";
import { ToastMotion } from "@/utils/PageAnimations";
import { Download, Mail, Phone, MapPin, FileText, Building2, Eye, Image as ImageIcon } from "lucide-react";

export default function AdminForms() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackForms, setFeedbackForms] = useState([]);
  const [nurseryForms, setNurseryForms] = useState([]);
  const [activeTab, setActiveTab] = useState("feedback"); // "feedback" или "nursery"
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [nurseryPage, setNurseryPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const { isStaff: staff, isSuperUser: superUser, hasAccess } = checkAdminAccess();

    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setIsSuperUser(superUser);
    loadForms();

    // Инициализируем систему уведомлений
    const adminToken = getAdminToken();
    if (adminToken && (staff || superUser)) {
      initNotifications(adminToken, staff, superUser).catch((e) => {
        safeError("Error initializing notifications:", e);
      });
    }
  }, [navigate]);

  const showToast = (message, type = "success") => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: "", type: "success", show: false }), 3000);
  };

  const loadForms = async () => {
    try {
      const adminToken = getAdminToken();
      
      const [feedbackRes, nurseryRes] = await Promise.all([
        fetch("/api/forms/feedbackform", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/forms/nurseryform", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ]);

      if (feedbackRes.ok) {
        const data = await feedbackRes.json();
        setFeedbackForms(Array.isArray(data) ? data : []);
      }

      if (nurseryRes.ok) {
        const data = await nurseryRes.json();
        setNurseryForms(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      safeError("Error loading forms:", e);
    } finally {
      setLoading(false);
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
      <AdminHeader 
        isSuperUser={isSuperUser} 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex">
        <AdminSidebar 
          isSuperUser={isSuperUser} 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full lg:w-auto">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Заявки из форм</h1>

            {/* Вкладки */}
            <div className="mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
              <nav className="flex space-x-4 sm:space-x-8 min-w-max">
                <button
                  onClick={() => {
                    setActiveTab("feedback");
                    setFeedbackPage(1);
                  }}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === "feedback"
                      ? "border-[#6F2A2B] text-[#6F2A2B]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Форма сотрудничества ({feedbackForms.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab("nursery");
                    setNurseryPage(1);
                  }}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === "nursery"
                      ? "border-[#6F2A2B] text-[#6F2A2B]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Форма заводчиков ({nurseryForms.length})
                </button>
              </nav>
            </div>

            {/* Контент вкладок */}
            {activeTab === "feedback" && (
              <FeedbackFormsTable 
                forms={feedbackForms} 
                currentPage={feedbackPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setFeedbackPage}
              />
            )}

            {activeTab === "nursery" && (
              <NurseryFormsTable 
                forms={nurseryForms} 
                currentPage={nurseryPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setNurseryPage}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function FeedbackFormsTable({ forms, currentPage, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(forms.length / itemsPerPage);
  const validPage = Math.min(currentPage, Math.max(1, totalPages || 1));
  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedForms = forms.slice(startIndex, endIndex);
  
  // Сброс страницы, если она выходит за пределы
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      onPageChange(1);
    }
  }, [totalPages, currentPage, onPageChange]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div>
    <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
        <thead className="bg-gray-50">
          <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Email</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Телефон</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Город</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Комментарий</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {forms.length === 0 ? (
            <tr>
                  <td colSpan="7" className="px-3 sm:px-6 py-4 text-center text-gray-500">
                Нет заявок
              </td>
            </tr>
          ) : (
                paginatedForms.map((form) => (
              <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{form.id}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">{form.name || "-"}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[150px]" title={form.email || "-"}>
                    {form.email || "-"}
                        </span>
                  </div>
                </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {form.phone || "-"}
                  </div>
                </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {form.city || "-"}
                  </div>
                </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 max-w-xs truncate hidden xl:table-cell" title={form.comment}>
                  {form.comment || "-"}
                </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {form.createdAt
                        ? new Date(form.createdAt).toLocaleString("ru-RU", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : form.created_at
                        ? new Date(form.created_at).toLocaleString("ru-RU", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                            second: "2-digit",
                      })
                    : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
        </div>
      </div>
      
      {forms.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      onPageChange(currentPage - 1);
                    }
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(page);
                      }}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      onPageChange(currentPage + 1);
                    }
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function NurseryFormsTable({ forms, currentPage, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(forms.length / itemsPerPage);
  const validPage = Math.min(currentPage, Math.max(1, totalPages || 1));
  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedForms = forms.slice(startIndex, endIndex);
  
  // Сброс страницы, если она выходит за пределы
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      onPageChange(1);
    }
  }, [totalPages, currentPage, onPageChange]);

  const [imagePreview, setImagePreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Получение информации о форме по ID
  const getFormById = async (formId) => {
    try {
      const adminToken = getAdminToken();
      const response = await fetch(`/api/forms/nurseryform/${formId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (e) {
      safeError("Error fetching form:", e);
      throw e;
    }
  };

  // Получение и открытие файла через новый эндпоинт
  const handleOpenFile = async (formId) => {
    try {
      setPreviewLoading(true);
      const adminToken = getAdminToken();
      
      const response = await fetch(`/api/forms/nurseryform/${formId}/file`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Открываем файл в новой вкладке
      window.open(url, '_blank');
      
      // Освобождаем URL после небольшой задержки
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (e) {
      safeError("Error opening file:", e);
      showToast("Не удалось открыть файл", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Получение картинки для превью
  const handlePreviewImage = async (formId) => {
    try {
      setPreviewLoading(true);
      const adminToken = getAdminToken();
      
      const response = await fetch(`/api/forms/nurseryform/${formId}/file`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImagePreview(url);
    } catch (e) {
      safeError("Error loading image preview:", e);
      showToast("Не удалось загрузить изображение", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadFile = async (form) => {
    if (!form.id) {
      showToast("ID формы не найден", "error");
      return;
    }

    try {
      const adminToken = getAdminToken();
      
      const response = await fetch(`/api/forms/nurseryform/${form.id}/file`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = form.fileName || "registration_file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      safeError("Error downloading file:", e);
      showToast("Ошибка при загрузке файла", "error");
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div>
      {/* Модальное окно для просмотра изображения */}
      {imagePreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setImagePreview(null);
            URL.revokeObjectURL(imagePreview);
          }}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => {
                setImagePreview(null);
                URL.revokeObjectURL(imagePreview);
              }}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
            >
              ✕
            </button>
            <img 
              src={imagePreview} 
              alt="Превью анкеты" 
              className="max-w-full max-h-[90vh] object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
        <thead className="bg-gray-50">
          <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Организация</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">ФИО</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Email</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Телефон</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Город</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Файл</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {forms.length === 0 ? (
            <tr>
                  <td colSpan="8" className="px-3 sm:px-6 py-4 text-center text-gray-500">
                Нет заявок
              </td>
            </tr>
          ) : (
                paginatedForms.map((form) => (
              <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{form.id}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate max-w-[120px] sm:max-w-none" title={form.organizationName || "-"}>
                    {form.organizationName || "-"}
                        </span>
                  </div>
                </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 hidden md:table-cell">{form.fullName || "-"}</td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[150px]" title={form.email || "-"}>
                    {form.email || "-"}
                        </span>
                  </div>
                </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {form.phone || "-"}
                  </div>
                </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden xl:table-cell">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {form.city || "-"}
                  </div>
                </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                  {form.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenFile(form.id)}
                        disabled={previewLoading}
                        className="text-[#6F2A2B] hover:text-[#5a2223] flex items-center gap-1 disabled:opacity-50"
                        title="Открыть файл"
                      >
                        <Eye className="w-4 h-4" />
                        {previewLoading && <span className="text-xs">...</span>}
                      </button>
                      <button
                        onClick={() => handlePreviewImage(form.id)}
                        disabled={previewLoading}
                        className="text-[#6F2A2B] hover:text-[#5a2223] flex items-center gap-1 disabled:opacity-50"
                        title="Просмотр изображения"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadFile(form)}
                        className="text-[#6F2A2B] hover:text-[#5a2223] flex items-center gap-1"
                        title={form.fileName || "Скачать файл"}
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">{form.fileName || "Файл"}</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {form.createdAt
                        ? new Date(form.createdAt).toLocaleString("ru-RU", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : form.created_at
                        ? new Date(form.created_at).toLocaleString("ru-RU", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                            second: "2-digit",
                      })
                    : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
        </div>
      </div>
      
      {forms.length > itemsPerPage && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      onPageChange(currentPage - 1);
                    }
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(page);
                      }}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      onPageChange(currentPage + 1);
                    }
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

