import { Router, Request, Response, NextFunction } from "express";

type Wrapper = ((router: Router) => void);

export const applyMiddleware = (middleware: Wrapper[], router: Router) => {
  for (const f of middleware) {
    f(router);
  }
};

interface Route {
  path: string;
  method: string;
  handler: Function | Function[];
}

export const applyRoutes = (routes: Route[], router: Router) => {
  for (const route of routes) {
    const { method, path, handler } = route;
    (router as any)[method](path, handler);
  }
};