import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Trash2, ShoppingCart } from "lucide-react";
import ProductsSection from "../components/ProductsSection";

// Моковые данные избранных товаров
const mockFavorites = [
  {
    id: 1,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    weight: "1кг",
    image: "/placeholder.svg",
    dateAdded: "28.08.2025",
    status: "В наличии",
    isInStock: true
  },
  {
    id: 2,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    weight: "1кг",
    image: "/placeholder.svg",
    dateAdded: "28.08.2025",
    status: "Нет в наличии",
    isInStock: false
  },
  {
    id: 3,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    weight: "1кг",
    image: "/placeholder.svg",
    dateAdded: "28.08.2025",
    status: "В наличии",
    isInStock: true
  }
];

// Моковые данные рекомендованных товаров
const mockRecommended = [
  {
    id: 4,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/placeholder.svg",
    isFavorite: false
  },
  {
    id: 5,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/placeholder.svg",
    isFavorite: false
  },
  {
    id: 6,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/placeholder.svg",
    isFavorite: false
  },
  {
    id: 7,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/placeholder.svg",
    isFavorite: false
  },
  {
    id: 8,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/placeholder.svg",
    isFavorite: false
  }
];

// Компонент карточки товара для рекомендаций
const ProductCard = ({ product, onToggleFavorite }) => {
  return (
    <Card className="transition-shadow group hover:shadow-lg">
      <CardContent className="p-4">
        <div className="relative">
          <button
            onClick={() => onToggleFavorite(product.id)}
            className="absolute z-10 p-1 transition-colors rounded-full top-2 right-2 bg-white/80 hover:bg-white"
          >
            <Heart 
              className={`w-5 h-5 ${
                product.isFavorite 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-400 hover:text-red-500'
              }`} 
            />
          </button>
          
          <div className="mb-3 overflow-hidden bg-gray-100 rounded-lg aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
          </div>
          
          <h3 className="mb-2 text-sm font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {product.price.toLocaleString()} Р
            </span>
            <Button 
              size="sm" 
              className="bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white"
            >
              В корзину
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Favorites() {
  const [favorites, setFavorites] = useState(mockFavorites);
  const [recommended, setRecommended] = useState(mockRecommended);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  const clearAllFavorites = () => {
    setFavorites([]);
  };

  const addAllToCart = () => {
    const inStockItems = favorites.filter(item => item.isInStock);
    // Здесь будет логика добавления всех товаров в корзину
    console.log('Добавляем в корзину:', inStockItems);
  };

  const toggleRecommendedFavorite = (id) => {
    setRecommended(recommended.map(item => 
      item.id === id 
        ? { ...item, isFavorite: !item.isFavorite }
        : item
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container px-4 py-8 mx-auto">
        {/* Секция избранного */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[hsl(var(--landor-primary))] mb-8">
            Избранное
          </h1>

          {favorites.length === 0 ? (
            <div className="py-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Избранное пусто</h2>
              <p className="mb-6 text-gray-600">Добавьте товары в избранное, чтобы они отображались здесь</p>
              <Link to="/catalog">
                <Button className="bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white">
                  Перейти в каталог
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Таблица избранных товаров */}
              <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-600">Удалить</th>
                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-600">Товар</th>
                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-600">Вес</th>
                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-600">Стоимость</th>
                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-600">Дата добавления</th>
                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-600">Статус</th>
                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {favorites.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromFavorites(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-100 rounded-lg">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {item.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">{item.weight}</td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">{item.dateAdded}</td>
                          <td className="px-4 py-4">
                            <Badge 
                              variant={item.isInStock ? "default" : "destructive"}
                              className={item.isInStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            {item.isInStock && (
                              <Button 
                                size="sm"
                                className="bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white"
                              >
                                Добавить в корзину
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Действия с избранным */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  onClick={clearAllFavorites}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Очистить избранное
                </Button>
                <Button 
                  className="bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white"
                  onClick={addAllToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Добавить всё в корзину
                </Button>
              </div>

              {/* Навигация */}
              <div className="mb-8">
                <Link to="/catalog" className="inline-flex items-center text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  В каталог
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Секция рекомендованных товаров */}
        <ProductsSection title="Рекомендовано для Вас" />
      </div>

      <Footer />
    </div>
  );
}
