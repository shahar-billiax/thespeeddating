"use client";

import { useState } from "react";
import type { FaqContent } from "@/lib/admin/content-schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

const DEFAULT_FAQ: FaqContent = {
  categories: [],
};

export function FaqEditor({
  value,
  onChange,
}: {
  value: FaqContent | null;
  onChange: (data: FaqContent) => void;
}) {
  const [data, setData] = useState<FaqContent>(value ?? DEFAULT_FAQ);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(data.categories.map((_, i) => i))
  );

  function update(next: FaqContent) {
    setData(next);
    onChange(next);
  }

  function toggleCategory(index: number) {
    const next = new Set(expandedCategories);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setExpandedCategories(next);
  }

  function addCategory() {
    const next = {
      categories: [
        ...data.categories,
        { title: "New Category", questions: [] },
      ],
    };
    update(next);
    setExpandedCategories(new Set([...expandedCategories, data.categories.length]));
  }

  function removeCategory(index: number) {
    update({
      categories: data.categories.filter((_, i) => i !== index),
    });
  }

  function updateCategoryTitle(index: number, title: string) {
    const categories = [...data.categories];
    categories[index] = { ...categories[index], title };
    update({ categories });
  }

  function addQuestion(catIndex: number) {
    const categories = [...data.categories];
    categories[catIndex] = {
      ...categories[catIndex],
      questions: [
        ...categories[catIndex].questions,
        { question: "", answer: "" },
      ],
    };
    update({ categories });
  }

  function removeQuestion(catIndex: number, qIndex: number) {
    const categories = [...data.categories];
    categories[catIndex] = {
      ...categories[catIndex],
      questions: categories[catIndex].questions.filter((_, i) => i !== qIndex),
    };
    update({ categories });
  }

  function updateQuestion(
    catIndex: number,
    qIndex: number,
    field: "question" | "answer",
    val: string
  ) {
    const categories = [...data.categories];
    const questions = [...categories[catIndex].questions];
    questions[qIndex] = { ...questions[qIndex], [field]: val };
    categories[catIndex] = { ...categories[catIndex], questions };
    update({ categories });
  }

  const totalQuestions = data.categories.reduce(
    (sum, c) => sum + c.questions.length,
    0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>FAQ Content</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data.categories.length} categories, {totalQuestions} questions
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addCategory}>
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.categories.map((category, catIndex) => {
          const isExpanded = expandedCategories.has(catIndex);
          return (
            <div key={catIndex} className="border rounded-lg">
              <div
                className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleCategory(catIndex)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <Input
                  value={category.title}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateCategoryTitle(catIndex, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold"
                  placeholder="Category name"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {category.questions.length} Q&A
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCategory(catIndex);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {isExpanded && (
                <div className="p-3 pt-0 space-y-3">
                  {category.questions.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="p-3 border rounded-lg bg-muted/20 space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Question</Label>
                          <Input
                            value={q.question}
                            onChange={(e) =>
                              updateQuestion(catIndex, qIndex, "question", e.target.value)
                            }
                            placeholder="Enter question"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive mt-5"
                          onClick={() => removeQuestion(catIndex, qIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs">Answer</Label>
                        <Textarea
                          value={q.answer}
                          onChange={(e) =>
                            updateQuestion(catIndex, qIndex, "answer", e.target.value)
                          }
                          rows={3}
                          placeholder="Enter answer"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => addQuestion(catIndex)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {data.categories.length === 0 && (
          <p className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
            No FAQ categories. Click &quot;Add Category&quot; to create one.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
