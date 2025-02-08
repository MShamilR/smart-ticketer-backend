import { Server } from "socket.io";

export default abstract class EmitterBase {
  protected static instance: Server | null = null;

  public static setInstance(io: Server) {
    this.instance = io;
  }

  public static deleteInstance() {
    this.instance = null;
  }

  protected static getInstance() {
    if (!this.instance) {
      throw new Error("Socket.io instance not set");
    }
    return this.instance;
  }
}
