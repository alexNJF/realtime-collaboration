export interface WebSocketModel {
    status: WebSocket['readyState'] 
    data?: any;
    error?: any//Error    

}