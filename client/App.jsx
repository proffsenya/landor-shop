import "./global.css";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import DeliveryPayment from "./pages/DeliveryPayment";
import ExchangeReturn from "./pages/ExchangeReturn";
import HowToOrder from "./pages/HowToOrder";
import Breeders from "./pages/Breeders";
import Cooperation from "./pages/Cooperation";
import ScrollToTop from "./lib/Scrolltotop";

const queryClient = new QueryClient();




const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
              <BrowserRouter>
              <ScrollToTop />
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
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")).render(<App />);
