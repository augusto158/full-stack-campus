import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Home,
  Users,
  Clock,
  Trash2,
  Edit,
} from "lucide-react";
import { Page } from "~/components/Page";
import { AppBreadcrumb } from "~/components/AppBreadcrumb";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { postQueryOptions } from "~/queries/posts";
import { formatRelativeTime } from "~/utils/song";
import { authClient } from "~/lib/auth-client";
import { DeletePostDialog } from "~/components/DeletePostDialog";
import { UserAvatar } from "~/components/UserAvatar";
import { CommentList } from "~/components/CommentList";

export const Route = createFileRoute("/community/post/$postId/")({
  loader: async ({ context: { queryClient }, params: { postId } }) => {
    // Use prefetchQuery instead of ensureQueryData to avoid throwing on errors
    // The component will handle the error state
    await queryClient.prefetchQuery(postQueryOptions(postId));
  },
  component: PostDetail,
});


function getCategoryVariant(
  category: string | null
): "default" | "secondary" | "outline" {
  switch (category) {
    case "announcement":
      return "default";
    case "question":
      return "secondary";
    default:
      return "outline";
  }
}

function PostDetail() {
  const { postId } = Route.useParams();
  const navigate = useNavigate();
  const { data: post, isLoading, error } = useQuery(postQueryOptions(postId));
  const { data: session } = authClient.useSession();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isOwner = session?.user?.id === post?.userId;

  const handleEditClick = () => {
    navigate({ to: `/community/post/$postId/edit`, params: { postId } });
  };

  const breadcrumbItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Community", href: "/community", icon: Users },
    { label: post?.title || "Post" },
  ];

  if (isLoading) {
    return (
      <Page>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </Page>
    );
  }

  if (error || !post) {
    return (
      <Page>
        <div className="text-center space-y-4 py-12">
          <h1 className="text-2xl font-bold text-destructive">
            Post Not Found
          </h1>
          <p className="text-muted-foreground">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/community"
            className="text-primary hover:underline inline-flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Back to Community
          </Link>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="space-y-8 max-w-4xl mx-auto">
        <AppBreadcrumb items={breadcrumbItems} />

        {/* Main Post */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                {/* Category Badge */}
                {post.category && (
                  <div>
                    <Badge variant={getCategoryVariant(post.category)}>
                      {post.category}
                    </Badge>
                  </div>
                )}

                {/* Title */}
                {post.title && (
                  <h1 className="text-3xl font-bold">{post.title}</h1>
                )}

                {/* Author and Timestamp */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      imageKey={post.user.image}
                      name={post.user.name}
                      size="md"
                    />
                    <div>
                      <p className="font-medium">
                        {post.user.name || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatRelativeTime(
                            new Date(post.createdAt).toISOString()
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isOwner && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-accent"
                    onClick={handleEditClick}
                    title="Edit post"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteDialogOpen(true)}
                    title="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Post Content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {post.content}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <CommentList postId={postId} />

        {/* Delete Post Dialog */}
        {post && (
          <DeletePostDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            post={post}
          />
        )}
      </div>
    </Page>
  );
}
