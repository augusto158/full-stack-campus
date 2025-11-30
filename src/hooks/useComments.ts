import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postCommentsQueryOptions,
  commentRepliesQueryOptions,
  postCommentCountQueryOptions,
} from "~/queries/comments";
import {
  createCommentFn,
  updateCommentFn,
  deleteCommentFn,
} from "~/fn/comments";
import { getErrorMessage } from "~/utils/error";

// Query hooks
export function usePostComments(postId: string, enabled = true) {
  return useQuery({
    ...postCommentsQueryOptions(postId),
    enabled: enabled && !!postId,
  });
}

export function useCommentReplies(commentId: string, enabled = true) {
  return useQuery({
    ...commentRepliesQueryOptions(commentId),
    enabled: enabled && !!commentId,
  });
}

export function usePostCommentCount(postId: string, enabled = true) {
  return useQuery({
    ...postCommentCountQueryOptions(postId),
    enabled: enabled && !!postId,
  });
}

// Mutation hooks
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof createCommentFn>[0]["data"]) =>
      createCommentFn({ data }),
    onSuccess: (_, variables) => {
      toast.success("Comment posted successfully");
      // Invalidate comments list
      queryClient.invalidateQueries({
        queryKey: ["post-comments", variables.postId],
      });
      // Invalidate comment count
      queryClient.invalidateQueries({
        queryKey: ["post-comment-count", variables.postId],
      });
      // If it's a reply, also invalidate the parent's replies
      if (variables.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: ["comment-replies", variables.parentCommentId],
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to post comment", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateCommentFn>[0]["data"]) =>
      updateCommentFn({ data }),
    onSuccess: () => {
      toast.success("Comment updated successfully");
      // Invalidate all comment queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["post-comments"] });
      queryClient.invalidateQueries({ queryKey: ["comment-replies"] });
    },
    onError: (error) => {
      toast.error("Failed to update comment", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCommentFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      // Invalidate all comment queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["post-comments"] });
      queryClient.invalidateQueries({ queryKey: ["comment-replies"] });
      queryClient.invalidateQueries({ queryKey: ["post-comment-count"] });
    },
    onError: (error) => {
      toast.error("Failed to delete comment", {
        description: getErrorMessage(error),
      });
    },
  });
}
