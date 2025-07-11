import { createRoute, type OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import { handleIncoming } from "../../../transports/server/sse.ts";

export const messageHandler = (app: OpenAPIHono): OpenAPIHono =>
  app.openapi(
    createRoute({
      hide: true,
      method: "post",
      path: `/messages`,
      responses: {
        200: {
          content: {
            "text/event-stream": {
              schema: z.any(),
            },
          },
          description: "Returns the processed message",
        },
        400: {
          content: {
            "application/json": {
              schema: z.any(),
            },
          },
          description: "Returns an error",
        },
      },
    }),
    async (c) => {
      const response = await handleIncoming(c.req.raw);
      return response;
    },
    (result, c) => {
      if (!result.success) {
        return c.json(
          {
            code: 400,
            message: result.error.message,
          },
          400,
        );
      }
    },
  );
