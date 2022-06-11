
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import type { JsonDataMsg, JsonLogMsg, JsonMsg } from "./protocol";

export interface StdioTunTapListener {
  (msg: JsonMsg): void;
}

export class StdioTunTap {
  process: ChildProcessWithoutNullStreams;
  
  listeners: Set<StdioTunTapListener>;

  listen (listener: StdioTunTapListener): this {
    this.listeners.add(listener);
    return this;
  }
  deafen (listener: StdioTunTapListener): this {
    this.listeners.delete(listener);
    return this;
  }
  fire (msg: JsonMsg): this {
    for (let cb of this.listeners) {
      cb(msg);
    }
    return this;
  }
  send (msg: JsonMsg): this {
    this.process.stdin.write(JSON.stringify(msg));
    return this;
  }
  constructor () {
    this.listeners = new Set();
    this.process = spawn("./stdiotuntap");

    this.process.on("spawn", () => {

      this.process.stdout.on('data', (data) => {
        let json = JSON.parse(data) as JsonMsg;
    
        switch(json.cmd) {
          case "log":
            let logJson = json as JsonLogMsg;
    
            console.log(logJson.log.data);
            break;
          case "data":
            let dataJson = json as JsonDataMsg;
    
            // dataJson.data.base64
            break;
          default:
            break;
        }
      });
    
      this.process.on('close', (code) => {
        console.log(`stdiotuntap exited with code ${code}`);
      });
    });

  }
}
