import WSEvent from "@/utils/event";

describe("WSEvent", () => {
  const events: WSEvent = new WSEvent();

  afterEach(() => {
    events.clear();
  });

  it("should on events", () => {
    const fn = jest.fn();
    events.on("eventOne", fn);
    events.emit("eventOne");

    expect(fn).toBeCalledTimes(1);
  });

  it("should emit events", () => {
    const fn = jest.fn();
    events.on("event2", fn);
    events.emit("event2");

    expect(fn).toBeCalledTimes(1);
  });

  it("should emit events with arguments", () => {
    const fn = jest.fn();
    const args = [1, 2, 3];

    events.on("event3", fn);
    events.emit("event3", args);

    expect(fn).toHaveBeenCalledWith(args);
  });

  it("should off events", () => {
    const fn = jest.fn();

    events.on("eventName", fn);
    events.off("eventName");
    events.emit("eventName");

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it("should once events", () => {
    const fn = jest.fn();

    events.once("eventName", fn);
    events.emit("eventName");
    events.emit("eventName");

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should clear events", () => {
    const fn = jest.fn();

    events.on("event1", fn);
    events.clear();
    events.emit("event1");

    expect(fn).toHaveBeenCalledTimes(0);
  });
});
