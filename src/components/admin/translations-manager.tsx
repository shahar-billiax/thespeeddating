"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveTranslation, deleteTranslation } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface TranslationValue {
  id: number;
  value: string;
}

interface TranslationPair {
  key: string;
  en?: TranslationValue;
  he?: TranslationValue;
}

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

export function TranslationsManager({
  pairs,
  search,
  namespace,
}: {
  pairs: TranslationPair[];
  search?: string;
  namespace?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchVal, setSearchVal] = useState(search ?? "");
  const [editing, setEditing] = useState<TranslationPair | null>(null);
  const [adding, setAdding] = useState(false);

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

  async function handleSave(formData: FormData) {
    await saveTranslation(formData);
    setEditing(null);
    setAdding(false);
    router.refresh();
  }

  async function handleSavePair(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const key = (form.querySelector('[name="string_key"]') as HTMLInputElement).value;
    const enValue = (form.querySelector('[name="en_value"]') as HTMLTextAreaElement).value;
    const heValue = (form.querySelector('[name="he_value"]') as HTMLTextAreaElement).value;
    const enId = (form.querySelector('[name="en_id"]') as HTMLInputElement)?.value;
    const heId = (form.querySelector('[name="he_id"]') as HTMLInputElement)?.value;

    // Save English
    if (enValue) {
      const enForm = new FormData();
      if (enId) enForm.set("id", enId);
      enForm.set("string_key", key);
      enForm.set("language_code", "en");
      enForm.set("value", enValue);
      await saveTranslation(enForm);
    }

    // Save Hebrew
    if (heValue) {
      const heForm = new FormData();
      if (heId) heForm.set("id", heId);
      heForm.set("string_key", key);
      heForm.set("language_code", "he");
      heForm.set("value", heValue);
      await saveTranslation(heForm);
    }

    setEditing(null);
    setAdding(false);
    router.refresh();
  }

  async function handleDeletePair(pair: TranslationPair) {
    if (!confirm(`Delete all translations for "${pair.key}"?`)) return;
    if (pair.en) await deleteTranslation(pair.en.id);
    if (pair.he) await deleteTranslation(pair.he.id);
    router.refresh();
  }

  function getNamespace(key: string): string {
    const parts = key.split(".");
    return parts.length > 1 ? parts[0] : "";
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 items-end">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search key or value..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-[300px]"
          />
          <Button type="submit" variant="outline">Search</Button>
        </form>

        <Select value={namespace ?? "all"} onValueChange={setNamespaceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Namespace" />
          </SelectTrigger>
          <SelectContent>
            {NAMESPACES.map((ns) => (
              <SelectItem key={ns.value} value={ns.value}>{ns.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 me-2" />Add Translation</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Add Translation Pair</DialogTitle></DialogHeader>
            <form onSubmit={handleSavePair} className="space-y-4">
              <div>
                <Label>Key</Label>
                <Input name="string_key" required placeholder="e.g. nav.home" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>English</Label>
                  <Textarea name="en_value" rows={3} placeholder="English text" />
                </div>
                <div>
                  <Label>עברית (Hebrew)</Label>
                  <Textarea name="he_value" rows={3} dir="rtl" placeholder="טקסט בעברית" />
                </div>
              </div>
              <Button type="submit" className="w-full">Add</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-sm text-muted-foreground">
        {pairs.length} translation keys shown
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Key</TableHead>
              <TableHead>English</TableHead>
              <TableHead>עברית (Hebrew)</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pairs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No translations found
                </TableCell>
              </TableRow>
            ) : (
              pairs.map((pair) => (
                <TableRow key={pair.key}>
                  <TableCell>
                    <div className="space-y-1">
                      <code className="text-xs font-mono">{pair.key}</code>
                      <div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {getNamespace(pair.key)}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs" dir="ltr">
                      {pair.en ? (
                        <span>{pair.en.value}</span>
                      ) : (
                        <span className="text-muted-foreground italic">— missing —</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs" dir="rtl">
                      {pair.he ? (
                        <span>{pair.he.value}</span>
                      ) : (
                        <span className="text-muted-foreground italic" dir="ltr">— missing —</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog
                        open={editing?.key === pair.key}
                        onOpenChange={(open) => setEditing(open ? pair : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                          <DialogHeader>
                            <DialogTitle>
                              Edit: <code className="text-sm font-mono">{pair.key}</code>
                            </DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSavePair} className="space-y-4">
                            <input type="hidden" name="string_key" value={pair.key} />
                            {pair.en && <input type="hidden" name="en_id" value={pair.en.id} />}
                            {pair.he && <input type="hidden" name="he_id" value={pair.he.id} />}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>English</Label>
                                <Textarea
                                  name="en_value"
                                  defaultValue={pair.en?.value ?? ""}
                                  rows={4}
                                  dir="ltr"
                                />
                              </div>
                              <div>
                                <Label>עברית (Hebrew)</Label>
                                <Textarea
                                  name="he_value"
                                  defaultValue={pair.he?.value ?? ""}
                                  rows={4}
                                  dir="rtl"
                                />
                              </div>
                            </div>
                            <Button type="submit" className="w-full">Save</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePair(pair)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
