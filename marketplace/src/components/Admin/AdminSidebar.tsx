
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  LayoutTemplate,
  MapPin,
  Mail,
  UserX,
  ShieldAlert,
} from "lucide-react";

const navigation = [
  {
    name: "Analytics",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: AlertTriangle,
  },
  {
    name: "Templates",
    href: "/admin/templates",
    icon: LayoutTemplate,
  },
  {
    name: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    name: "Legal Documents",
    href: "/admin/legal-documents",
    icon: FileText,
  },
  {
    name: "Neighbourhoods",
    href: "/admin/neighbourhoods",
    icon: MapPin,
  },
  {
    name: "Contact Submissions",
    href: "/admin/contact-submissions",
    icon: Mail,
  },
  {
    name: "Data Deletion Requests",
    href: "/admin/data-deletion-requests",
    icon: UserX,
  },
  {
    name: "Incident Reports",
    href: "/admin/incident-reports",
    icon: ShieldAlert,
  },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <nav className="flex flex-col h-full w-64 p-4">
      <ul className="flex flex-col gap-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <li key={item.name}>
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors
                  ${isActive ? "font-semibold" : ""}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AdminSidebar;
