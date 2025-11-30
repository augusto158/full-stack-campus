import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { useUpdateComment } from "~/hooks/useComments";
import type { CommentWithUser } from "~/data-access/comments";
import { Loader2 } from "lucide-react";

const editCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment must be less than 5000 characters"),
});

type EditCommentFormData = z.infer<typeof editCommentSchema>;

interface EditCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comment: CommentWithUser | null;
}

export function EditCommentDialog({
  open,
  onOpenChange,
  comment,
}: EditCommentDialogProps) {
  const updateCommentMutation = useUpdateComment();

  const form = useForm<EditCommentFormData>({
    resolver: zodResolver(editCommentSchema),
    defaultValues: {
      content: comment?.content || "",
    },
  });

  // Reset form when comment changes or dialog opens
  useEffect(() => {
    if (comment && open) {
      form.reset({ content: comment.content });
    }
  }, [comment, open, form]);

  const onSubmit = (data: EditCommentFormData) => {
    if (comment) {
      updateCommentMutation.mutate(
        {
          id: comment.id,
          content: data.content,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
          <DialogDescription>
            Make changes to your comment below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Edit your comment..."
                      className="min-h-[100px] resize-none"
                      disabled={updateCommentMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateCommentMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateCommentMutation.isPending}>
                {updateCommentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
