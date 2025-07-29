import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useServices } from "@/contexts/ServicesContext";
import { supabase } from "@/integrations/supabase/client";

export interface ListingBuffer {
  id: string;
  post_id: string | null;
  post_text: string | null;
  image_urls: string[] | null;
  source_url: string | null;
  extracted_at: string;
  created_at: string;
}

const FACEBOOK_APP_ID = "701950319351567";
const REDIRECT_URI = `${window.location.origin}/facebook-imports`;

export function useFacebookImports() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<ListingBuffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const codeHandledRef = useRef<string | null>(null);
  const { services } = useServices();
  const code = searchParams.get("code");

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  const fetchListings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("listings_buffer")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch listings from buffer imports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const handleFacebookCallback = useCallback(
    async (code: string) => {
      setLoading(false);
      setImporting(true);
      try {
        if (!services || !user || !session?.access_token) return false;
        const response = await fetch(
          `${services["MIGRATIONS"]}/migrate/facebook`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            method: "POST",
            body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
          }
        );

        if (!response.ok) throw response.statusText;
        const result = await response.json();
        toast({
          title: "Success",
          description:
            result.message || "Facebook posts processed successfully",
        });

        return true;
      } catch (error) {
        console.error("Error importing from Facebook:", error);
        toast({
          title: "Error",
          description: "Failed to import Facebook posts",
          variant: "destructive",
        });
      } finally {
        setImporting(false);
      }
    },
    [services, user, session, toast, fetchListings]
  );

  useEffect(() => {
    if (user) {
      if (code && codeHandledRef.current !== code) {
        codeHandledRef.current = code;
        handleFacebookCallback(code).then((complete) => {
          if (complete) {
            console.log("Request complete.");
            searchParams.delete("code");
            navigate({ search: searchParams.toString() }, { replace: true });
          }
        });
      } else {
        fetchListings();
      }
    }
  }, [user, code]);

  const deleteListing = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("listings_buffer")
          .delete()
          .eq("id", id);
        if (error) throw error;
        setListings((prev) => prev.filter((listing) => listing.id !== id));
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        toast({
          title: "Success",
          description: "Listing removed from imports",
        });
      } catch (error) {
        console.error("Error deleting listing:", error);
        toast({
          title: "Error",
          description: "Failed to delete listing",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(listings.map((listing) => listing.id)));
  }, [listings]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleFetchFromFacebook = useCallback(() => {
    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=user_posts&response_type=code`;
    window.location.href = facebookAuthUrl;
  }, []);

  const handleExtractSelected = useCallback(() => {
    if (selectedCount === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one listing to extract",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmModal(true);
  }, [selectedCount, toast]);

  const confirmExtract = useCallback(async () => {
    setShowConfirmModal(false);
    setParsing(true);
    try {
      if (!services || !user || !session?.access_token) return;
      const response = await fetch(`${services["MIGRATIONS"]}/parse`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        method: "POST",
        body: JSON.stringify({
          post_ids: Array.from(selectedIds),
          user_id: user.id,
        }),
      });
      if (!response.ok) throw await response.text();
      const result = await response.json();
      const addedCount = result.properties_added || 0;
      toast({
        title: "Extraction Complete",
        description: `${addedCount} properties were added. ${
          selectedCount - addedCount
        } posts lacked sufficient information.`,
      });
      navigate("/my-properties");
    } catch (error) {
      console.error("Error parsing posts:", error);
      toast({
        title: "Error",
        description: "Failed to parse and extract posts",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  }, [services, user, session, selectedIds, selectedCount, toast, navigate]);

  return {
    user,
    listings,
    loading,
    importing,
    parsing,
    selectedIds,
    selectedCount,
    showConfirmModal,
    setShowConfirmModal,
    fetchListings,
    handleFacebookCallback,
    deleteListing,
    toggleSelection,
    selectAll,
    clearSelection,
    handleFetchFromFacebook,
    handleExtractSelected,
    confirmExtract,
  };
}
