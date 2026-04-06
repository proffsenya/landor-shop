import { DEFAULT_IMAGE } from "@/constants/productConstants";

export const ProductImageGallery = ({ gallery, selectedImageIdx, relevantThumbnails, onSelectImage }) => {
  const mainImage = gallery[selectedImageIdx]?.url || DEFAULT_IMAGE;
  return (
    <div className="flex flex-col w-full">
      <div className="rounded-lg border border-[#E6E6E6] bg-white p-2">
        <div className="flex w-full items-center justify-center overflow-hidden rounded-md bg-white h-64 md:h-[360px]">
          <img src={mainImage} alt={gallery[selectedImageIdx]?.altText || "product"} className="object-contain w-full h-full" onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)} />
        </div>
      </div>
      {relevantThumbnails.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {relevantThumbnails.map((img, i) => {
            const fullIdx = gallery.findIndex(g => g.id === img.id);
            const isSelected = fullIdx === selectedImageIdx;
            return (
              <button key={img.id ?? i} onClick={() => onSelectImage(fullIdx)} className={`overflow-hidden rounded-md ${isSelected ? "ring-2 ring-[#6F2A2B]" : ""} bg-white h-16`}>
                <img src={img.url} alt={img.altText || `img-${i}`} className="object-contain w-full h-full" onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};