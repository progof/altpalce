import { queryOptions, useMutation, useQueryClient } from "@tanstack/vue-query";
import { z } from "zod";

const errorSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
    }),
  ),
});

export type SpaceEvent = {
    event_id: string;
    space_id: string;
    owner: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    date: string;
    created_at: string;
    edit_at: string;
    username: string;
  };


  // Create a event for space 
    export const useCreateSpaceEventMutation = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (data: {
        space_id: string;
        title: string;
        description: string;
        start_time: string;
        end_time: string;
        date: string;
      }) => {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errors = errorSchema.parse(await res.json()).errors;
          throw new Error(errors.at(0)?.message);
        }
        return res.json() as Promise<{ data: SpaceEvent }>;
      },
      onSuccess: (res) => {
        queryClient.invalidateQueries({
          queryKey: ["events"],
          exact: true,
          type: "active",
        });
        queryClient.setQueryData(
          ["events", res.data.event_id],
          res.data,
        );
        return;
      },
    });
  };