"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveTranslation, deleteTranslation } from "@/lib/admin/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, AlertTriangle, Check, X } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────

interface TranslationValue {
  id: number;
  value: string;
}

interface TranslationPair {
  key: string;
  en?: TranslationValue;
  he?: TranslationValue;
}

interface EditingCell {
  key: string;
  lang: "en" | "he";
}

// ─── Constants ──────────────────────────────────────────────

const NAMESPACES = [
  { value: "all", label: "All Namespaces" },
  { value: "nav", label: "Navigation" },
  { value: "common", label: "Common" },
  { value: "auth", label: "Authentication" },
  { value: "profile", label: "Profile" },
  { value: "events", label: "Events" },
  { value: "home", label: "Homepage" },
  { value: "matchmaking", label: "Matchmaking" },
  { value: "vip", label: "VIP" },
  { value: "contact", label: "Contact" },
  { value: "footer", label: "Footer" },
  { value: "meta", label: "SEO Meta" },
  { value: "success_stories", label: "Success Stories" },
  { value: "faqs", label: "FAQs" },
  { value: "cookie", label: "Cookie" },
  { value: "blog", label: "Blog" },
  { value: "admin", label: "Admin" },
  { value: "my_events", label: "My Events" },
  { value: "matches", label: "Matches" },
];

// ─── Inline edit cell ───────────────────────────────────────

function InlineEditCell({
  value,
  dir,
  onSave,
  onCancel,
  onTab,
}: {
  value: string;
  dir: "ltr" | "rtl";
  onSave: (newValue: string) => void;
  onCancel: () => void;
  onTab?: () => void;
}) {
  const [text, setText] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const didCommitRef = useRef(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.focus();
      el.setSelectionRange(0, el.value.length);
    }
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      didCommitRef.current = true;
      onSave(text);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      didCommitRef.current = true;
      onCancel();
    }
    if (e.key === "Tab" && onTab) {
      e.preventDefault();
      didCommitRef.current = true;
      onSave(text);
      onTab();
    }
  }

  function handleBlur() {
    // Cancel on click-outside; skip if Enter/Esc/Tab already handled it
    requestAnimationFrame(() => {
      if (!didCommitRef.current) {
        onCancel();
      }
    });
  }

  const rows = Math.max(2, text.split("\n").length);

  return (
    <div className="space-y-1">
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        dir={dir}
        rows={rows}
        className="text-sm resize-none ring-2 ring-primary/50 focus-visible:ring-primary/50"
      />
      <p className="text-[10px] text-muted-foreground">
        Enter to save &middot; Esc to cancel
      </p>
    </div>
  );
}

// ─── Desktop grid row ───────────────────────────────────────

