import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ALIAS_STORAGE_KEY = "soulSync_alias_id";

export function useAnonymousIdentity() {
  const [aliasId, setAliasId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initIdentity() {
      let id = localStorage.getItem(ALIAS_STORAGE_KEY);

      if (!id) {
        // Generate new Identity
        const newId = crypto.randomUUID();
        const animalNames = ["Panda", "Koala", "Fox", "Otter", "Dolphin", "Crane"];
        const randomName = `${animalNames[Math.floor(Math.random() * animalNames.length)]}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const { error } = await supabase
          .from("student_profiles")
          .insert({
            alias_id: newId,
            anonymous_username: randomName,
          });

        if (!error) {
          localStorage.setItem(ALIAS_STORAGE_KEY, newId);
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
