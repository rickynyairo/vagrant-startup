import { Router } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import swaggerJson from "../config/swagger.json";
import path from "path";

// -- routes for docs and generated swagger spec --
export const handleAPIDocs = (router: Router) =>
  router.use("/api-docs", swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerJson));
