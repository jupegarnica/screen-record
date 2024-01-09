import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

const app = new Application();

app.use(async (ctx) => {
  try {
    await ctx.send({
      root: `${Deno.cwd()}/dist`,
      index: "index.html",
    });
  } catch {
    ctx.response.status = 404;
  }
});

const router = new Router();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });