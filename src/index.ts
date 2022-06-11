import { createServer as createHttpServer } from "http";
import { createSpinner } from "nanospinner";
import { Bridge } from "./bridge.js";
import { StdioTunTap } from "./stdiotuntap.js";

export type ArgValue = string | Array<string> | boolean | number| Array<number>;

export interface Args {
  [key: string]: ArgValue;
}

export interface KnownArgs extends Args {
  start: true;
  mode: "service" | "request";
  interface: "cli" | "web";
  webPort: number;
  bridgePort: 10209;
}

function args(argv: string[]): Args {
  let result: Args = {};

  for (let a of argv) {
    if (a.startsWith("-")) {
      let [cmd, pstr] = a.substring(1).split("=");

      //@ts-ignore
      let params: ArgValue = undefined;
      (params as any) = true;

      if (pstr !== undefined) {
        params = pstr.split(",");
        if (params.length === 1) params = params[0];
      }
      let num: number = 0;

      if (params instanceof Array) {
        for (let i=0; i<params.length; i++) {
          let value = params[i];

          if (typeof(value) === "string") {
            try {
              num = Number.parseFloat(value);
            } catch (ex) {
              continue;
            }
            if (!isNaN(num)) params[i] = num;
          }
        }
      } else if (typeof(params) === "string") {
        try {
          num = Number.parseFloat(params);
        } catch (ex) {
          continue;
        }
        if (!isNaN(num)) params = num;
      }

      result[cmd] = params;
    }
  }

  return result;
}

function info(...args: string[]) {
  console.log("[info]", ...args);
}

async function main() {
  console.log(
    "S O C K E T\n" +
    "   🔌 🐍\n" +
    " S N A K E"
  );

  let opts = args(process.argv) as KnownArgs;

  console.log("\n\n\nUsing provided options:\n\n", opts, "\n\n\n");

  switch (opts.interface) {
    case "web":
      initWeb(opts);
      break;
    default:
      init(opts);
      break;
  }
}

function initWeb(opts: KnownArgs) {
  if (!opts.webPort) {
    opts.webPort = 10208;
    info(`webPort was falsy, reset to default of ${opts.webPort}`);
  }
  createHttpServer((req, res)=>{

    res.end("Hello World");
  }).listen(opts.webPort);
  info(`web interface started at http://localhost:${opts.webPort}`);
}

function init(opts: Args) {
  if (opts.start) {
    if (!opts.mode) {
      opts.mode = "request";
      info(`mode arg was falsy, reset to default mode of "${opts.mode}"`);
    }
    let spinner = createSpinner(`starting in ${opts.mode} mode`,).start();

    setTimeout(() => {
      spinner.stop();
    }, 500);

    if (opts.mode == "request") {

      let tuntap = new StdioTunTap();
      tuntap.listen((msg)=>{
        if (bridge) bridge.send(msg);
      });

      if (!opts.bridgePort) {
        opts.bridgePort = 10209;
        info(`bridgePort arg was falsey, reset to default of 10209`);
      }

      let bridge = new Bridge(opts.bridgePort as number);
      bridge.listen((msg)=>{
        tuntap.send(msg);
      });
    }

  }
}

main();
