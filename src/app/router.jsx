import React, {lazy, Suspense} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import RootLayout from "./layout/RootLayout";
import PublicLayout from "./layout/PublicLayout";
import AdminLayout from "./layout/AdminLayout";
import BasketPage from "@/pages/basket/BasketPage.jsx";
import CataloguePage from "@/pages/catalogue/CataloguePage.jsx";
import ContactoPage from "@/pages/contact/ContactoPage.jsx";
import LoginPage from "@/pages/login/LoginPage.jsx";
import AboutPage from "@/pages/about/AboutPage.jsx";
import ProductoFormPage from "@/pages/admin/products/ProductoFormPage.jsx";
import ReportsPage from "@/pages/admin/reports/ReportsPage.jsx";
import ProductDetailPage from "@/pages/product/ProductDetailPage.jsx";
import NotFoundPage from "@/pages/NotFoundPage.jsx";
import LoadingScreen from "@/pages/LoadingScreen.jsx";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage.jsx";
import ProductoEditPage from "@/pages/admin/products/ProductoEditPage.jsx";

const HomePage = lazy(() => import("@/pages/home/HomePage.jsx")); // si usas "@", asegúrate del alias en Vite

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    <Route element={<RootLayout />}>
                        {/* Rutas públicas con Header + Footer */}
                        <Route element={<PublicLayout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/catalogue" element={<CataloguePage />} />
                            <Route path="/basket" element={<BasketPage/>} />
                            <Route path="/contact" element={<ContactoPage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/product/:id" element={<ProductDetailPage />} />
                        </Route>
                        <Route path="/login" element={<LoginPage/>} />
                        <Route element={<AdminLayout />}>
                            <Route path="/admin/products" element={<ProductoFormPage />} />
                            <Route path="/admin/reports" element={<ReportsPage />} />
                            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                            <Route path="/admin/products/:id" element={<ProductoEditPage />} />
                        </Route>

                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
