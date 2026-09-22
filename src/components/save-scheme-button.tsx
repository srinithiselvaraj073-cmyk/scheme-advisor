import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getSavedSchemeIds, toggleSavedScheme } from "@/lib/user.functions";

export function SaveSchemeButton({
  schemeId,
  withLabel = false,
}: {
  schemeId: string;
  withLabel?: boolean;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fetchIds = useServerFn(getSavedSchemeIds);
  const toggle = useServerFn(toggleSavedScheme);

  const { data: ids } = useQuery({
    queryKey: ["saved-scheme-ids"],
    queryFn: () => fetchIds(),
    enabled: Boolean(user),
  });

  const saved = (ids ?? []).includes(schemeId);

  const mutation = useMutation({
    mutationFn: () => toggle({ data: { schemeId } }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["saved-scheme-ids"] });
      queryClient.invalidateQueries({ queryKey: ["saved-schemes"] });
      queryClient.invalidateQueries({ queryKey: ["my-account"] });
      toast.success(result.saved ? "Saved to your list" : "Removed from your list");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!user) return null;

  return (
    <Button
      variant={withLabel ? "secondary" : "ghost"}
      size={withLabel ? "sm" : "icon"}
      disabled={mutation.isPending}
      onClick={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
      aria-label={saved ? "Remove from saved schemes" : "Save scheme"}
    >
      {saved ? <BookmarkCheck className="size-4 text-accent" /> : <Bookmark className="size-4" />}
      {withLabel ? (saved ? "Saved" : "Save scheme") : null}
    </Button>
  );
}
