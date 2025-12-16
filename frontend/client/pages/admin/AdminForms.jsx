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
import { Download, Mail, Phone, MapPin, FileText, Building2, Eye, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";

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
  const itemsPerPage = 12;

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
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 lg:w-auto">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl sm:mb-6">Заявки из форм</h1>

            {/* Вкладки */}
            <div className="mb-4 overflow-x-auto border-b border-gray-200 sm:mb-6">
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
  const [expandedComments, setExpandedComments] = useState(new Set());
  const MAX_COMMENT_LENGTH = 50;
  
  // Сброс страницы, если она выходит за пределы
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      onPageChange(1);
    }
  }, [totalPages, currentPage, onPageChange]);

  const toggleComment = (formId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(formId)) {
        newSet.delete(formId);
      } else {
        newSet.add(formId);
      }
      return newSet;
    });
  };

  const renderComment = (comment, formId) => {
    if (!comment || comment === "-") return "-";
    
    const isExpanded = expandedComments.has(formId);
    const shouldTruncate = comment.length > MAX_COMMENT_LENGTH;
    
    if (!shouldTruncate) {
      return <div className="break-words whitespace-pre-wrap">{comment}</div>;
    }
    
    return (
      <div>
        <div className="break-words whitespace-pre-wrap">
          {isExpanded ? comment : `${comment.substring(0, MAX_COMMENT_LENGTH)}...`}
        </div>
        <button
          onClick={() => toggleComment(formId)}
          className="mt-1 text-xs text-[#6F2A2B] hover:text-[#5a2223] flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Скрыть
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Показать полностью
            </>
          )}
        </button>
      </div>
    );
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
      {/* Десктопная таблица */}
      <div className="hidden overflow-hidden bg-white rounded-lg shadow lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
                <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">ID</th>
                <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Имя</th>
                <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Email</th>
                <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Телефон</th>
                <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Город</th>
                <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Комментарий</th>
                <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Дата</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {forms.length === 0 ? (
            <tr>
                  <td colSpan="7" className="px-3 py-4 text-center text-gray-500 sm:px-6">
                Нет заявок
              </td>
            </tr>
          ) : (
                paginatedForms.map((form) => (
              <tr key={form.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-3 py-4 text-sm text-gray-900 sm:px-6 whitespace-nowrap">{form.id}</td>
                    <td className="px-3 py-4 text-sm text-gray-900 sm:px-6">{form.name || "-"}</td>
                    <td className="px-3 py-4 text-sm text-gray-500 sm:px-6">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[150px]" title={form.email || "-"}>
                    {form.email || "-"}
                        </span>
                  </div>
                </td>
                    <td className="px-3 py-4 text-sm text-gray-500 sm:px-6">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {form.phone || "-"}
                  </div>
                </td>
                    <td className="px-3 py-4 text-sm text-gray-500 sm:px-6">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {form.city || "-"}
                  </div>
                </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 max-w-md">
                  {renderComment(form.comment, form.id)}
                </td>
                    <td className="px-3 py-4 text-sm text-gray-500 sm:px-6 whitespace-nowrap">
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

      {/* Мобильные/планшетные карточки */}
      <div className="space-y-4 lg:hidden">
        {forms.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">
            Нет заявок
          </div>
        ) : (
          paginatedForms.map((form) => (
            <div key={form.id} className="p-4 space-y-3 bg-white rounded-lg shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{form.name || "-"}</h3>
                  <p className="mt-1 text-xs text-gray-500">ID: {form.id}</p>
                </div>
                <div className="text-xs text-right text-gray-500">
                  {form.createdAt
                    ? new Date(form.createdAt).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : form.created_at
                    ? new Date(form.created_at).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "-"}
                </div>
              </div>
              
              <div className="pt-2 space-y-2 border-t border-gray-200">
                {form.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs text-gray-600">Email:</span>
                      <span className="text-sm text-gray-900 break-all">{form.email}</span>
                    </div>
                  </div>
                )}
                
                {form.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs text-gray-600">Телефон:</span>
                      <span className="text-sm text-gray-900">{form.phone}</span>
                    </div>
                  </div>
                )}
                
                {form.city && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs text-gray-600">Город:</span>
                      <span className="text-sm text-gray-900">{form.city}</span>
                    </div>
                  </div>
                )}
                
                {form.comment && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-600 block">Комментарий:</span>
                      <div className="text-sm text-gray-900 break-words whitespace-pre-wrap">
                        {expandedComments.has(form.id) 
                          ? form.comment 
                          : form.comment.length > MAX_COMMENT_LENGTH 
                            ? `${form.comment.substring(0, MAX_COMMENT_LENGTH)}...` 
                            : form.comment}
                      </div>
                      {form.comment.length > MAX_COMMENT_LENGTH && (
                        <button
                          onClick={() => toggleComment(form.id)}
                          className="mt-1 text-xs text-[#6F2A2B] hover:text-[#5a2223] flex items-center gap-1"
                        >
                          {expandedComments.has(form.id) ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              Скрыть
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              Показать полностью
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {forms.length > itemsPerPage && (
        <div className="flex justify-center mt-4">
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

  const [filePreview, setFilePreview] = useState({ url: null, type: null }); // type: 'image' | 'pdf'
  const [previewLoading, setPreviewLoading] = useState(false);

  // Простая функция для показа уведомлений
  const showToast = (message, type = "error") => {
    // Используем alert как fallback, можно заменить на более продвинутое решение
    alert(message);
    safeError(message);
  };

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

  // Определение типа файла
  const getFileType = (blob, fileName) => {
    // Проверяем MIME тип
    if (blob.type === 'application/pdf') {
      return 'pdf';
    }
    if (blob.type.startsWith('image/')) {
      return 'image';
    }
    // Проверяем по расширению файла
    if (fileName) {
      const ext = fileName.toLowerCase().split('.').pop();
      if (ext === 'pdf') {
        return 'pdf';
      }
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
        return 'image';
      }
    }
    // По умолчанию считаем изображением
    return 'image';
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
      
      // Получаем имя файла из формы
      const form = paginatedForms.find(f => f.id === formId);
      const fileType = getFileType(blob, form?.fileName);
      
      // Если PDF или изображение, показываем в модальном окне
      if (fileType === 'pdf' || fileType === 'image') {
        setFilePreview({ url, type: fileType });
      } else {
        // Для других типов открываем в новой вкладке
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (e) {
      safeError("Error opening file:", e);
      showToast("Не удалось открыть файл", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Получение файла для превью (изображение или PDF)
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
      
      // Получаем имя файла из формы
      const form = paginatedForms.find(f => f.id === formId);
      const fileType = getFileType(blob, form?.fileName);
      
      setFilePreview({ url, type: fileType });
    } catch (e) {
      safeError("Error loading file preview:", e);
      showToast("Не удалось загрузить файл", "error");
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
      {/* Модальное окно для просмотра файла (изображение или PDF) */}
      {filePreview.url && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
          onClick={() => {
            URL.revokeObjectURL(filePreview.url);
            setFilePreview({ url: null, type: null });
          }}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => {
                URL.revokeObjectURL(filePreview.url);
                setFilePreview({ url: null, type: null });
              }}
              className="absolute z-10 p-2 text-white bg-black bg-opacity-50 rounded-full top-4 right-4 hover:bg-opacity-75"
            >
              ✕
            </button>
            {filePreview.type === 'pdf' ? (
              <div className="bg-white rounded-lg overflow-hidden w-full h-[90vh]">
                <iframe
                  src={filePreview.url}
                  title="Просмотр файла"
                  className="w-full h-full"
                  style={{ border: 'none' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p>
                    Ваш браузер не поддерживает отображение PDF файлов. 
                    <a 
                      href={filePreview.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#6F2A2B] underline ml-1"
                    >
                      Откройте в новой вкладке
                    </a>
                  </p>
                </iframe>
              </div>
            ) : (
              <img 
                src={filePreview.url} 
                alt="Превью анкеты" 
                className="max-w-full max-h-[90vh] object-contain rounded"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
      {/* Десктопная таблица */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
        <thead className="bg-gray-50">
          <tr>
                <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">ID</th>
                <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Организация</th>
                <th className="hidden px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6 md:table-cell">ФИО</th>
                <th className="hidden px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6 lg:table-cell">Email</th>
                <th className="hidden px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6 lg:table-cell">Телефон</th>
                <th className="hidden px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6 xl:table-cell">Город</th>
                <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Файл</th>
                <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Дата</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {forms.length === 0 ? (
            <tr>
                  <td colSpan="8" className="px-3 py-4 text-center text-gray-500 sm:px-6">
                Нет заявок
              </td>
            </tr>
          ) : (
                paginatedForms.map((form) => (
              <tr key={form.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-3 py-4 text-sm text-gray-900 sm:px-6 whitespace-nowrap">{form.id}</td>
                    <td className="px-3 py-4 text-sm text-gray-900 sm:px-6">
                  <div className="flex items-center gap-1">
                        <Building2 className="flex-shrink-0 w-3 h-3" />
                        <span className="truncate max-w-[120px] sm:max-w-none" title={form.organizationName || "-"}>
                    {form.organizationName || "-"}
                        </span>
                  </div>
                </td>
                    <td className="hidden px-3 py-4 text-sm text-gray-900 sm:px-6 md:table-cell">{form.fullName || "-"}</td>
                    <td className="hidden px-3 py-4 text-sm text-gray-500 sm:px-6 lg:table-cell">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[150px]" title={form.email || "-"}>
                    {form.email || "-"}
                        </span>
                  </div>
                </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span>{form.phone || "-"}</span>
                  </div>
                </td>
                    <td className="hidden px-3 py-4 text-sm text-gray-500 sm:px-6 xl:table-cell">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {form.city || "-"}
                  </div>
                </td>
                    <td className="px-3 py-4 text-sm sm:px-6 whitespace-nowrap">
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
                        <Download className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline truncate max-w-[150px]" title={form.fileName || "Файл"}>
                          {form.fileName || "Файл"}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                    <td className="px-3 py-4 text-sm text-gray-500 sm:px-6 whitespace-nowrap">
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

      {/* Мобильные/планшетные карточки */}
      <div className="lg:hidden space-y-4">
        {forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Нет заявок
          </div>
        ) : (
          paginatedForms.map((form) => (
            <div key={form.id} className="bg-white rounded-lg shadow p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-gray-900">{form.organizationName || "-"}</h3>
                  </div>
                  <p className="text-xs text-gray-500">ID: {form.id}</p>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  {form.createdAt
                    ? new Date(form.createdAt).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : form.created_at
                    ? new Date(form.created_at).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "-"}
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-gray-200">
                {form.fullName && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-600 block">ФИО:</span>
                      <span className="text-sm text-gray-900">{form.fullName}</span>
                    </div>
                  </div>
                )}
                
                {form.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-600 block">Email:</span>
                      <span className="text-sm text-gray-900 break-all">{form.email}</span>
                    </div>
                  </div>
                )}
                
                {form.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-600 block">Телефон:</span>
                      <span className="text-sm text-gray-900 whitespace-nowrap">{form.phone}</span>
                    </div>
                  </div>
                )}
                
                {form.city && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-600 block">Город:</span>
                      <span className="text-sm text-gray-900">{form.city}</span>
                    </div>
                  </div>
                )}
                
                {form.id && (
                  <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                    <Download className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-600 block mb-2">Файл:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleOpenFile(form.id)}
                          disabled={previewLoading}
                          className="text-[#6F2A2B] hover:text-[#5a2223] flex items-center gap-1 disabled:opacity-50 text-sm"
                          title="Открыть файл"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Открыть</span>
                        </button>
                        <button
                          onClick={() => handlePreviewImage(form.id)}
                          disabled={previewLoading}
                          className="text-[#6F2A2B] hover:text-[#5a2223] flex items-center gap-1 disabled:opacity-50 text-sm"
                          title="Просмотр изображения"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span>Превью</span>
                        </button>
                        <button
                          onClick={() => handleDownloadFile(form)}
                          className="text-[#6F2A2B] hover:text-[#5a2223] flex items-center gap-1 text-sm"
                          title={form.fileName || "Скачать файл"}
                        >
                          <Download className="w-4 h-4" />
                          <span>Скачать</span>
                        </button>
                      </div>
                      {form.fileName && (
                        <p className="text-xs text-gray-500 mt-1 truncate" title={form.fileName}>
                          {form.fileName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {forms.length > itemsPerPage && (
        <div className="flex justify-center mt-4">
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

