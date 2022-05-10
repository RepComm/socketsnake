import { createServer } from "http";
import { createSpinner } from "nanospinner";


export type ArgValue = string | Array<string> | boolean | number| Array<number>;

export interface Args {
  [key: string]: ArgValue;
}

export interface KnownArgs extends Args {
  start: true;
  mode: "service" | "request";
  interface: "cli" | "web";
  webPort: number;
}

function args(argv: string[]): Args {
  let result: Args = {};

  for (let a of argv) {
    if (a.startsWith("-")) {
      let [cmd, pstr] = a.substring(1).split("=");

      let params: ArgValue;
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
  createServer((req, res)=>{

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

  }
}

main();
