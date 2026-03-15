import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import PurchasesPage from "./pages/PurchasesPage";
import SalesPage from "./pages/SalesPage";
import InventoryPage from "./pages/InventoryPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (u) => {

      setUser(u);
      setLoading(false);

    });

    return unsubscribe;

  }, []);

  if (loading) {
    return <div style={{padding:40}}>Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />

        <BrowserRouter>

          <AppLayout>

            <Routes>

              <Route path="/" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />

              <Route path="*" element={<NotFound />} />

            </Routes>

          </AppLayout>

        </BrowserRouter>

      </TooltipProvider>
    </QueryClientProvider>
  );

};

export default App;