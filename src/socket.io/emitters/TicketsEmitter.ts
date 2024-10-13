import UserManager from "socket.io/utils/UserManager";
import EmitterBase from "./EmitterBase";

export default class TicketsEmitter extends EmitterBase {
  public static emitTicketConfirm = (passengerId: string) => {
    const socketId = UserManager.getSocket(passengerId);
    this.instance
      ?.to(socketId!) // Todo: Temporary code fix
      .emit("ticketConfirmed", "Todo: Dispatch required ticket details");
  };
}
