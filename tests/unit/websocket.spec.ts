import { WebsocketClass, eventBus } from "@/utils";
import WS from "jest-websocket-mock";

describe("WebsocketClass", () => {
  afterEach(() => {
    WS.clean();
  });

  it("open should be emit", async () => {
    const fn = jest.fn();
    eventBus.on("ws-open", fn);

    const server = new WS("ws://localhost:1234");
    const client = new WebsocketClass("ws://localhost:1234");
    client.init();
    await server.connected;

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should send heartbeatText", async () => {
    const server = new WS("ws://localhost:1234");
    const client = new WebsocketClass("ws://localhost:1234", {
      heartbeatClientText: "testClient",
      heartbeatServerText: "testServer",
    });
    client.init();
    await server.connected;

    expect(client.heartbeatClientText).toBe("testClient");
    expect(client.heartbeatServerText).toBe("testServer");
  });

  it("should receive message", async () => {
    const server = new WS("ws://localhost:1234", { jsonProtocol: true });
    const client = new WebsocketClass("ws://localhost:1234");
    client.init();
    await server.connected;
    client.sendMsg("test", { name: "test" });

    await expect(server).toReceiveMessage({
      event: "test",
      data: { name: "test" },
    });
  });

  it("close should not be emit", async () => {
    const fn = jest.fn();
    eventBus.on("ws-close", fn);

    const server = new WS("ws://localhost:1234");
    const client = new WebsocketClass("ws://localhost:1234");
    client.init();
    await server.connected;
    client.closeWS();

    expect(fn).toHaveBeenCalledTimes(0);
  });
});
