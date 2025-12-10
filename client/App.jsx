import "./global.css";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import ScrollToTop from "./lib/Scrolltotop";

// Lazy load страниц для оптимизации
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Cart = lazy(() => import("./pages/Cart"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Product = lazy(() => import("./pages/Product"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DeliveryPayment = lazy(() => import("./pages/DeliveryPayment"));
const ExchangeReturn = lazy(() => import("./pages/ExchangeReturn"));
const HowToOrder = lazy(() => import("./pages/HowToOrder"));
const Breeders = lazy(() => import("./pages/Breeders"));
const Cooperation = lazy(() => import("./pages/Cooperation"));
const AboutCompany = lazy(() => import("./pages/AboutCompany"));
const Licenses = lazy(() => import("./pages/Licenses"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminForms = lazy(() => import("./pages/admin/AdminForms"));
const AdminFilters = lazy(() => import("./pages/admin/AdminFilters"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));

// Компонент загрузки
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6F2A2B]"></div>
  </div>
);

const queryClient = new QueryClient();




const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
              <BrowserRouter>
              <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/deliverypayment" element={<DeliveryPayment />} />
                  <Route path="/exchangereturn" element={<ExchangeReturn />} />
                  <Route path="/howtoorder" element={<HowToOrder />} />
            <Route path="/breeders" element={<Breeders />} />
            <Route path="/cooperation" element={<Cooperation />} />
            <Route path="/about" element={<AboutCompany />} />
            <Route path="/licenses" element={<Licenses />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/forms" element={<AdminForms />} />
                  <Route path="/admin/filters" element={<AdminFilters />} />
                  <Route path="/admin/banners" element={<AdminBanners />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
        </Suspense>
              </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")).render(<App />);
