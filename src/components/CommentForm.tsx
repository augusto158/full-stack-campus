import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { useCreateComment } from "~/hooks/useComments";
import { Loader2, Send, ImagePlus, X } from "lucide-react";
import { MediaDropzone } from "~/components/MediaDropzone";
import type { MediaUploadResult } from "~/utils/storage/media-helpers";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment must be less than 5000 characters"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  showMediaUpload?: boolean;
}

export function CommentForm({
  postId,
  parentCommentId,
  onSuccess,
  placeholder = "Write a comment...",
  autoFocus = false,
  showMediaUpload = true,
}: CommentFormProps) {
  const createCommentMutation = useCreateComment();
  const [uploadedMedia, setUploadedMedia] = useState<MediaUploadResult[]>([]);
  const [showDropzone, setShowDropzone] = useState(false);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleUploadsComplete = (results: MediaUploadResult[]) => {
    setUploadedMedia((prev) => [...prev, ...results]);
  };

  const removeUploadedMedia = (id: string) => {
    setUploadedMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const onSubmit = (data: CommentFormData) => {
    createCommentMutation.mutate(
      {
        postId,
        content: data.content,
        parentCommentId,
        attachments: uploadedMedia,
      },
      {
        onSuccess: () => {
          form.reset();
          setUploadedMedia([]);
          setShowDropzone(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={placeholder}
                  className="min-h-[80px] resize-none"
                  disabled={createCommentMutation.isPending}
                  autoFocus={autoFocus}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Media Upload Section */}
        {showMediaUpload && (
          <div className="space-y-2">
            {/* Uploaded Media Preview */}
            {uploadedMedia.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {uploadedMedia.map((media) => (
                  <div
                    key={media.id}
                    className="relative group w-16 h-16 rounded overflow-hidden bg-muted"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        {media.type === "video" ? "Video" : "Image"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0.5 right-0.5 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeUploadedMedia(media.id)}
                      disabled={createCommentMutation.isPending}
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Toggle dropzone */}
            {!showDropzone ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setShowDropzone(true)}
                disabled={createCommentMutation.isPending}
              >
                <ImagePlus className="h-4 w-4 mr-1" />
                Add media
              </Button>
            ) : (
              <div className="space-y-2">
                <MediaDropzone
                  onUploadsComplete={handleUploadsComplete}
                  maxFiles={5 - uploadedMedia.length}
                  disabled={createCommentMutation.isPending}
                  compact={false}
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

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={createCommentMutation.isPending}
            size="sm"
          >
            {createCommentMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
