const Koa = require("koa");
const Router = require("koa-router");
const websockify = require("koa-websocket");

const app = websockify(new Koa());
const router = new Router();

app.ws.use((ctx, next) => {
  return next(ctx);
});

router.get("/", async (ctx) => {
  ctx.body = "欢迎";
});

router.all("/websocket/:id", async (ctx) => {
  ctx.websocket.on("message", (msg) => {
    let message = "";
    if (msg.toString() === "client") {
      message = "server";
      ctx.websocket.send(message);
    } else {
      const res = JSON.parse(msg.toString());
      ctx.websocket.send(JSON.stringify({ event: res.event, data: "server" }));
    }

    console.log("前端发过来的数据：", msg.toString());
  });

  ctx.websocket.on("close", () => {
    console.log("前端关闭了websocket");
  });
});

app.ws.use(router.routes()).use(router.allowedMethods());

app.listen(3001, () => {
  console.log("koa is listening in 3001");
});
