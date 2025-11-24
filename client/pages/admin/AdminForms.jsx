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
import { Download, Mail, Phone, MapPin, FileText, Building2 } from "lucide-react";

export default function AdminForms() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackForms, setFeedbackForms] = useState([]);
  const [nurseryForms, setNurseryForms] = useState([]);
  const [activeTab, setActiveTab] = useState("feedback"); // "feedback" или "nursery"
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [nurseryPage, setNurseryPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const { isSuperUser: superUser, hasAccess } = checkAdminAccess();

    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setIsSuperUser(superUser);
    loadForms();
  }, [navigate]);

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
      console.error("Error loading forms:", e);
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
      <AdminHeader isSuperUser={isSuperUser} />
      <div className="flex">
        <AdminSidebar isSuperUser={isSuperUser} />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Заявки из форм</h1>

            {/* Вкладки */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => {
                    setActiveTab("feedback");
                    setFeedbackPage(1);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Город</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Комментарий</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {forms.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Нет заявок
                </td>
              </tr>
            ) : (
              paginatedForms.map((form) => (
                <tr key={form.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{form.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{form.name || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {form.email || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {form.phone || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {form.city || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={form.comment}>
                    {form.comment || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.createdAt
                      ? new Date(form.createdAt).toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

  const handleDownloadFile = async (form) => {
    if (!form.registrationFile || form.registrationFile.length === 0) {
      alert("Файл не найден");
      return;
    }

    try {
      const adminToken = getAdminToken();
      // Если registrationFile это массив строк (URLs), загружаем первый файл
      const fileUrl = Array.isArray(form.registrationFile) 
        ? form.registrationFile[0] 
        : form.registrationFile;
      
      const res = await fetch(fileUrl, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = form.fileName || "registration_file";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert("Не удалось загрузить файл");
      }
    } catch (e) {
      console.error("Error downloading file:", e);
      alert("Ошибка при загрузке файла");
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Организация</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Город</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Файл</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {forms.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  Нет заявок
                </td>
              </tr>
            ) : (
              paginatedForms.map((form) => (
                <tr key={form.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{form.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {form.organizationName || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{form.fullName || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {form.email || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {form.phone || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {form.city || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {form.registrationFile && form.registrationFile.length > 0 ? (
                      <button
                        onClick={() => handleDownloadFile(form)}
                        className="text-[#6F2A2B] hover:text-[#5a2223] flex items-center gap-1"
                        title={form.fileName || "Скачать файл"}
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">{form.fileName || "Файл"}</span>
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.createdAt
                      ? new Date(form.createdAt).toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

