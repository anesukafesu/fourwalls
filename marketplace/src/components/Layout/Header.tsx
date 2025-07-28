
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHeaderCounts } from "@/hooks/useHeaderCounts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LogOut,
  Settings,
  User,
  Bookmark,
  CreditCard,
  Plus,
  Shield,
  Home,
  Star,
  FileText,
  BookOpen,
  Menu,
  MessageCircle,
} from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const counts = useHeaderCounts();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("is_admin", {
        user_id: user.id,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const remainingCredits = profile?.credits || 0;

  return (
    <header className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
            <span className="text-2xl font-heading font-black text-primary">
              fourwalls
            </span>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary transition-colors font-semibold"
            >
              Home
            </Link>
            <Link
              to="/properties"
              className="text-gray-700 hover:text-primary transition-colors font-semibold" 
            >
              Properties
            </Link>
            <Link
              to="/blog"
              className="text-gray-700 hover:text-primary transition-colors font-semibold"
            >
              Blog
            </Link>
            {user && (
              <>
                <Link
                  to="/bookmarks"
                  className="text-gray-700 hover:text-primary transition-colors font-semibold"
                >
                  Bookmarks
                </Link>
                <Link
                  to="/chat"
                  className="text-gray-700 hover:text-primary transition-colors font-semibold"
                >
                  Chat
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {isMobile && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 pt-6">
                    <Link
                      to="/"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home className="h-5 w-5" />
                      <span className="font-medium">Home</span>
                    </Link>
                    <Link
                      to="/properties"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Star className="h-5 w-5" />
                      <span className="font-medium">Properties</span>
                    </Link>
                    <Link
                      to="/blog"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BookOpen className="h-5 w-5" />
                      <span className="font-medium">Blog</span>
                    </Link>
                    {user && (
                      <>
                        <Link
                          to="/bookmarks"
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Bookmark className="h-5 w-5" />
                          <span className="font-medium">Bookmarks</span>
                          <Badge variant="secondary" className="ml-auto">
                            {counts.bookmarks}
                          </Badge>
                        </Link>
                        <Link
                          to="/chat"
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <MessageCircle className="h-5 w-5" />
                          <span className="font-medium">Chat</span>
                        </Link>
                        <Link
                          to="/my-properties"
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Home className="h-5 w-5" />
                          <span className="font-medium">My Properties</span>
                          <Badge variant="secondary" className="ml-auto">
                            {counts.properties}
                          </Badge>
                        </Link>
                        <Link
                          to="/properties/create"
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Plus className="h-5 w-5" />
                          <span className="font-medium">List Property</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Shield className="h-5 w-5" />
                            <span className="font-medium">Admin</span>
                          </Link>
                        )}
                        <div className="border-t pt-4">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              handleSignOut();
                              setMobileMenuOpen(false);
                            }}
                          >
                            <LogOut className="h-5 w-5 mr-3" />
                            Sign Out
                          </Button>
                        </div>
                      </>
                    )}
                    {!user && (
                      <Link
                        to="/auth"
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Sign In</span>
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* User Section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={profile?.avatar_url || ""}
                        alt={profile?.full_name || ""}
                      />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0) ||
                          user.email?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Credits Section - Simple display */}
                  <div className="px-2 py-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Credits</span>
                      <span className="text-sm text-muted-foreground">
                        {remainingCredits} remaining
                      </span>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/manage-profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/my-properties")}>
                    <Home className="mr-2 h-4 w-4" />
                    <span className="flex items-center justify-between flex-1">
                      My Properties
                      <Badge variant="secondary" className="ml-2">
                        {counts.properties}
                      </Badge>
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/my-reviews")}>
                    <Star className="mr-2 h-4 w-4" />
                    My Reviews
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/my-reports")}>
                    <FileText className="mr-2 h-4 w-4" />
                    My Reports
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/bookmarks")}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span className="flex items-center justify-between flex-1">
                      My Bookmarks
                      <Badge variant="secondary" className="ml-2">
                        {counts.bookmarks}
                      </Badge>
                    </span>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => navigate("/credits")}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span className="flex items-center justify-between flex-1">
                      My AI Assistant Credits
                      <Badge variant="secondary" className="ml-2">
                        {remainingCredits}
                      </Badge>
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => navigate("/properties/create")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    List Property
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button className="bg-primary hover:bg-primary-600">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
