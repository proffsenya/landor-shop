import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, MapPin } from "lucide-react";

// Моковые данные пользователя
const mockUser = {
  firstName: "Иван",
  lastName: "Иванов",
  middleName: "Иванович",
  email: "ivan@example.com",
  phone: "+7(999)999-99-99",
  avatar: null
};

// Моковые данные доставки
const mockDelivery = {
  city: "Москва",
  address: "ул. Примерная, д. 1",
  apartment: "12",
  entrance: "2",
  floor: "3"
};

// Моковые данные заказов
const mockOrders = [
  { id: "134534", date: "01.09.2025" },
  { id: "134535", date: "01.09.2025" },
  { id: "134536", date: "01.09.2025" }
];

export default function Profile() {
  const [user, setUser] = useState(mockUser);
  const [delivery, setDelivery] = useState(mockDelivery);
  const [orders] = useState(mockOrders);
  
  // Состояния для редактирования полей
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});

  const handleEditField = (field) => {
    setEditingField(field);
    setEditValues(prev => ({
      ...prev,
      [field]: user[field] || ""
    }));
  };

  const handleSaveField = (field) => {
    setUser(prev => ({
      ...prev,
      [field]: editValues[field]
    }));
    setEditingField(null);
    setEditValues({});
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleDeliveryEdit = () => {
    // Здесь будет логика редактирования данных доставки
    console.log('Редактирование данных доставки');
  };

  const handleOrderClick = (orderId) => {
    // Здесь будет логика перехода к деталям заказа
    console.log('Открыть заказ:', orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Профиль */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Профиль</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Аватар */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl bg-gray-200">
                      {user.firstName?.charAt(0) || "И"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-gray-900">{user.firstName}</h3>
                </div>

                {/* Поля профиля */}
                <div className="space-y-4">
                  {/* Фамилия */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="lastName"
                        value={editingField === 'lastName' ? editValues.lastName : user.lastName}
                        onChange={(e) => setEditValues(prev => ({...prev, lastName: e.target.value}))}
                        disabled={editingField !== 'lastName'}
                        className="flex-1"
                      />
                      {editingField === 'lastName' ? (
                        <div className="flex space-x-1">
                          <Button size="sm" onClick={() => handleSaveField('lastName')}>
                            ✓
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEditField('lastName')}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Имя */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="firstName"
                        value={editingField === 'firstName' ? editValues.firstName : user.firstName}
                        onChange={(e) => setEditValues(prev => ({...prev, firstName: e.target.value}))}
                        disabled={editingField !== 'firstName'}
                        className="flex-1"
                      />
                      {editingField === 'firstName' ? (
                        <div className="flex space-x-1">
                          <Button size="sm" onClick={() => handleSaveField('firstName')}>
                            ✓
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEditField('firstName')}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Отчество */}
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Отчество</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="middleName"
                        value={editingField === 'middleName' ? editValues.middleName : user.middleName}
                        onChange={(e) => setEditValues(prev => ({...prev, middleName: e.target.value}))}
                        disabled={editingField !== 'middleName'}
                        className="flex-1"
                      />
                      {editingField === 'middleName' ? (
                        <div className="flex space-x-1">
                          <Button size="sm" onClick={() => handleSaveField('middleName')}>
                            ✓
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEditField('middleName')}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Почта */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Почта</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="email"
                        type="email"
                        value={editingField === 'email' ? editValues.email : user.email}
                        onChange={(e) => setEditValues(prev => ({...prev, email: e.target.value}))}
                        disabled={editingField !== 'email'}
                        className="flex-1"
                      />
                      {editingField === 'email' ? (
                        <div className="flex space-x-1">
                          <Button size="sm" onClick={() => handleSaveField('email')}>
                            ✓
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEditField('email')}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Номер телефона */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Номер телефона</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="phone"
                        value={editingField === 'phone' ? editValues.phone : user.phone}
                        onChange={(e) => setEditValues(prev => ({...prev, phone: e.target.value}))}
                        disabled={editingField !== 'phone'}
                        className="flex-1"
                      />
                      {editingField === 'phone' ? (
                        <div className="flex space-x-1">
                          <Button size="sm" onClick={() => handleSaveField('phone')}>
                            ✓
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEditField('phone')}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Пароль */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        disabled
                        className="flex-1"
                      />
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка */}
          <div className="lg:col-span-2 space-y-8">
            {/* Данные для доставки */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Данные для доставки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Город, адрес */}
                <div className="space-y-2">
                  <Label htmlFor="cityAddress">Город, адрес</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="cityAddress"
                      value={`${delivery.city}, ${delivery.address}`}
                      disabled
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      Показать на карте
                    </Button>
                  </div>
                </div>

                {/* Квартира, Подъезд, Этаж */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apartment">Квартира</Label>
                    <Input
                      id="apartment"
                      value={delivery.apartment}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entrance">Подъезд</Label>
                    <Input
                      id="entrance"
                      value={delivery.entrance}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">Этаж</Label>
                    <Input
                      id="floor"
                      value={delivery.floor}
                      disabled
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleDeliveryEdit}
                    className="bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white"
                  >
                    Изменить
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* История заказов */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">История заказов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Номер</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Дата</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">
                            Заказ №{order.id}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {order.date}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOrderClick(order.id)}
                              className="text-[hsl(var(--landor-primary))] hover:text-[hsl(var(--landor-primary))]/80"
                            >
                              Открыть
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
