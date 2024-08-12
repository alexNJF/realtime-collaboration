import { TestBed } from '@angular/core/testing';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { of, throwError } from 'rxjs';
import { WebSocketDataModel } from '../models/socket.model';
import { WebSocketService } from './websocket.service';
import { SocketAction } from '../enums/socket-status.enum';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let webSocketSpy: jasmine.SpyObj<WebSocketSubject<WebSocketDataModel>>;

  const mockWebSocketSubject = {
    next: jasmine.createSpy('next'),
    asObservable: jasmine.createSpy('asObservable').and.returnValue(of()),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebSocketService,
        { provide: WebSocketSubject, useValue: mockWebSocketSubject },
      ],
    });

    // spyOn(webSocket as any, 'default').and.returnValue(mockWebSocketSubject);


    service = TestBed.inject(WebSocketService);
    webSocketSpy = TestBed.inject(WebSocketSubject) as jasmine.SpyObj<WebSocketSubject<WebSocketDataModel>>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should handle incoming message', () => {
    const message: WebSocketDataModel = {
      action: SocketAction.MEMBER_CHANGE,
      data: 'test data',
    };
    service['handleIncomingMessage'](message);

    expect(service.connectionStatus()).toBeTrue();
    expect(service['reconnectAttemptsCounter']()).toBe(0);
  });

  it('should handle WebSocket error', () => {
    const consoleErrorSpy = spyOn(console, 'error');

    service['handleConnectionError']('Error');

    expect(consoleErrorSpy).toHaveBeenCalledWith('WebSocket error:', 'Error');
  });

  it('should handle connection complete', () => {
    const consoleLogSpy = spyOn(console, 'log');

    service['handleConnectionComplete']();

    expect(consoleLogSpy).toHaveBeenCalledWith('WebSocket connection closed');
  });

  

  it('should update retry status correctly', () => {
    service['reconnectAttemptsCounter'].set(3);
    expect(service.retryStatus()).toContain('Attempting to reconnect... (3)');

    service['reconnectAttemptsCounter'].set(5);
    expect(service.retryStatus()).toContain('Maximum reconnect attempts reached');
  });



  it('should handle WebSocket error', () => {
    const consoleErrorSpy = spyOn(console, 'error');

    service['handleConnectionError']('Error');

    expect(consoleErrorSpy).toHaveBeenCalledWith('WebSocket error:', 'Error');
  });

  it('should handle connection complete', () => {
    const consoleLogSpy = spyOn(console, 'log');

    service['handleConnectionComplete']();

    expect(consoleLogSpy).toHaveBeenCalledWith('WebSocket connection closed');
  });

  it('should log a message when WebSocket connection is closed', () => {
    const consoleLogSpy = spyOn(console, 'log');
    service['handleConnectionComplete']();
    expect(consoleLogSpy).toHaveBeenCalledWith('WebSocket connection closed');
  });

  it('should handle connection complete', () => {
    const consoleLogSpy = spyOn(console, 'log');

    service['handleConnectionComplete']();

    expect(consoleLogSpy).toHaveBeenCalledWith('WebSocket connection closed');
  });

  it('should update retry status correctly', () => {
    service['reconnectAttemptsCounter'].set(3);
    expect(service.retryStatus()).toContain('Attempting to reconnect... (3)');

    service['reconnectAttemptsCounter'].set(5);
    expect(service.retryStatus()).toContain('Maximum reconnect attempts reached');
  });

  it('should log connection status after incoming message', () => {
    const message: WebSocketDataModel = {
      action: SocketAction.MEMBER_CHANGE,
      data: 'test data',
    };
    service['handleIncomingMessage'](message);

    expect(service.connectionStatus()).toBeTrue();
  });





});
