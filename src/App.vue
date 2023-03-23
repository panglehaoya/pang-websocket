<template>
  <div>
    <button @click="handleClick">点击</button>
    <button @click="handleActiveClose">关闭</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import websocketUtils from "./utils/index";

export default Vue.extend({
  name: "Index",

  mounted() {
    const { WebsocketClass, eventBus } = websocketUtils;
    const ws = new WebsocketClass(
      "ws://localhost:3001/websocket/1",
      this.handleReconnect
    );
    eventBus.on("ws-open", this.handleWSOpen);
    // 超过连接次数还未连接成功时触发该事件
    eventBus.on("ws-close", this.handleWSClose);
    ws.init();
    // 如果不要响应式 可以不放在data中
    (this as any).ws = ws;
  },
  methods: {
    // 重连时的回调处理 需要返回promise resolve后 才会进行下一次重连
    handleReconnect(times, e) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("reconnect", times, e);
          resolve("done");
        }, 2000);
      });
    },
    handleWSOpen() {
      (this as any).ws.sendMsg("text", { name: "name" }).then((res) => {
        console.log("handle res", res);
      });
    },
    handleClick() {
      (this as any).ws.sendMsg("other", { other: "other" }).then((res) => {
        console.log("handle other", res);
      });
    },
    // 主动关闭链接
    handleActiveClose() {
      (this as any).ws.closeWS().then((res) => {
        console.log("close ws", res);
      });
    },
    handleWSClose() {
      console.log("reconnect fail close ws");
    },
  },
});
</script>
