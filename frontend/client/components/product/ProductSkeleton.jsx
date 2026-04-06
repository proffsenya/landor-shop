export const ProductSkeleton = () => (
  <div className="container mx-auto px-4 py-10 md:px-10 lg:px-[84px]">
    <div className="space-y-4 animate-pulse">
      <div className="w-40 h-6 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-gray-200 rounded h-80" />
        <div className="space-y-3">
          <div className="w-2/3 h-6 bg-gray-200 rounded" />
          <div className="w-1/3 h-6 bg-gray-200 rounded" />
          <div className="w-40 h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);