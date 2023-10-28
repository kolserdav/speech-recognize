// @ts-check
const fastify = require("fastify")({ logger: true });
const path = require("path");
const static = require("@fastify/static");

fastify.register(static, {
  root: path.join(__dirname, "public"),
  prefix: "/",
  constraints: {},
});

const portN = parseInt(process.env.PORT || "3000", 10);

const port = Number.isNaN(portN) ? 3000 : portN;
fastify.listen({ port }, () => {
  console.log("Listen at port", port);
});
