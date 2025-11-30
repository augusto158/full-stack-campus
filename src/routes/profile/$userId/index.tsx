import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Home, Users, ArrowLeft } from "lucide-react";
import { Page } from "~/components/Page";
import { PageTitle } from "~/components/PageTitle";
import { AppBreadcrumb } from "~/components/AppBreadcrumb";
import { UserAvatar } from "~/components/UserAvatar";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { userQueryOptions } from "~/queries/users";

export const Route = createFileRoute("/profile/$userId/")({
  loader: async ({ context: { queryClient }, params: { userId } }) => {
    await queryClient.prefetchQuery(userQueryOptions(userId));
  },
  component: Profile,
});

function Profile() {
  const { userId } = Route.useParams();
  const { data: user, isLoading, error } = useQuery(userQueryOptions(userId));

  if (isLoading) {
    return (
      <Page>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </Page>
    );
  }

  if (error || !user) {
    return (
      <Page>
        <div className="text-center space-y-4 py-12">
          <h1 className="text-2xl font-bold text-destructive">
            User Not Found
          </h1>
          <p className="text-muted-foreground">
            The user you're looking for doesn't exist.
          </p>
          <Button asChild variant="outline">
            <Link to="/members" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Members
            </Link>
          </Button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="space-y-8 max-w-4xl mx-auto">
        <AppBreadcrumb
          items={[
            { label: "Home", href: "/", icon: Home },
            { label: "Members", href: "/members", icon: Users },
            { label: user.name || "Profile" },
          ]}
        />

        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <UserAvatar
                imageKey={user.image}
                name={user.name}
                size="lg"
                className="shrink-0"
              />
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                  {user.name || "Anonymous"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link to="/members" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Members
            </Link>
          </Button>
        </div>
      </div>
    </Page>
  );
}
