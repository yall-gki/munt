"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

type ProfileData = {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  image: string | null;
  emailVerified: string | null;
};

type SessionItem = {
  id: string;
  expires: string;
  isCurrent: boolean;
  tokenSuffix: string;
};

type Preferences = {
  theme: "system" | "light" | "dark";
  currency: "USD" | "EUR" | "GBP" | "JPY";
  language: "en" | "es" | "fr" | "de";
};

const defaultPreferences: Preferences = {
  theme: "system",
  currency: "USD",
  language: "en",
};

export default function AccountSettingsPage() {
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  const [profileForm, setProfileForm] = useState({
    name: "",
    username: "",
    image: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [emailForm, setEmailForm] = useState({
    email: "",
    password: "",
    code: "",
  });
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailRequested, setEmailRequested] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailConfirming, setEmailConfirming] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [preferences, setPreferences] = useState<Preferences>(
    defaultPreferences
  );
  const [savingPreferences, setSavingPreferences] = useState(false);

  const [deleteForm, setDeleteForm] = useState({
    confirmation: "",
    password: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const emailValid = useMemo(
    () => /\S+@\S+\.\S+/.test(emailForm.email),
    [emailForm.email]
  );

  useEffect(() => {
    if (emailCooldown <= 0) return;
    const timer = setInterval(
      () => setEmailCooldown((prev) => Math.max(0, prev - 1)),
      1000
    );
    return () => clearInterval(timer);
  }, [emailCooldown]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const stored = localStorage.getItem("munt:preferences");
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch {
        localStorage.removeItem("munt:preferences");
      }
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [profileRes, sessionRes, prefRes] = await Promise.all([
          axios.get("/api/account/profile"),
          axios.get("/api/account/sessions"),
          axios.get("/api/account/preferences"),
        ]);

        const profileData = profileRes.data?.user as ProfileData;
        setProfile(profileData);
        setHasPassword(!!profileRes.data?.hasPassword);
        setProfileForm({
          name: profileData?.name ?? "",
          username: profileData?.username ?? "",
          image: profileData?.image ?? "",
        });
        setSessions(sessionRes.data?.sessions ?? []);
        setPreferences(prefRes.data?.preferences ?? defaultPreferences);
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [status]);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const res = await axios.patch("/api/account/profile", profileForm);
      setProfile(res.data.user);
      toast.success("Profile updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleEmailRequest = async () => {
    setEmailLoading(true);
    try {
      const res = await axios.post("/api/account/email/request", {
        email: emailForm.email,
        password: emailForm.password || undefined,
      });
      setEmailRequested(true);
      setEmailCooldown(60);
      toast.success(res.data?.message || "Verification code sent");
    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.retryAfterSeconds) {
        setEmailCooldown(data.retryAfterSeconds);
      }
      toast.error(data?.error || "Failed to send verification code");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailConfirm = async () => {
    setEmailConfirming(true);
    try {
      await axios.post("/api/account/email/confirm", {
        email: emailForm.email,
        code: emailForm.code,
      });
      setEmailRequested(false);
      setEmailForm({ email: "", password: "", code: "" });
      toast.success("Email updated");
      const profileRes = await axios.get("/api/account/profile");
      setProfile(profileRes.data?.user);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update email");
    } finally {
      setEmailConfirming(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setPasswordLoading(true);
    try {
      await axios.post("/api/account/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePreferencesSave = async () => {
    setSavingPreferences(true);
    try {
      await axios.post("/api/account/preferences", preferences);
      localStorage.setItem("munt:preferences", JSON.stringify(preferences));
      toast.success("Preferences saved");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to update preferences"
      );
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleRevokeOthers = async () => {
    try {
      const res = await axios.post("/api/account/sessions/revoke", {
        revokeOthers: true,
      });
      toast.success(`Logged out ${res.data?.revoked ?? 0} sessions`);
      const refreshed = await axios.get("/api/account/sessions");
      setSessions(refreshed.data?.sessions ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to revoke sessions");
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await axios.post("/api/account/sessions/revoke", { sessionId: id });
      const refreshed = await axios.get("/api/account/sessions");
      setSessions(refreshed.data?.sessions ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to revoke session");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteForm.confirmation !== "DELETE") {
      toast.error("Type DELETE to confirm");
      return;
    }
    setDeleteLoading(true);
    try {
      await axios.post("/api/account/delete", {
        confirmation: deleteForm.confirmation,
        password: deleteForm.password || undefined,
      });
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/login" });
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="min-h-full bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-semibold mb-2">Account Settings</h1>
        <p className="text-zinc-400 mb-6">
          You need to be signed in to manage your account.
        </p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-full bg-zinc-950 text-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Account Settings
          </p>
          <h1 className="text-3xl font-semibold mt-2">
            Manage your profile and security
          </h1>
          <p className="text-zinc-400 mt-2">
            Keep your credentials, preferences, and devices up to date.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="space-y-6">
            <Section title="Profile">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full name">
                  <Input
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Username">
                  <Input
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Avatar URL">
                  <Input
                    value={profileForm.image}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        image: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Current email">
                  <Input value={profile?.email ?? ""} disabled />
                </Field>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleProfileSave} disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save profile"}
                </Button>
                {profile?.emailVerified ? (
                  <span className="text-xs text-emerald-400">Email verified</span>
                ) : (
                  <span className="text-xs text-amber-400">
                    Email not verified
                  </span>
                )}
              </div>
            </Section>

            <Section title="Change Email">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="New email">
                  <Input
                    value={emailForm.email}
                    onChange={(e) =>
                      setEmailForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="you@domain.com"
                  />
                </Field>
                {hasPassword && (
                  <Field label="Current password">
                    <Input
                      type="password"
                      value={emailForm.password}
                      onChange={(e) =>
                        setEmailForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                    />
                  </Field>
                )}
              </div>
              {emailRequested && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Verification code">
                    <Input
                      value={emailForm.code}
                      onChange={(e) =>
                        setEmailForm((prev) => ({
                          ...prev,
                          code: e.target.value.replace(/\D/g, "").slice(0, 6),
                        }))
                      }
                      placeholder="6-digit code"
                    />
                  </Field>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Button
                  onClick={handleEmailRequest}
                  disabled={!emailValid || emailLoading || emailCooldown > 0}
                >
                  {emailCooldown > 0
                    ? `Resend in ${emailCooldown}s`
                    : emailLoading
                    ? "Sending..."
                    : emailRequested
                    ? "Resend code"
                    : "Send verification code"}
                </Button>
                {emailRequested && (
                  <Button
                    variant="outline"
                    onClick={handleEmailConfirm}
                    disabled={emailConfirming || emailForm.code.length !== 6}
                  >
                    {emailConfirming ? "Confirming..." : "Confirm email"}
                  </Button>
                )}
              </div>
            </Section>

            <Section title="Change Password">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Current password">
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                  />
                </Field>
                <div />
                <Field label="New password">
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Confirm new password">
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={passwordLoading}
                className="mt-4"
              >
                {passwordLoading ? "Updating..." : "Update password"}
              </Button>
            </Section>
          </div>

          <div className="space-y-6">
            <Section title="Preferences">
              <div className="space-y-4">
                <Field label="Theme">
                  <select
                    value={preferences.theme}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        theme: e.target.value as Preferences["theme"],
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </Field>
                <Field label="Currency">
                  <select
                    value={preferences.currency}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        currency: e.target.value as Preferences["currency"],
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </Field>
                <Field label="Language">
                  <select
                    value={preferences.language}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        language: e.target.value as Preferences["language"],
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </Field>
                <Button
                  onClick={handlePreferencesSave}
                  disabled={savingPreferences}
                >
                  {savingPreferences ? "Saving..." : "Save preferences"}
                </Button>
              </div>
            </Section>

            <Section title="Sessions">
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    No active sessions found.
                  </p>
                ) : (
                  sessions.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2",
                        item.isCurrent && "border-blue-500/50 bg-blue-500/5"
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          Session ••••{item.tokenSuffix}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Expires{" "}
                          {new Date(item.expires).toLocaleString("en-US")}
                        </p>
                      </div>
                      {item.isCurrent ? (
                        <span className="text-xs text-blue-400">Current</span>
                      ) : (
                        <button
                          className="text-xs text-red-400 hover:text-red-300"
                          onClick={() => handleRevokeSession(item.id)}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              <Button
                onClick={handleRevokeOthers}
                variant="subtle"
                className="mt-4 w-full"
              >
                Log out other devices
              </Button>
            </Section>

            <Section
              title="Danger Zone"
              className="border border-rose-500/40 bg-rose-500/5"
            >
              <div className="flex items-start gap-3 text-sm text-rose-200">
                <ShieldAlert className="h-5 w-5 mt-1" />
                <div>
                  <p className="font-semibold">Delete account</p>
                  <p className="text-xs text-rose-200/80 mt-1">
                    This action is permanent. All balances, trades, and
                    strategies will be removed.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <Field label="Type DELETE to confirm">
                  <Input
                    value={deleteForm.confirmation}
                    onChange={(e) =>
                      setDeleteForm((prev) => ({
                        ...prev,
                        confirmation: e.target.value,
                      }))
                    }
                    placeholder="DELETE"
                  />
                </Field>
                {hasPassword && (
                  <Field label="Current password">
                    <Input
                      type="password"
                      value={deleteForm.password}
                      onChange={(e) =>
                        setDeleteForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                    />
                  </Field>
                )}
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="w-full bg-rose-500 hover:bg-rose-400 text-black"
                >
                  {deleteLoading ? "Deleting..." : "Delete account"}
                </Button>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm space-y-4",
        className
      )}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-zinc-300">
      <span>{label}</span>
      {children}
    </label>
  );
}
