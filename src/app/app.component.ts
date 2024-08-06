import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'realtimecollabration';
  private ws!: WebSocket;

  ngOnInit() {
    this.ws = new WebSocket('ws://your-server-address');

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Update UI based on received data
    };

    // Handle user interactions and send data to the server
  }

}
