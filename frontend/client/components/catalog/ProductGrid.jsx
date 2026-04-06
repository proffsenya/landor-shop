import ProductCard from '@/components/ProductCard';
import { formatWeight } from '@/utils/formatting';

export const ProductGrid = ({ products }) => {
  if (!products.length) return null;
  return (
    <div className="grid items-stretch grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const to = product.parentId != null
          ? `/product/${encodeURIComponent(product.parentId)}?variant=${encodeURIComponent(product.id)}`
          : `/product/${encodeURIComponent(product.id)}`;
        const weightDisplay = product.weight
          ? (typeof product.weight === 'number' ? formatWeight(product.weight) : product.weight)
          : product.weightLabel || null;
        return (
          <ProductCard
            key={product.cardId}
            to={to}
            productId={product.parentId || product.id}
            variantId={product.id}
            image={product.image}
            title={product.title ?? 'Товар'}
            price={`${Number(product.price ?? 0).toLocaleString()} ₽`}
            stock={product.stock}
            weight={weightDisplay}
          />
        );
      })}
    </div>
  );
};