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
          // DB row failed — store id locally but mark profile as NOT persisted.
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
        // id came from localStorage — assume the profile exists in DB
        setProfileExists(true);
      }

      setAliasId(id);
      setIsLoading(false);
    }

    initIdentity();
  }, []);

  return { aliasId, profileExists, isLoading };
}
