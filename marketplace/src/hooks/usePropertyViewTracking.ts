import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePropertyViewTracking() {
  const { user } = useAuth();

  const trackViewMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase.from("property_views").insert({
        property_id: propertyId,
        user_id: user?.id || null,
      });

      if (error) {
        console.error("Error tracking property view:", error);
        throw error;
      }
    },
    onError: (error) => {
      console.error("Failed to track property view:", error);
    },
  });

  // Only track if the user is not the owner
  const trackPropertyView = (propertyId: string, agentId?: string) => {
    if (user?.id && agentId && user.id === agentId) return;
    trackViewMutation.mutate(propertyId);
  };

  return {
    trackPropertyView,
    isTracking: trackViewMutation.isPending,
  };
}
