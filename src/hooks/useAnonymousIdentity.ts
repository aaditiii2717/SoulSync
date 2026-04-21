import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ALIAS_STORAGE_KEY,
  createAnonymousAliasName,
  dispatchIdentityChanged,
} from "@/lib/identity-recovery";

export function useAnonymousIdentity() {
  const [aliasId, setAliasId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initIdentity() {
      let id = localStorage.getItem(ALIAS_STORAGE_KEY);

      if (!id) {
        // Generate new Identity
        const newId = crypto.randomUUID();
        const randomName = createAnonymousAliasName();

        const { error } = await supabase
          .from("student_profiles")
          .insert({
            alias_id: newId,
            anonymous_username: randomName,
          });

        if (!error) {
          localStorage.setItem(ALIAS_STORAGE_KEY, newId);
          dispatchIdentityChanged();
          id = newId;
        }
      }

      setAliasId(id);
      setIsLoading(false);
    }

    initIdentity();
  }, []);

  return { aliasId, isLoading };
}
