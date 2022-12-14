import "dotenv/config";
import Hapi from "@hapi/hapi";
import Joi from "joi";
import log4js from "log4js";
import SwaggerPlugins from "../plugins/index.js";
import * as handlebars from "handlebars";
import Routes from "../routes/index.js";
import Path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

/**
 * @description Helper file for the server
 */
class ServerHelper {
	setGlobalAppRoot() {
		global.appRoot = Path.resolve(__dirname);
	}

	/**
	 *
	 * @param {Hapi.Server} server
	 */
	addSwaggerRoutes(server) {
		server.route(Routes);
	}

	/**
	 *
	 * @param {Hapi.Server} server
	 */
	attachLoggerOnEvents(server) {
		server.events.on("response", function (request) {
			appLogger.info(`${request.info.remoteAddress} : ${request.method.toUpperCase()} ${request.url.pathname} --> ${request.response.statusCode}`);
			appLogger.info("Request payload:", request.payload);
		});
	}

	/**
	 * @returns {Hapi.Server} A Hapi Server
	 */
	createServer() {
		let server = new Hapi.Server({
			app: {
				name: process.env.APP_NAME || "default",
			},
			port: process.env.HAPI_PORT || 8080,
			routes: { cors: true },
		});
		server.validator(Joi);
		return server;
	}

	/**
	 * @author Sanchit Dang
	 * @description Adds Views to the server
	 * @param {Hapi.Server} server
	 */
	addViews(server) {
		server.views({
			engines: {
				html: handlebars.default,
			},
			relativeTo: __dirname,
		});
	}

	/**
	 * @author Sanchit Dang
	 * @description sets default route for the server
	 * @param {Hapi.Server} server HAPI Server
	 * @param {String} defaultRoute Optional - default route
	 */
	setDefaultRoute(server, defaultRoute) {
		if (defaultRoute === undefined) defaultRoute = "/";
		server.route({
			method: "GET",
			path: defaultRoute,
			handler: (req, res) => {
				return res.view("welcome");
			},
		});
	}

	/**
	 *
	 * @param {Hapi.Server} server HAPI Server
	 */
	async registerPlugins(server) {
		await server.register(SwaggerPlugins, {}, (err) => {
			if (err) server.log(["error"], "Error while loading plugins : " + err);
			else server.log(["info"], "Plugins Loaded");
		});
	}

	configureLog4js = () => {
		// Configuration for log4js.
		log4js.configure({
			appenders: {
				App: { type: "console" },
			},
			categories: {
				default: { appenders: ["App"], level: "trace" },
			},
		});
		// Global Logger variables for logging
		global.appLogger = log4js.getLogger("App");
	};

	/**
	 *
	 * @param {Hapi.Server} server
	 */
	async startServer(server) {
		try {
			await server.start();
			appLogger.info("Server running on %s", server.info.uri);
		} catch (error) {
			appLogger.fatal(error);
		}
	}
}

const instance = new ServerHelper();
export default instance;
