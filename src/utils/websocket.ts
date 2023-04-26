import WSEvent from "./event";

const eventBus = new WSEvent();

interface IReConnectFn {
  (times: number, event: CloseEvent): Promise<any>;
}

interface IWSOptions {
  reConnectFn?: IReConnectFn;
  reLinkTimes?: number;
  heartbeatClientText?: string;
  heartbeatServerText?: string;
  heartbeatInterval?: number;
}

class WebsocketClass {
  private wsInstance: WebSocket | undefined;
  private sendEvent = "";
  private heartbeatTimer: any;
  private isActiveClose: boolean;
  private reConnectTimes: number;
  private reConnectTimer: any;

  public url;
  public reLinkTimes;
  public heartbeatServerText: string;
  public heartbeatClientText: string;
  public heartbeatInterval: number;
  public reConnectFn?: IReConnectFn;

  constructor(
    url,
    options: IWSOptions = {
      reLinkTimes: 5,
      heartbeatServerText: "server",
      heartbeatClientText: "client",
      heartbeatInterval: 5000,
    }
  ) {
    this.url = url;

    this.reLinkTimes = (options && options.reLinkTimes) || 5;
    this.heartbeatServerText =
      (options && options.heartbeatServerText) || "server";
    this.heartbeatClientText =
      (options && options.heartbeatClientText) || "client";
    this.isActiveClose = false;
    this.reConnectTimes = 0;
    this.heartbeatInterval = (options && options.heartbeatInterval) || 5000;
    this.reConnectFn = options && options.reConnectFn;
  }

  init() {
    if (!this.wsInstance) {
      this.wsInstance = new WebSocket(this.url);
    }
    this.wsInstance.onopen = () => this.onOpen();
    this.wsInstance.onmessage = (res: MessageEvent) => this.onMessage(res);
    this.wsInstance.onclose = (e: CloseEvent) => this.onClose(e);
  }

  private onOpen() {
    clearTimeout(this.reConnectTimer);
    eventBus.emit("ws-open");
    this.heartbeatCheck();
  }

  private onMessage(res: MessageEvent) {
    if (res.data === this.heartbeatServerText) {
      console.log(res.data);
    } else {
      const result = JSON.parse(res.data);
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = this.heartbeatCheck();
      eventBus.emit(this.sendEvent, result);
    }
  }

  private onClose(e: CloseEvent) {
    if (this.isActiveClose) return;
    clearInterval(this.heartbeatTimer);
    clearTimeout(this.reConnectTimer);
    delete this.wsInstance;
    this.reConnectTimes += 1;
    this.reConnectTimer = setInterval(async () => {
      if (this.reConnectTimes <= this.reLinkTimes) {
        try {
          this.reConnectFn
            ? await this.reConnectFn(this.reConnectTimes, e)
            : null;
          this.init();
        } catch (e) {
          console.error(e);
        }
      } else {
        clearTimeout(this.reConnectTimer);
        eventBus.emit("ws-close");
      }
    }, this.heartbeatInterval);
  }

  private heartbeatCheck() {
    return setInterval(() => {
      this.wsInstance?.send(this.heartbeatClientText);
    }, this.heartbeatInterval);
  }

  sendMsg(event: string, data: Record<string, any>) {
    return new Promise((resolve) => {
      this.wsInstance?.send(JSON.stringify({ event, data }));
      this.sendEvent = event;
      eventBus.on(this.sendEvent, (res) => {
        resolve(res);
      });
    });
  }

  closeWS() {
    return new Promise((resolve) => {
      this.isActiveClose = true;
      this.wsInstance?.close();
      eventBus.clear();
      resolve("close");
    });
  }
}

export { WebsocketClass, eventBus };
