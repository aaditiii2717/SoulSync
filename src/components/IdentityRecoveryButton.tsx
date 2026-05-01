import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  ALIAS_STORAGE_KEY,
  RECOVERY_PLAIN_KEY_STORAGE_KEY,
  RECOVERY_USERNAME_STORAGE_KEY,
  SOULSYNC_IDENTITY_EVENT,
  createAnonymousAliasName,
  downloadRecoveryFile,
  generateUsernameSuggestions,
  getRecoveryKeyStrength,
  hashRecoveryKey,
  normalizeRecoveryUsername,
  storeRecoveryIdentityLocally,
} from "@/lib/identity-recovery";
import { cn } from "@/lib/utils";

type IdentityView = "setup" | "recover" | "card";

interface IdentityRecoveryButtonProps {
  className?: string;
  variant?: "default" | "muted-link";
  forceView?: IdentityView;
}

interface StudentIdentityProfile {
  alias_id: string;
  anonymous_username: string;
  recovery_key_hash: string | null;
  username: string | null;
}

export function IdentityRecoveryButton({ className, variant = "default", forceView }: IdentityRecoveryButtonProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<IdentityView>("setup");
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const [aliasId, setAliasId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentIdentityProfile | null>(null);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [storedRecoveryKey, setStoredRecoveryKey] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [usernameInput, setUsernameInput] = useState("");
  const [recoveryKeyInput, setRecoveryKeyInput] = useState("");
  const [confirmRecoveryKeyInput, setConfirmRecoveryKeyInput] = useState("");
  const [savedRecoveryKey, setSavedRecoveryKey] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState(() => generateUsernameSuggestions());
  const [recoverUsername, setRecoverUsername] = useState("");
  const [recoverKeyInput, setRecoverKeyInput] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [recoveringIdentity, setRecoveringIdentity] = useState(false);
  const [showStoredRecoveryKey, setShowStoredRecoveryKey] = useState(false);
  const [showSetupRecoveryKey, setShowSetupRecoveryKey] = useState(false);
  const [showSetupRecoveryKeyConfirm, setShowSetupRecoveryKeyConfirm] = useState(false);
  const [showRecoverKeyInput, setShowRecoverKeyInput] = useState(false);

  const normalizedUsername = useMemo(
    () => normalizeRecoveryUsername(usernameInput),
    [usernameInput],
  );
  const normalizedRecoverUsername = useMemo(
    () => normalizeRecoveryUsername(recoverUsername),
    [recoverUsername],
  );
  const recoveryStrength = useMemo(
    () => getRecoveryKeyStrength(recoveryKeyInput),
    [recoveryKeyInput],
  );
  const recoveryKeysMatch =
    recoveryKeyInput.length >= 8 && recoveryKeyInput === confirmRecoveryKeyInput;
  const canFinishSetup =
    Boolean(aliasId) && Boolean(normalizedUsername) && recoveryKeysMatch && savedRecoveryKey;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromStorage = () => {
      setAliasId(localStorage.getItem(ALIAS_STORAGE_KEY));
      setProfileUsername(localStorage.getItem(RECOVERY_USERNAME_STORAGE_KEY));
      setStoredRecoveryKey(localStorage.getItem(RECOVERY_PLAIN_KEY_STORAGE_KEY) ?? "");
    };

    syncFromStorage();
    window.addEventListener(SOULSYNC_IDENTITY_EVENT, syncFromStorage);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener(SOULSYNC_IDENTITY_EVENT, syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  useEffect(() => {
    if (!aliasId) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    const currentAliasId = aliasId;
    let cancelled = false;

    async function loadIdentityProfile() {
      // Skip if we have an active session (Admin/Volunteer)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);

      const { data, error } = await supabase
        .from("student_profiles")
        .select("alias_id, anonymous_username, recovery_key_hash, username")
        .eq("alias_id", currentAliasId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Failed to load identity profile:", error);
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      const nextProfile = (data as StudentIdentityProfile | null) ?? null;
      const nextUsername = nextProfile?.username?.trim() || null;

      setProfile(nextProfile);
      setProfileUsername(nextUsername);
      setProfileLoading(false);

      if (typeof window === "undefined") return;

      if (nextUsername) {
        localStorage.setItem(RECOVERY_USERNAME_STORAGE_KEY, nextUsername);
      } else {
        localStorage.removeItem(RECOVERY_USERNAME_STORAGE_KEY);
        localStorage.removeItem(RECOVERY_PLAIN_KEY_STORAGE_KEY);
        setStoredRecoveryKey("");
      }
    }

    loadIdentityProfile();

    return () => {
      cancelled = true;
    };
  }, [aliasId]);

  useEffect(() => {
    if (setupStep === 2) {
      setSavedRecoveryKey(false);
    }
  }, [setupStep, normalizedUsername, recoveryKeyInput, confirmRecoveryKeyInput]);

  const buttonLabel = profileUsername
    ? `Hello, ${profileUsername} 👋`
    : "Protect My Journey ⚠️";
  const isButtonLoading = !aliasId || profileLoading;
  const maskedStoredRecoveryKey = storedRecoveryKey
    ? "•".repeat(Math.max(12, storedRecoveryKey.length))
    : "Saved only in your downloaded recovery file";

  const handleDialogOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) return;

    setView(forceView || (profileUsername ? "card" : "setup"));
    setSetupStep(1);
    setUsernameSuggestions(generateUsernameSuggestions());
    setUsernameInput(profileUsername ?? "");
    setRecoveryKeyInput("");
    setConfirmRecoveryKeyInput("");
    setSavedRecoveryKey(false);
    setRecoverUsername("");
    setRecoverKeyInput("");
    setCheckingUsername(false);
    setSavingIdentity(false);
    setRecoveringIdentity(false);
    setShowStoredRecoveryKey(false);
    setShowSetupRecoveryKey(false);
    setShowSetupRecoveryKeyConfirm(false);
    setShowRecoverKeyInput(false);
  };

  const copyToClipboard = async (value: string, label: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch (error) {
      console.error(`Failed to copy ${label}:`, error);
      toast.error(`Could not copy ${label.toLowerCase()}.`);
    }
  };

  const handlePickSuggestion = (suggestion: string) => {
    setUsernameInput(suggestion);
  };

  const handleNextFromUsername = async () => {
    if (!aliasId) {
      toast.error("Your anonymous ID is still getting ready. Try again in a moment.");
      return;
    }

    if (normalizedUsername.length < 3) {
      toast.error("Choose a username with at least 3 characters.");
      return;
    }

    setCheckingUsername(true);

    const { data, error } = await supabase
      .from("student_profiles")
      .select("alias_id")
      .eq("username", normalizedUsername)
      .maybeSingle();

    setCheckingUsername(false);

    if (error) {
      console.error("Username lookup failed:", error);
      toast.error("Could not check that username right now. Please try again.");
      return;
    }

    if (data && data.alias_id !== aliasId) {
      toast.error("That username is already taken. Try another one.");
      return;
    }

    setUsernameInput(normalizedUsername);
    setSetupStep(2);
  };

  const handleDownloadRecoveryFile = () => {
    if (!normalizedUsername || recoveryKeyInput.length < 8) {
      toast.error("Add your username and a recovery key first.");
      return;
    }

    downloadRecoveryFile(normalizedUsername, recoveryKeyInput);
    toast.success("Recovery file downloaded.");
  };

  const handleFinishSetup = async () => {
    if (!aliasId) {
      toast.error("Your anonymous ID is still getting ready. Try again in a moment.");
      return;
    }

    if (normalizedUsername.length < 3) {
      toast.error("Your username needs at least 3 characters.");
      return;
    }

    if (recoveryKeyInput.length < 8) {
      toast.error("Your recovery key must be at least 8 characters.");
      return;
    }

    if (recoveryKeyInput !== confirmRecoveryKeyInput) {
      toast.error("Your recovery key entries do not match.");
      return;
    }

    if (!savedRecoveryKey) {
      toast.error("Confirm that you saved or downloaded your recovery key first.");
      return;
    }

    setSavingIdentity(true);

    const recoveryKeyHash = await hashRecoveryKey(recoveryKeyInput);
    const fallbackAnonymousName = profile?.anonymous_username || createAnonymousAliasName();

    const { data: savedProfile, error } = await supabase
      .from("student_profiles")
      .upsert(
        {
          alias_id: aliasId,
          anonymous_username: fallbackAnonymousName,
          recovery_key_hash: recoveryKeyHash,
          username: normalizedUsername,
        },
        { onConflict: "alias_id" },
      )
      .select("alias_id, anonymous_username, recovery_key_hash, username")
      .single();

    setSavingIdentity(false);

    if (error) {
      console.error("Identity setup failed:", error);
      toast.error(
        error.code === "23505"
          ? "That username is already taken. Try another one."
          : `We couldn't save your recovery setup. ${error.message}`,
      );
      return;
    }

    storeRecoveryIdentityLocally({
      aliasId,
      username: normalizedUsername,
      recoveryKey: recoveryKeyInput,
    });

    setProfile(savedProfile as StudentIdentityProfile);
    setProfileUsername(savedProfile.username || normalizedUsername);
    setStoredRecoveryKey(recoveryKeyInput);
    setView("card");
    toast.success("Your recovery details are protected now.");
  };

  const handleRecoverAccount = async () => {
    if (normalizedRecoverUsername.length < 3) {
      toast.error("Enter the username you saved in your recovery file.");
      return;
    }

    if (recoverKeyInput.length < 8) {
      toast.error("Enter your recovery key.");
      return;
    }

    setRecoveringIdentity(true);
    const recoveryKeyHash = await hashRecoveryKey(recoverKeyInput);

    const { data, error } = await supabase
      .from("student_profiles")
      .select("alias_id, username")
      .eq("username", normalizedRecoverUsername)
      .eq("recovery_key_hash", recoveryKeyHash)
      .maybeSingle();

    setRecoveringIdentity(false);

    if (error || !data?.alias_id) {
      console.error("Identity recovery failed:", error);
      toast.error("That username and recovery key did not match our records.");
      return;
    }

    storeRecoveryIdentityLocally({
      aliasId: data.alias_id,
      username: data.username || normalizedRecoverUsername,
      recoveryKey: recoverKeyInput,
    });

    toast.success("Your account has been restored! Refreshing...");

    window.setTimeout(() => {
      window.location.reload();
    }, 900);
  };

  return (
    <>
      {variant === "muted-link" ? (
        <button
          type="button"
          className={cn(
            "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline",
            className
          )}
          onClick={() => handleDialogOpen(true)}
        >
          Returning user? Restore your identity &rarr;
        </button>
      ) : (
        <Button
          type="button"
          variant={profileUsername ? "outline" : "heroOutline"}
          className={cn(
            "min-w-0 rounded-full border-white/55 px-4 py-2 text-left shadow-sm hover:bg-white",
            profileUsername ? "bg-white/75" : "bg-amber-50 text-amber-700 border-amber-200/50 hover:bg-amber-100",
            className,
          )}
          onClick={() => handleDialogOpen(true)}
          disabled={isButtonLoading}
        >
          {isButtonLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing your safe ID...
            </>
          ) : (
            <span className="truncate">{buttonLabel}</span>
          )}
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2rem] border-white/70 bg-background/95 p-0 sm:max-w-2xl">
          <div className="border-b border-border/60 bg-muted/30 px-6 py-5">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {view === "card"
                  ? "Your Identity Card"
                  : view === "recover"
                    ? "Recover My Account"
                    : setupStep === 1
                      ? "Login"
                      : "Create your recovery key"}
              </DialogTitle>
              <DialogDescription className="max-w-xl text-sm leading-relaxed">
                {view === "card"
                  ? "Keep these details somewhere only you can access. They restore the exact same anonymous record."
                  : view === "recover"
                    ? "Enter the username and recovery key you saved earlier. We'll restore your original UUID back into this browser."
                    : setupStep === 1
                      ? "Choose a username you can remember. This is only for recovery and does not change how the rest of Soul Sync works."
                      : "This is the only way to recover your account on a new device. We never store it in plain text."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-6 px-6 py-6">
            {view === "card" && (
              <>
                <div className="grid gap-4 rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Username
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                        <UserRound className="h-4 w-4 text-primary" />
                        <span className="break-all">{profileUsername}</span>
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => copyToClipboard(profileUsername || "", "Username")}
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>

                  <div className="grid gap-3 rounded-[1.25rem] border border-dashed border-primary/25 bg-primary/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Recovery Key
                        </p>
                        <p className="mt-2 break-all font-mono text-sm">
                          {showStoredRecoveryKey && storedRecoveryKey
                            ? storedRecoveryKey
                            : maskedStoredRecoveryKey}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => setShowStoredRecoveryKey((value) => !value)}
                          disabled={!storedRecoveryKey}
                        >
                          {showStoredRecoveryKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => copyToClipboard(storedRecoveryKey, "Recovery key")}
                          disabled={!storedRecoveryKey}
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    {!storedRecoveryKey && (
                      <p className="text-xs text-muted-foreground">
                        This device does not have the plain recovery key stored anymore. Use the recovery file you downloaded during setup.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="hero"
                    className="flex-1 rounded-full"
                    onClick={() => {
                      if (!profileUsername || !storedRecoveryKey) {
                        toast.error("Your plain recovery key is only available in the file you downloaded.");
                        return;
                      }

                      downloadRecoveryFile(profileUsername, storedRecoveryKey);
                      toast.success("Recovery file downloaded.");
                    }}
                    disabled={!profileUsername || !storedRecoveryKey}
                  >
                    <Download className="h-4 w-4" />
                    Download Recovery File
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => copyToClipboard(profileUsername || "", "Username")}
                  >
                    <Copy className="h-4 w-4" />
                    Copy Username
                  </Button>
                </div>

                <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p>Never share your recovery key. We cannot recover it for you.</p>
                  </div>
                </div>
              </>
            )}

            {view === "setup" && setupStep === 1 && (
              <>
                <div className="grid gap-3">
                  <label className="text-sm font-medium" htmlFor="recovery-username">
                    Choose an anonymous username
                  </label>
                  <Input
                    id="recovery-username"
                    value={usernameInput}
                    onChange={(event) => setUsernameInput(event.target.value)}
                    placeholder="sleepy-mango-7"
                    className="h-12 rounded-2xl px-4"
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll save it in lowercase for recovery:{" "}
                    <span className="font-medium text-foreground">
                      {normalizedUsername || "pick-a-username"}
                    </span>
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-border/70 bg-card p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Try one of these</p>
                      <p className="text-xs text-muted-foreground">
                        Cute, memorable usernames work best for recovery.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setUsernameSuggestions(generateUsernameSuggestions())}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Suggest more
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {usernameSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handlePickSuggestion(suggestion)}
                        className="rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    className="text-left text-sm font-medium text-primary transition-opacity hover:opacity-80"
                    onClick={() => setView("recover")}
                  >
                    Lost your data? Recover your account →
                  </button>
                  <Button
                    type="button"
                    variant="hero"
                    className="rounded-full"
                    onClick={handleNextFromUsername}
                    disabled={!aliasId || checkingUsername}
                  >
                    {checkingUsername ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {view === "setup" && setupStep === 2 && (
              <>
                <div className="rounded-[1.4rem] border border-primary/20 bg-primary/5 px-4 py-4 text-sm">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p>
                      Your recovery file will restore the exact same UUID already linked to your moods, bookings, check-ins, and chat memory.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="recovery-key-input">
                      Type your recovery key
                    </label>
                    <div className="relative">
                      <Input
                        id="recovery-key-input"
                        type={showSetupRecoveryKey ? "text" : "password"}
                        value={recoveryKeyInput}
                        onChange={(event) => setRecoveryKeyInput(event.target.value)}
                        placeholder="At least 8 characters"
                        className="h-12 rounded-2xl px-4 pr-11"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                        onClick={() => setShowSetupRecoveryKey((value) => !value)}
                      >
                        {showSetupRecoveryKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="recovery-key-confirm">
                      Confirm recovery key
                    </label>
                    <div className="relative">
                      <Input
                        id="recovery-key-confirm"
                        type={showSetupRecoveryKeyConfirm ? "text" : "password"}
                        value={confirmRecoveryKeyInput}
                        onChange={(event) => setConfirmRecoveryKeyInput(event.target.value)}
                        placeholder="Type it again"
                        className="h-12 rounded-2xl px-4 pr-11"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                        onClick={() => setShowSetupRecoveryKeyConfirm((value) => !value)}
                      >
                        {showSetupRecoveryKeyConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border/70 bg-card p-4">
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">Password strength</span>
                    <span className="capitalize text-muted-foreground">{recoveryStrength.label}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        recoveryStrength.label === "strong"
                          ? "bg-safe"
                          : recoveryStrength.label === "okay"
                            ? "bg-amber-500"
                            : "bg-destructive",
                      )}
                      style={{ width: `${recoveryStrength.value}%` }}
                    />
                  </div>
                  {confirmRecoveryKeyInput && !recoveryKeysMatch && (
                    <p className="mt-2 text-xs text-destructive">
                      These two recovery key entries do not match yet.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="heroOutline"
                    className="flex-1 rounded-full"
                    onClick={handleDownloadRecoveryFile}
                    disabled={!normalizedUsername || recoveryKeyInput.length < 8}
                  >
                    <Download className="h-4 w-4" />
                    Download Recovery Key
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setSetupStep(1)}
                  >
                    Back
                  </Button>
                </div>

                <label className="flex items-start gap-3 rounded-[1.25rem] border border-border/70 bg-card px-4 py-4 text-sm">
                  <Checkbox
                    checked={savedRecoveryKey}
                    onCheckedChange={(checked) => setSavedRecoveryKey(checked === true)}
                    className="mt-0.5"
                  />
                  <span>✅ I have saved or downloaded my recovery key</span>
                </label>

                <Button
                  type="button"
                  variant="hero"
                  className="w-full rounded-full"
                  disabled={!canFinishSetup || savingIdentity}
                  onClick={handleFinishSetup}
                >
                  {savingIdentity ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finishing setup...
                    </>
                  ) : (
                    "Finish Setup"
                  )}
                </Button>
              </>
            )}

            {view === "recover" && (
              <>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="recover-username">
                      Username
                    </label>
                    <Input
                      id="recover-username"
                      value={recoverUsername}
                      onChange={(event) => setRecoverUsername(event.target.value)}
                      placeholder="sleepy-mango-7"
                      className="h-12 rounded-2xl px-4"
                      autoComplete="username"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="recover-key">
                      Recovery key
                    </label>
                    <div className="relative">
                      <Input
                        id="recover-key"
                        type={showRecoverKeyInput ? "text" : "password"}
                        value={recoverKeyInput}
                        onChange={(event) => setRecoverKeyInput(event.target.value)}
                        placeholder="Enter your recovery key"
                        className="h-12 rounded-2xl px-4 pr-11"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                        onClick={() => setShowRecoverKeyInput((value) => !value)}
                      >
                        {showRecoverKeyInput ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-border/70 bg-card px-4 py-4 text-sm text-muted-foreground">
                  We only compare the hashed recovery key in Supabase. The plain key never gets sent or stored there.
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    className="text-left text-sm font-medium text-primary transition-opacity hover:opacity-80"
                    onClick={() => setView(profileUsername ? "card" : "setup")}
                  >
                    ← Back to identity setup
                  </button>
                  <Button
                    type="button"
                    variant="hero"
                    className="rounded-full"
                    onClick={handleRecoverAccount}
                    disabled={recoveringIdentity}
                  >
                    {recoveringIdentity ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Restoring...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        Restore My Account
                      </>
                    )}
                  </Button>
                </div>

                {normalizedRecoverUsername && (
                  <p className="text-xs text-muted-foreground">
                    Looking for username:{" "}
                    <span className="font-medium text-foreground">
                      {normalizedRecoverUsername}
                    </span>
                  </p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
