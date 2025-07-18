
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useNeighbourhoods() {
  return useQuery({
    queryKey: ['neighbourhoods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('neighbourhoods')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}
