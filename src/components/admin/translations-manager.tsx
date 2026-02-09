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
import { Plus, Pencil, Trash2 } from "lucide-react";

export function TranslationsManager({
  translations,
  search,
  language,
}: {
  translations: any[];
  search?: string;
  language?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchVal, setSearchVal] = useState(search ?? "");
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal) params.set("search", searchVal);
    else params.delete("search");
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  function setLangFilter(lang: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (lang && lang !== "all") params.set("language", lang);
    else params.delete("language");
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  async function handleSave(formData: FormData) {
    await saveTranslation(formData);
    setEditing(null);
    setAdding(false);
    router.refresh();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this translation?")) return;
    await deleteTranslation(id);
    router.refresh();
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

        <Select value={language ?? "all"} onValueChange={setLangFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="he">Hebrew</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Translation</DialogTitle></DialogHeader>
            <form action={handleSave} className="space-y-4">
              <div>
                <Label>Key</Label>
                <Input name="string_key" required placeholder="e.g. nav.home" />
              </div>
              <div>
                <Label>Language</Label>
                <Select name="language_code" defaultValue="en">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="he">Hebrew</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value</Label>
                <Textarea name="value" required rows={3} />
              </div>
              <Button type="submit" className="w-full">Add</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {translations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No translations found
                </TableCell>
              </TableRow>
            ) : (
              translations.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-sm">{t.string_key}</TableCell>
                  <TableCell>{t.language_code.toUpperCase()}</TableCell>
                  <TableCell className="max-w-md truncate">{t.value}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog
                        open={editing?.id === t.id}
                        onOpenChange={(open) => setEditing(open ? t : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Edit Translation</DialogTitle></DialogHeader>
                          <form action={handleSave} className="space-y-4">
                            <input type="hidden" name="id" value={t.id} />
                            <div>
                              <Label>Key</Label>
                              <Input name="string_key" defaultValue={t.string_key} required />
                            </div>
                            <div>
                              <Label>Language</Label>
                              <Select name="language_code" defaultValue={t.language_code}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="he">Hebrew</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Value</Label>
                              <Textarea name="value" defaultValue={t.value} required rows={3} />
                            </div>
                            <Button type="submit" className="w-full">Save</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}>
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
