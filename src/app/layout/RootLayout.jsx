import {Outlet} from "react-router-dom";
import {Toaster} from "@/components/ui/sonner.jsx";

const RootLayout = () => {
    return (
        <div className="bg-background text-foreground">
            <Outlet/>
            <Toaster position="bottom-right" richColors closeButton/>
        </div>
    );
};

export default RootLayout;