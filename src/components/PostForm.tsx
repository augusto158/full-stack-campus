import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MessageSquarePlus, Save } from "lucide-react";
import { POST_CATEGORIES } from "~/fn/posts";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const postFormSchema = z.object({
  title: z
    .string()
    .max(200, "Title must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .min(1, "Content is required")
    .max(10000, "Content must be less than 10000 characters"),
  category: z.enum(POST_CATEGORIES),
});

export type PostFormData = z.infer<typeof postFormSchema>;

export const CATEGORY_LABELS: Record<(typeof POST_CATEGORIES)[number], string> =
  {
    general: "General",
    question: "Question",
    discussion: "Discussion",
    announcement: "Announcement",
    feedback: "Feedback",
    showcase: "Showcase",
  };

export const CATEGORY_DESCRIPTIONS: Record<
  (typeof POST_CATEGORIES)[number],
  string
> = {
  general: "General topics and conversations",
  question: "Ask the community for help",
  discussion: "Start a discussion on a topic",
  announcement: "Share important updates",
  feedback: "Share feedback or suggestions",
  showcase: "Show off your work",
};

interface PostFormProps {
  defaultValues?: Partial<PostFormData>;
  onSubmit: (data: PostFormData) => void | Promise<void>;
  isPending?: boolean;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  onCancel?: () => void;
  cancelLabel?: string;
}

export function PostForm({
  defaultValues,
  onSubmit,
  isPending = false,
  submitLabel = "Publish Post",
  submitIcon = <MessageSquarePlus className="h-4 w-4 mr-2" />,
  onCancel,
  cancelLabel = "Cancel",
}: PostFormProps) {
  const form = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      ...defaultValues,
    },
  });

  const handleSubmit = async (data: PostFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {POST_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex flex-col">
                        <span>{CATEGORY_LABELS[category]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {CATEGORY_DESCRIPTIONS[field.value]}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Give your post a title (optional)"
                  className="h-11 text-base"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/200 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Content *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What's on your mind?"
                  className="min-h-[200px] text-base resize-none"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/10000 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4 pt-4 border-t border-border">
          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isPending}
                onClick={onCancel}
              >
                {cancelLabel}
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {submitIcon}
                  {submitLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

