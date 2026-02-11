"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteSuccessStory } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { useRouter } from "next/navigation";

export function TestimoniesPanel({
  stories,
  pageId,
}: {
  stories: any[];
  pageId: number;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setDeleting(id);
    const result = await deleteSuccessStory(id);
    if (result?.error) {
      console.error("Failed to delete testimony:", result.error);
    }
    setDeleting(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Testimonies</CardTitle>
          <Button asChild size="sm">
            <Link href={`/admin/pages/${pageId}/stories/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimony
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage testimonies displayed on this page.
        </p>
      </CardHeader>
      <CardContent>
        {stories.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No testimonies yet. Add your first one!
          </p>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Couple / Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.map((story: any) => (
                  <TableRow key={story.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {story.sort_order}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {story.couple_names}
                        </span>
                        {story.is_featured && (
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {story.quote.substring(0, 80)}
                        {story.quote.length > 80 ? "..." : ""}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          story.story_type === "wedding"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {story.story_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {story.location || "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {story.year || "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={story.is_active ? "default" : "secondary"}
                      >
                        {story.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            href={`/admin/pages/${pageId}/stories/${story.id}/edit`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deleting === story.id}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this testimony.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(story.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
