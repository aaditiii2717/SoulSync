import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ALIAS_STORAGE_KEY,
  createAnonymousAliasName,
  dispatchIdentityChanged,
} from "@/lib/identity-recovery";

export function useAnonymousIdentity() {
  const [aliasId, setAliasId] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initIdentity() {
      // Check if we already have an authenticated session (e.g. Admin)
      // If so, we don't need to initialize an anonymous student identity
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoading(false);
        return;
      }

      let id = localStorage.getItem(ALIAS_STORAGE_KEY);

      if (!id) {
        // Generate new identity
        const newId = crypto.randomUUID();
        const randomName = createAnonymousAliasName();

        const { error } = await supabase
          .from("student_profiles")
          .upsert(
            { alias_id: newId, anonymous_username: randomName },
            { onConflict: "alias_id" }
          );

        if (error) {
          console.error("[useAnonymousIdentity] student_profiles upsert error:", error);
          localStorage.setItem(ALIAS_STORAGE_KEY, newId);
          dispatchIdentityChanged();
          id = newId;
          setAliasId(id);
          setProfileExists(false);
          setIsLoading(false);
          return;
        }

        localStorage.setItem(ALIAS_STORAGE_KEY, newId);
        dispatchIdentityChanged();
        id = newId;
        setProfileExists(true);
      } else {
        setProfileExists(true);
      }

      setAliasId(id);
      setIsLoading(false);
    }

    initIdentity();
  }, []);

  return { aliasId, profileExists, isLoading };
}
