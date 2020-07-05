import Router from "@koa/router";
import Koa from "koa";
import config from "./config";
import BaseError from "./errors/BaseError";
import Hub from "./Hub";
import SBLPRouter from "./routers/SBLPRouter";

export default class Server {
  private app: Koa;
  private router: Router;

  private sblpRouter?: SBLPRouter;

  constructor(private instance: Hub) {
    this.app = new Koa();
    this.router = new Router();

    this.registerRoutes();

    this.app.use(async (ctx: Koa.Context, next: Koa.Next) => {
      try {
        return await next();
      } catch (error) {
        const baseError = BaseError.from(error);
        ctx.body = baseError.dispatch();
        ctx.status = baseError.status;
        console.warn(baseError);
      }
    });

    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
  }

  private registerRoutes() {
    this.sblpRouter = new SBLPRouter();

    this.router.use("/sblp", this.sblpRouter.router.routes());
  }

  public async init() {
    const port = config.settings.httpPort;
    this.app.listen(port);
    console.log(`HTTPs listening on *:${port}`);
  }
}