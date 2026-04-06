import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CatalogPagination = ({ page, totalPages, onPageChange }) => {
  const getPageNumbers = () => { /* ... скопировать логику из оригинального файла ... */ };
  return (
    <div className="flex justify-center mt-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); if (page > 1) onPageChange(page - 1); }} className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} size="icon">
              <ChevronLeft className="w-4 h-4" />
            </PaginationLink>
          </PaginationItem>
          {getPageNumbers().map((num, idx) => (
            <PaginationItem key={idx}>
              {num === 'ellipsis' ? <PaginationEllipsis /> : (
                <PaginationLink href="#" isActive={page === num} onClick={(e) => { e.preventDefault(); onPageChange(num); }}>{num}</PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); if (page < totalPages) onPageChange(page + 1); }} className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} size="icon">
              <ChevronRight className="w-4 h-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="mt-4 text-sm text-center text-gray-500">
        Показано ... из {totalElements} товаров · Страница {page} из {totalPages}
      </div>
    </div>
  );
};