
import { createServer as createTcpServer, Server as TcpServer, Socket as TcpSocket } from "net";
import { JsonMsg } from "./protocol";

function info(...args: string[]) {
  console.log("[info]", ...args);
}

export interface BridgeListener {
  (msg: JsonMsg): void;
}

export class Bridge {
  server: TcpServer;
  client: TcpSocket;
  listeners: Set<BridgeListener>;

  listen (listener: BridgeListener): this {
    this.listeners.add(listener);
    return this;
  }
  deafen (listener: BridgeListener): this {
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
    if (this.client) this.client.write(JSON.stringify(msg));
    return this;
  }
  constructor (port: number) {

    this.server = createTcpServer((socket)=>{
      this.client = socket;
      info("bridge connected");
      
      socket.on("data", (data)=>{
        console.log("Service sent", data.toString());
        
        try {
          let str = data.toString();
          let json = JSON.parse(str);
          this.fire(json);
        } catch (ex) {

        }
      });
      
      // let interval = setInterval(()=>{
      //   if (!socket) clearInterval(interval);
      //   console.log("pinging");
      //   socket.write("{'msg': 'Ping'}");
        
      // }, 1000);
    
      socket.on("close", (hadError)=>{
        console.log("Service disconnected");
        // clearInterval(interval);
        (socket as any) = undefined;
      });
      
      
    });
    
    this.server.listen(port);
  }
}
  