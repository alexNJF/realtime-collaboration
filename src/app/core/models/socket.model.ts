import { SocketAction } from "../enums/socket-status.enum";

export interface WebSocketDataModel {
    action:SocketAction;
    data?:any;
}