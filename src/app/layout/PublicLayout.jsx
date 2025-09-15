import {Outlet} from "react-router-dom";
import Footer from "@/components/ui/footer/Footer";
import Header from "@/components/ui/header/Header.js";

const PublicLayout = () => {
    return (
        <div className="min-h-dvh flex flex-col">
            <Header />
            <main className="container mx-auto w-full max-w-screen-2xl flex-1 px-6 py-8 lg:px-8 min-h-screen">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
};

export default PublicLayout;