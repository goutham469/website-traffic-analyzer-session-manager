# this is a micro-service intended for maintaining the start and end times of user visit.

The Application is developed in a way that runs socket.io + Google Cloud run

Endpoints of `Socket.on`:-

1. `on` - will receive {userId, sessionStart} and keeps that in memory
2. `off` - will receive {userId} and calls an external API endpoint that updates the session with {userId, sessionStart, endTime} endTime - `new Date().getTime();`
3. 