function TranslationGridRow({
  pair,
  editingCell,
  savingCell,
  onClickCell,
  onSaveCell,
  onCancelEdit,
  onTabToNext,
  onDelete,
}: {
  pair: TranslationPair;
  editingCell: EditingCell | null;
  savingCell: EditingCell | null;
  onClickCell: (key: string, lang: "en" | "he") => void;
  onSaveCell: (key: string, lang: "en" | "he", value: string) => void;
  onCancelEdit: () => void;
  onTabToNext: (key: string, lang: "en" | "he") => void;
  onDelete: () => void;
}) {
  const isEditingEn = editingCell?.key === pair.key && editingCell?.lang === "en";
  const isEditingHe = editingCell?.key === pair.key && editingCell?.lang === "he";
  const isSavingEn = savingCell?.key === pair.key && savingCell?.lang === "en";
  const isSavingHe = savingCell?.key === pair.key && savingCell?.lang === "he";

  return (
    <div className="grid grid-cols-[200px_1fr_1fr_56px] items-center px-3 py-2 hover:bg-muted/30 transition-colors group">
      {/* Key */}
      <div className="pr-3 self-start pt-0.5">
        <code className="text-xs font-mono text-muted-foreground break-all leading-relaxed">
          {pair.key}
        </code>
        {(!pair.en || !pair.he) && (
          <div className="flex gap-1 mt-1">
            {!pair.en && <MissingDot lang="EN" />}
            {!pair.he && <MissingDot lang="HE" />}
          </div>
        )}
      </div>

      {/* English — right-aligned to sit near the center divider */}
      <div
        className={`pr-3 min-h-[28px] rounded-sm transition-colors ${
          !isEditingEn ? "cursor-pointer hover:bg-muted/50 px-1.5 py-0.5 -my-0.5" : ""
        } ${isSavingEn ? "opacity-60" : ""}`}
        onClick={() => !isEditingEn && onClickCell(pair.key, "en")}
      >
        {isEditingEn ? (
          <InlineEditCell
            value={pair.en?.value ?? ""}
            dir="ltr"
            onSave={(v) => onSaveCell(pair.key, "en", v)}
            onCancel={onCancelEdit}
            onTab={() => onTabToNext(pair.key, "en")}
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words" dir="ltr">
            {pair.en ? (
              pair.en.value
            ) : (
              <span className="text-amber-500/80 italic">-- missing --</span>
            )}
          </p>
        )}
      </div>

      {/* Hebrew — left-aligned to sit near the center divider */}
      <div
        className={`pl-3 border-l border-border/60 min-h-[28px] rounded-sm transition-colors ${
          !isEditingHe ? "cursor-pointer hover:bg-muted/50 px-1.5 py-0.5 -my-0.5" : ""
        } ${isSavingHe ? "opacity-60" : ""}`}
        onClick={() => !isEditingHe && onClickCell(pair.key, "he")}
      >
        {isEditingHe ? (
          <InlineEditCell
            value={pair.he?.value ?? ""}
            dir="rtl"
            onSave={(v) => onSaveCell(pair.key, "he", v)}
            onCancel={onCancelEdit}
            onTab={() => onTabToNext(pair.key, "he")}
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words" dir="rtl">
            {pair.he ? (
              pair.he.value
            ) : (
              <span className="text-amber-500/80 italic" dir="ltr">-- missing --</span>
            )}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-0.5 justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onClickCell(pair.key, "en")}
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

// ─── Tablet grid row (md–lg) ────────────────────────────────

function TranslationTabletRow({
  pair,
  editingCell,
  savingCell,
  onClickCell,
  onSaveCell,
  onCancelEdit,
  onTabToNext,
  onDelete,
}: {
  pair: TranslationPair;
  editingCell: EditingCell | null;
  savingCell: EditingCell | null;
  onClickCell: (key: string, lang: "en" | "he") => void;
  onSaveCell: (key: string, lang: "en" | "he", value: string) => void;
  onCancelEdit: () => void;
  onTabToNext: (key: string, lang: "en" | "he") => void;
  onDelete: () => void;
}) {
  const isEditingEn = editingCell?.key === pair.key && editingCell?.lang === "en";
  const isEditingHe = editingCell?.key === pair.key && editingCell?.lang === "he";
  const isSavingEn = savingCell?.key === pair.key && savingCell?.lang === "en";
  const isSavingHe = savingCell?.key === pair.key && savingCell?.lang === "he";

  return (
    <div className="grid grid-cols-[minmax(120px,180px)_1fr_1fr] items-center px-3 py-2 hover:bg-muted/30 transition-colors gap-x-2">
      {/* Key + actions */}
      <div className="pr-2 self-start pt-0.5">
        <code className="text-xs font-mono text-muted-foreground break-all leading-relaxed">
          {pair.key}
        </code>
        <div className="flex gap-0.5 mt-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onClickCell(pair.key, "en")}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onDelete}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
          {(!pair.en || !pair.he) && (
            <>
              {!pair.en && <MissingDot lang="EN" />}
              {!pair.he && <MissingDot lang="HE" />}
            </>
          )}
        </div>
      </div>

      {/* English — right-aligned toward divider */}
      <div
        className={`min-h-[28px] rounded-sm transition-colors pr-2 ${
          !isEditingEn ? "cursor-pointer hover:bg-muted/50 px-1 py-0.5 -my-0.5" : ""
        } ${isSavingEn ? "opacity-60" : ""}`}
        onClick={() => !isEditingEn && onClickCell(pair.key, "en")}
      >
        {isEditingEn ? (
          <InlineEditCell
            value={pair.en?.value ?? ""}
            dir="ltr"
            onSave={(v) => onSaveCell(pair.key, "en", v)}
            onCancel={onCancelEdit}
            onTab={() => onTabToNext(pair.key, "en")}
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words" dir="ltr">
            {pair.en ? pair.en.value : <span className="text-amber-500/80 italic">-- missing --</span>}
          </p>
        )}
      </div>

      {/* Hebrew — left-aligned toward divider */}
      <div
        className={`pl-2 border-l border-border/60 min-h-[28px] rounded-sm transition-colors ${
          !isEditingHe ? "cursor-pointer hover:bg-muted/50 px-1 py-0.5 -my-0.5" : ""
        } ${isSavingHe ? "opacity-60" : ""}`}
        onClick={() => !isEditingHe && onClickCell(pair.key, "he")}
      >
        {isEditingHe ? (
          <InlineEditCell
            value={pair.he?.value ?? ""}
            dir="rtl"
            onSave={(v) => onSaveCell(pair.key, "he", v)}
            onCancel={onCancelEdit}
            onTab={() => onTabToNext(pair.key, "he")}
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words" dir="rtl">
            {pair.he ? pair.he.value : <span className="text-amber-500/80 italic" dir="ltr">-- missing --</span>}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Mobile card ────────────────────────────────────────────

function TranslationMobileCard({
  pair,
  isEditing,
  onStartEdit,
  onSave,
  onCancelEdit,
  onDelete,
}: {
  pair: TranslationPair;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (enValue: string, heValue: string) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  const [enText, setEnText] = useState(pair.en?.value ?? "");
  const [heText, setHeText] = useState(pair.he?.value ?? "");

  return (
    <div className={`border rounded-lg p-3 bg-card transition-shadow ${isEditing ? "ring-2 ring-primary/30 shadow-sm" : ""}`}>
      {/* Header: key + actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <code className="text-xs font-mono break-all text-muted-foreground pt-0.5">
          {pair.key}
        </code>
        <div className="flex gap-0.5 shrink-0">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onSave(enText, heText)}>
                <Check className="h-3.5 w-3.5 text-green-600" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onCancelEdit}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onStartEdit}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* English */}
      <div className="mb-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">EN</span>
          {!pair.en && !isEditing && <MissingDot lang="EN" />}
        </div>
        {isEditing ? (
          <Textarea
            value={enText}
            onChange={(e) => setEnText(e.target.value)}
            dir="ltr"
            rows={2}
            className="text-sm resize-none"
            placeholder="English text"
          />
        ) : (
          <p className="text-sm" dir="ltr">
            {pair.en ? pair.en.value : <span className="text-amber-500/80 italic">-- missing --</span>}
          </p>
        )}
      </div>

      <Separator className="my-2" />

      {/* Hebrew */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">HE</span>
          {!pair.he && !isEditing && <MissingDot lang="HE" />}
        </div>
        {isEditing ? (
          <Textarea
            value={heText}
            onChange={(e) => setHeText(e.target.value)}
            dir="rtl"
            rows={2}
            className="text-sm resize-none"
            placeholder="טקסט בעברית"
          />
        ) : (
          <p className="text-sm text-right" dir="rtl">
            {pair.he ? pair.he.value : <span className="text-amber-500/80 italic" dir="ltr">-- missing --</span>}
          </p>
        )}
      </div>

      {isEditing && (
        <Button size="sm" className="w-full mt-3" onClick={() => onSave(enText, heText)}>
          Save
        </Button>
      )}
    </div>
  );
}

// ─── Missing indicator ──────────────────────────────────────

function MissingDot({ lang }: { lang: "EN" | "HE" }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[9px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 py-px"
      title={`Missing ${lang} translation`}
    >
      <AlertTriangle className="h-2 w-2" />
      {lang}
    </span>
  );
}

// ─── Main component ─────────────────────────────────────────

export function TranslationsManager({
  pairs,
  total,
  search,
  namespace,
}: {
  pairs: TranslationPair[];
  total: number;
  search?: string;
  namespace?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchVal, setSearchVal] = useState(search ?? "");
  const [adding, setAdding] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [savingCell, setSavingCell] = useState<EditingCell | null>(null);
  const [mobileEditingKey, setMobileEditingKey] = useState<string | null>(null);
  const [deletingPair, setDeletingPair] = useState<TranslationPair | null>(null);
  const [showMissingOnly, setShowMissingOnly] = useState(false);

  const displayPairs = showMissingOnly
    ? pairs.filter((p) => !p.en || !p.he)
    : pairs;

  // ─── URL-based search ───────────────────────────────────
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal) params.set("search", searchVal);
    else params.delete("search");
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  function setNamespaceFilter(ns: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (ns && ns !== "all") params.set("namespace", ns);
    else params.delete("namespace");
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  // ─── Inline save (single cell) ──────────────────────────
  const handleInlineSave = useCallback(async (
    key: string,
    lang: "en" | "he",
    value: string,
  ) => {
    const pair = pairs.find((p) => p.key === key);
    if (!pair) return;

    const existing = lang === "en" ? pair.en : pair.he;

    // Skip save if value unchanged
    if (existing && existing.value === value) {
      setEditingCell(null);
      return;
    }

    // Skip save if value is empty and no existing record
    if (!value && !existing) {
      setEditingCell(null);
      return;
    }

    setSavingCell({ key, lang });
    setEditingCell(null);

    const formData = new FormData();
    if (existing?.id) formData.set("id", String(existing.id));
    formData.set("string_key", key);
    formData.set("language_code", lang);
    formData.set("value", value);

    const result = await saveTranslation(formData);

    if (result?.error) {
      toast.error(`Failed to save: ${result.error}`);
    } else {
      toast.success("Saved");
    }

    setSavingCell(null);
    router.refresh();
  }, [pairs, router]);

  // ─── Tab navigation between cells ───────────────────────
  const handleTabToNext = useCallback((key: string, lang: "en" | "he") => {
    if (lang === "en") {
      // Tab from EN → HE in same row
      setEditingCell({ key, lang: "he" });
    } else {
      // Tab from HE → EN of next row
      const idx = displayPairs.findIndex((p) => p.key === key);
      if (idx >= 0 && idx < displayPairs.length - 1) {
        setEditingCell({ key: displayPairs[idx + 1].key, lang: "en" });
      } else {
        setEditingCell(null);
      }
    }
  }, [displayPairs]);

  // ─── Mobile card save (both languages) ──────────────────
  async function handleMobileSave(pairKey: string, enValue: string, heValue: string) {
    const pair = pairs.find((p) => p.key === pairKey);
    if (!pair) return;

    setMobileEditingKey(null);

    // Save English if changed
    if (enValue !== (pair.en?.value ?? "") && (enValue || pair.en)) {
      const enForm = new FormData();
      if (pair.en?.id) enForm.set("id", String(pair.en.id));
      enForm.set("string_key", pairKey);
      enForm.set("language_code", "en");
      enForm.set("value", enValue);
      await saveTranslation(enForm);
    }

    // Save Hebrew if changed
    if (heValue !== (pair.he?.value ?? "") && (heValue || pair.he)) {
      const heForm = new FormData();
      if (pair.he?.id) heForm.set("id", String(pair.he.id));
      heForm.set("string_key", pairKey);
      heForm.set("language_code", "he");
      heForm.set("value", heValue);
      await saveTranslation(heForm);
    }

    toast.success("Saved");
    router.refresh();
  }

  // ─── Add new translation (dialog) ───────────────────────
  async function handleAddPair(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const key = (form.querySelector('[name="string_key"]') as HTMLInputElement).value;
    const enValue = (form.querySelector('[name="en_value"]') as HTMLTextAreaElement).value;
    const heValue = (form.querySelector('[name="he_value"]') as HTMLTextAreaElement).value;

    if (enValue) {
      const enForm = new FormData();
      enForm.set("string_key", key);
      enForm.set("language_code", "en");
      enForm.set("value", enValue);
      await saveTranslation(enForm);
    }

    if (heValue) {
      const heForm = new FormData();
      heForm.set("string_key", key);
      heForm.set("language_code", "he");
      heForm.set("value", heValue);
      await saveTranslation(heForm);
    }

    setAdding(false);
    toast.success("Translation added");
    router.refresh();
  }

  // ─── Delete ─────────────────────────────────────────────
  async function handleConfirmDelete() {
    if (!deletingPair) return;
    if (deletingPair.en) await deleteTranslation(deletingPair.en.id);
    if (deletingPair.he) await deleteTranslation(deletingPair.he.id);
    setDeletingPair(null);
    toast.success("Translation deleted");
    router.refresh();
  }

  const emptyMessage = search ? "No translations match your search." : "No translations found.";

  return (
    <>
      {/* ─── Toolbar ──────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search key or value..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-9"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={namespace ?? "all"} onValueChange={setNamespaceFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Namespace" />
              </SelectTrigger>
              <SelectContent>
                {NAMESPACES.map((ns) => (
                  <SelectItem key={ns.value} value={ns.value}>{ns.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                id="missing-only"
                checked={showMissingOnly}
                onCheckedChange={setShowMissingOnly}
              />
              <Label htmlFor="missing-only" className="text-sm text-muted-foreground cursor-pointer whitespace-nowrap">
                Missing only
              </Label>
            </div>

            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4 me-1" />
              <span className="hidden sm:inline">Add Translation</span>
              <span className="sm:hidden">Add</span>
            </Button>

            <span className="text-sm text-muted-foreground ml-auto">
              {displayPairs.length}{showMissingOnly ? "" : ` of ${total}`} keys
            </span>
          </div>
        </div>
      </div>

      {/* ─── Desktop grid (lg+) ───────────────────────────── */}
      <div className="hidden lg:block border rounded-lg overflow-hidden max-w-4xl">
        {/* Header */}
        <div className="grid grid-cols-[200px_1fr_1fr_56px] bg-muted/50 border-b px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">Key</span>
          <span className="text-sm font-medium text-muted-foreground">English</span>
          <span className="text-sm font-medium text-muted-foreground pl-3 border-l border-border/60">
            Hebrew
          </span>
          <span />
        </div>
        {/* Rows */}
        <div className="divide-y">
          {displayPairs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">{emptyMessage}</div>
          ) : (
            displayPairs.map((pair) => (
              <TranslationGridRow
                key={pair.key}
                pair={pair}
                editingCell={editingCell}
                savingCell={savingCell}
                onClickCell={(k, l) => setEditingCell({ key: k, lang: l })}
                onSaveCell={handleInlineSave}
                onCancelEdit={() => setEditingCell(null)}
                onTabToNext={handleTabToNext}
                onDelete={() => setDeletingPair(pair)}
              />
            ))
          )}
        </div>
      </div>

      {/* ─── Tablet grid (md–lg) ──────────────────────────── */}
      <div className="hidden md:block lg:hidden border rounded-lg overflow-hidden max-w-4xl">
        {/* Header */}
        <div className="grid grid-cols-[minmax(120px,180px)_1fr_1fr] bg-muted/50 border-b px-3 py-2 gap-x-2">
          <span className="text-sm font-medium text-muted-foreground">Key</span>
          <span className="text-sm font-medium text-muted-foreground">English</span>
          <span className="text-sm font-medium text-muted-foreground pl-2 border-l border-border/60">
            Hebrew
          </span>
        </div>
        {/* Rows */}
        <div className="divide-y">
          {displayPairs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">{emptyMessage}</div>
          ) : (
            displayPairs.map((pair) => (
              <TranslationTabletRow
                key={pair.key}
                pair={pair}
                editingCell={editingCell}
                savingCell={savingCell}
                onClickCell={(k, l) => setEditingCell({ key: k, lang: l })}
                onSaveCell={handleInlineSave}
                onCancelEdit={() => setEditingCell(null)}
                onTabToNext={handleTabToNext}
                onDelete={() => setDeletingPair(pair)}
              />
            ))
          )}
        </div>
      </div>

      {/* ─── Mobile card list (< md) ─────────────────────── */}
      <div className="md:hidden space-y-2">
        {displayPairs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border rounded-lg">
            {emptyMessage}
          </div>
        ) : (
          displayPairs.map((pair) => (
            <TranslationMobileCard
              key={`${pair.key}-${mobileEditingKey === pair.key ? "edit" : "view"}`}
              pair={pair}
              isEditing={mobileEditingKey === pair.key}
              onStartEdit={() => setMobileEditingKey(pair.key)}
              onSave={(en, he) => handleMobileSave(pair.key, en, he)}
              onCancelEdit={() => setMobileEditingKey(null)}
              onDelete={() => setDeletingPair(pair)}
            />
          ))
        )}
      </div>

      {/* ─── Delete confirmation ──────────────────────────── */}
      <AlertDialog open={!!deletingPair} onOpenChange={(open) => !open && setDeletingPair(null)}>
        <AlertDialogContent dir="ltr">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Translation</AlertDialogTitle>
            <AlertDialogDescription>
              Delete all translations for <code className="text-sm font-mono bg-muted px-1 py-0.5 rounded">{deletingPair?.key}</code>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Add dialog ───────────────────────────────────── */}
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Add Translation Pair</DialogTitle></DialogHeader>
          <form onSubmit={handleAddPair} className="space-y-4">
            <div>
              <Label>Key</Label>
              <Input name="string_key" required placeholder="e.g. nav.home" className="font-mono text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>English</Label>
                <Textarea name="en_value" rows={3} placeholder="English text" />
              </div>
              <div>
                <Label>Hebrew</Label>
                <Textarea name="he_value" rows={3} dir="rtl" placeholder="טקסט בעברית" />
              </div>
            </div>
            <Button type="submit" className="w-full">Add</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
