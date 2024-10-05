import { z } from "zod";

export const esbGetChangesQueryZod = z.object({
  from_revision: z.coerce.number(),
});


