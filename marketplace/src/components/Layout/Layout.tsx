import { useLocation, Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

function Layout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const isAdminPage = location.pathname.startsWith("/admin");
  const isChatPage = location.pathname === "/chat";

  return (
    <div
      className={`h-screen flex flex-col ${
        isChatPage ? "overflow-y-hidden" : "overflow-y-auto"
      }`}
    >
      <ScrollToTop />
      {/* Header */}
      {!isAuthPage && <div className="h-[65px] shrink-0">{<Header />}</div>}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      {!(isAuthPage || isChatPage || isAdminPage) && (
        <div className="shrink-0">
          <Footer />
        </div>
      )}
    </div>
  );
}

export default Layout;
