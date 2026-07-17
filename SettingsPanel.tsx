"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import type { SmtpSettings, OAuthSettings, SmmVaultSettings } from "@/types";

export default function SettingsPanel() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [smtp, setSmtp] = useState<SmtpSettings>({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    user: "",
    appPassword: "",
    fromName: "ZXH4 Panel",
  });
  const [oauth, setOAuth] = useState<OAuthSettings>({ googleClientId: "", googleClientSecret: "", enabled: false });
  const [api, setApi] = useState<SmmVaultSettings>({ baseUrl: "", apiKey: "" });
  const [savedTab, setSavedTab] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const configSnap = await getDoc(doc(db, "system_settings", "config"));
      if (configSnap.exists()) setMaintenanceMode(Boolean(configSnap.data().maintenanceMode));

      const smtpSnap = await getDoc(doc(db, "system_settings", "smtp"));
      if (smtpSnap.exists()) setSmtp(smtpSnap.data() as SmtpSettings);

      const authSnap = await getDoc(doc(db, "system_settings", "auth"));
      if (authSnap.exists()) setOAuth(authSnap.data() as OAuthSettings);

      const apiSnap = await getDoc(doc(db, "system_settings", "api"));
      if (apiSnap.exists()) setApi(apiSnap.data() as SmmVaultSettings);
    })();
  }, []);

  async function save(section: string) {
    if (section === "maintenance") await setDoc(doc(db, "system_settings", "config"), { maintenanceMode });
    if (section === "smtp") await setDoc(doc(db, "system_settings", "smtp"), smtp);
    if (section === "oauth") await setDoc(doc(db, "system_settings", "auth"), oauth);
    if (section === "api") await setDoc(doc(db, "system_settings", "api"), api);
    setSavedTab(section);
    setTimeout(() => setSavedTab(null), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <h3 className="neon-text font-semibold text-sm">Maintenance Mode</h3>
          <p className="text-xs text-white/50 mt-1">Redirects all non-admin traffic to the maintenance page.</p>
        </div>
        <button
          onClick={() => setMaintenanceMode((v) => !v)}
          className={`w-14 h-8 rounded-full relative transition-colors ${
            maintenanceMode ? "bg-amethyst-gradient" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
              maintenanceMode ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>
      <button onClick={() => save("maintenance")} className="ghost-btn text-xs">
        {savedTab === "maintenance" ? "Saved ✓" : "Save Maintenance Setting"}
      </button>

      <div className="glass-card p-5">
        <h3 className="neon-text font-semibold text-sm mb-3">Google SMTP</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input-field col-span-2"
            placeholder="Gmail / Workspace address"
            value={smtp.user}
            onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
          />
          <input
            type="password"
            className="input-field col-span-2"
            placeholder="Google App Password"
            value={smtp.appPassword}
            onChange={(e) => setSmtp({ ...smtp, appPassword: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="From name"
            value={smtp.fromName}
            onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="SMTP host"
            value={smtp.host}
            onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
          />
        </div>
        <button onClick={() => save("smtp")} className="ghost-btn text-xs mt-3">
          {savedTab === "smtp" ? "Saved ✓" : "Save SMTP Settings"}
        </button>
      </div>

      <div className="glass-card p-5">
        <h3 className="neon-text font-semibold text-sm mb-3">Google OAuth</h3>
        <input
          className="input-field mb-3"
          placeholder="Google Client ID"
          value={oauth.googleClientId}
          onChange={(e) => setOAuth({ ...oauth, googleClientId: e.target.value })}
        />
        <input
          type="password"
          className="input-field mb-3"
          placeholder="Google Client Secret"
          value={oauth.googleClientSecret}
          onChange={(e) => setOAuth({ ...oauth, googleClientSecret: e.target.value })}
        />
        <label className="flex items-center gap-2 text-xs text-white/60 mb-3">
          <input
            type="checkbox"
            checked={oauth.enabled}
            onChange={(e) => setOAuth({ ...oauth, enabled: e.target.checked })}
          />
          Enable Google Sign-In
        </label>
        <button onClick={() => save("oauth")} className="ghost-btn text-xs">
          {savedTab === "oauth" ? "Saved ✓" : "Save OAuth Settings"}
        </button>
      </div>

      <div className="glass-card p-5">
        <h3 className="neon-text font-semibold text-sm mb-3">SmmVault API</h3>
        <input
          className="input-field mb-3"
          placeholder="API Base URL"
          value={api.baseUrl}
          onChange={(e) => setApi({ ...api, baseUrl: e.target.value })}
        />
        <input
          type="password"
          className="input-field mb-3"
          placeholder="API Key"
          value={api.apiKey}
          onChange={(e) => setApi({ ...api, apiKey: e.target.value })}
        />
        <button onClick={() => save("api")} className="ghost-btn text-xs">
          {savedTab === "api" ? "Saved ✓" : "Save API Settings"}
        </button>
      </div>
    </div>
  );
}
