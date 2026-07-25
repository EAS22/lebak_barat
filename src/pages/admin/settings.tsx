import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettings, updateSettings, type SettingsRecord } from "@/lib/adminApi";
import { Save, ExternalLink } from "lucide-react";

interface AuthUser {
  id: string;
  username: string;
  role: string;
}

interface Props {
  currentUser: AuthUser | null;
}

export default function SettingsPage({ currentUser }: Props) {
  const [settings, setSettings] = useState<SettingsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    landingWaNumber: "",
    landingWaLabel: "",
    buperName: "",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getSettings();
        setSettings(data);
        setForm({
          landingWaNumber: data.landing_wa_number || "",
          landingWaLabel: data.landing_wa_label || "",
          buperName: data.buper_name || "",
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await updateSettings({
        landingWaNumber: form.landingWaNumber,
        landingWaLabel: form.landingWaLabel || undefined,
        buperName: form.buperName || undefined,
      });
      setSettings(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  if (currentUser?.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">403 — Akses Ditolak</h2>
          <p className="text-gray-500">Halaman ini hanya untuk super_admin.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  const waLink = form.landingWaNumber ? `https://wa.me/${form.landingWaNumber.replace(/^0/, "62")}` : "";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Pengaturan</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>Tutup</button>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-md text-sm">
          Pengaturan berhasil disimpan.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Kontak WhatsApp Landing Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nomor WhatsApp</Label>
            <Input
              value={form.landingWaNumber}
              onChange={(e) => setForm((f) => ({ ...f, landingWaNumber: e.target.value }))}
              placeholder="628xxxxxxxxxx"
            />
            {waLink && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                Preview:{" "}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline inline-flex items-center gap-1"
                >
                  {waLink}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Label Tombol WA</Label>
            <Input
              value={form.landingWaLabel}
              onChange={(e) => setForm((f) => ({ ...f, landingWaLabel: e.target.value }))}
              placeholder="Admin Booking"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Buper</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Buper</Label>
            <Input
              value={form.buperName}
              onChange={(e) => setForm((f) => ({ ...f, buperName: e.target.value }))}
              placeholder="Bumi Perkemahan Lebak Barat"
            />
          </div>
        </CardContent>
      </Card>

      {settings && (
        <p className="text-xs text-gray-400">
          Terakhir diperbarui:{" "}
          {settings.updated_at
            ? new Date(settings.updated_at).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "—"}
        </p>
      )}

      <Button onClick={handleSave} disabled={saving || !form.landingWaNumber}>
        <Save className="h-4 w-4 mr-1" />
        {saving ? "Menyimpan..." : "Simpan Pengaturan"}
      </Button>
    </div>
  );
}
