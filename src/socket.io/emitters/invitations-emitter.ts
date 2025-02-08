import UserManager from "socket.io/utils/user-manager";
import EmitterBase from "./emitter-base";

export default class InvitationsEmitter extends EmitterBase {
  public static emitInvitation = (receiverId: string) => {
    const socketId = UserManager.getSocket(receiverId);
    this.instance
      ?.to(socketId!) // Todo: Temporary code fix
      .emit("invitationReceived", "Todo: Dispatch required dispatch details");
  };

  public static emitAccepted = (senderId: string) => {
    const socketId = UserManager.getSocket(senderId);
    this.instance
      ?.to(socketId!) // Todo: Temporary code fix
      .emit("invitationAccepted", "Todo: Dispatch required acceptance details");
  };
}
