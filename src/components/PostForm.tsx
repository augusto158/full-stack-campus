import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2, MessageSquarePlus, Save, ImagePlus, X } from "lucide-react";
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
import { MediaDropzone } from "~/components/MediaDropzone";
import type { MediaUploadResult } from "~/utils/storage/media-helpers";

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

export interface PostFormDataWithAttachments extends PostFormData {
  attachments: MediaUploadResult[];
}

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
  onSubmit: (data: PostFormDataWithAttachments) => void | Promise<void>;
  isPending?: boolean;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  onCancel?: () => void;
  cancelLabel?: string;
  showMediaUpload?: boolean;
}

export function PostForm({
  defaultValues,
  onSubmit,
  isPending = false,
  submitLabel = "Publish Post",
  submitIcon = <MessageSquarePlus className="h-4 w-4 mr-2" />,
  onCancel,
  cancelLabel = "Cancel",
  showMediaUpload = true,
}: PostFormProps) {
  const [uploadedMedia, setUploadedMedia] = useState<MediaUploadResult[]>([]);
  const [showDropzone, setShowDropzone] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      ...defaultValues,
    },
  });

  const handleUploadsComplete = (results: MediaUploadResult[]) => {
    setUploadedMedia((prev) => [...prev, ...results]);
  };

  const removeUploadedMedia = (id: string) => {
    setUploadedMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async (data: PostFormData) => {
    await onSubmit({
      ...data,
      attachments: uploadedMedia,
    });
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

        {/* Media Upload Section */}
        {showMediaUpload && (
          <div className="space-y-3">
            {/* Uploaded Media Preview */}
            {uploadedMedia.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Attached Media ({uploadedMedia.length})</p>
                <div className="flex flex-wrap gap-2">
                  {uploadedMedia.map((media) => (
                    <div
                      key={media.id}
                      className="relative group w-20 h-20 rounded-lg overflow-hidden bg-muted"
                    >
                      {media.type === "video" ? (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <span className="text-xs text-muted-foreground">Video</span>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Image</span>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeUploadedMedia(media.id)}
                        disabled={isPending}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toggle dropzone button or dropzone */}
            {!showDropzone ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowDropzone(true)}
                disabled={isPending}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Add Images or Videos
              </Button>
            ) : (
              <div className="space-y-2">
                <MediaDropzone
                  onUploadsComplete={handleUploadsComplete}
                  maxFiles={10 - uploadedMedia.length}
                  disabled={isPending}
                />
                {uploadedMedia.length === 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDropzone(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

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

