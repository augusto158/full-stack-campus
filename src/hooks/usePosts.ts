import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  recentPostsQueryOptions,
  postQueryOptions,
  userPostsQueryOptions,
} from "~/queries/posts";
import { createPostFn, updatePostFn, deletePostFn } from "~/fn/posts";
import { getErrorMessage } from "~/utils/error";

// Query hooks
export function useRecentPosts(enabled = true) {
  return useQuery({
    ...recentPostsQueryOptions(),
    enabled,
  });
}

export function usePost(postId: string, enabled = true) {
  return useQuery({
    ...postQueryOptions(postId),
    enabled: enabled && !!postId,
  });
}

export function useUserPosts(enabled = true) {
  return useQuery({
    ...userPostsQueryOptions(),
    enabled,
  });
}

// Mutation hooks
export function useCreatePost() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: Parameters<typeof createPostFn>[0]["data"]) =>
      createPostFn({ data }),
    onSuccess: () => {
      toast.success("Post created successfully!", {
        description: "Your post has been published to the community.",
      });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      navigate({ to: "/community" });
    },
    onError: (error) => {
      toast.error("Failed to create post", {
        description: getErrorMessage(error),
      });
    },
  });
}

// Hook for updating posts
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updatePostFn>[0]["data"]) =>
      updatePostFn({ data }),
    onSuccess: (updatedPost) => {
      toast.success("Post updated successfully", {
        description: "Your changes have been saved.",
      });
      // Invalidate all post-related queries
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({
        queryKey: ["community-post", updatedPost.id],
      });
    },
    onError: (error) => {
      toast.error("Failed to update post", {
        description: getErrorMessage(error),
      });
    },
  });
}

// Hook for deleting posts
export function useDeletePost() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: string) => deletePostFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Post deleted successfully", {
        description: "Your post has been removed from the community.",
      });
      // Invalidate all post-related queries
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["community-post"] });
      // Navigate back to community page if on post detail page
      navigate({ to: "/community" });
    },
    onError: (error) => {
      toast.error("Failed to delete post", {
        description: getErrorMessage(error),
      });
    },
  });
}

// Combined hook for post management
export function usePostManagement() {
  const queryClient = useQueryClient();

  const invalidatePostsData = (postId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["community-posts"] });

    if (postId) {
      queryClient.invalidateQueries({ queryKey: ["community-post", postId] });
    }
  };

  const refreshPosts = () => {
    queryClient.invalidateQueries({ queryKey: ["community-posts"] });
  };

  const refreshPost = (postId: string) => {
    queryClient.invalidateQueries({ queryKey: ["community-post", postId] });
  };

  return {
    posts: useRecentPosts(),
    invalidatePostsData,
    refreshPosts,
    refreshPost,
  };
}