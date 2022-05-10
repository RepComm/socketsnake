
# socketsnake
A (wip) replacement of PDANet software

Aims to eventually provide compatibility with pdanet mobile and desktop software
but definitely to replace the functionality of pdanet software.

# state
Close to functional on linux, all the individual parts are functional, but needs assembling.

# why
PDANet software does essentially the same job, but it is not open source, it is old, has very limited linux support (no tcp/udp for me =( ), and frankly the website looks kinda sketch.

The paid-version of PDANet is cheap, but when I went to purchase I saw bad reviews of the key not working, and decided I'd live with free version until I got the guts to reproduce a similar product to replace it.

# how
A [tuntap device](https://en.wikipedia.org/wiki/TUN/TAP) is created<br/>
on the "request" mode computer (currently linux, windows support is planned)<br/>

The traffic is forwarded to an "service" mode (currently android) mobile device<br />
(currently over adb thru USB), which swaps the endpoint address, and sends to WAN

# specifics
- socketsnake uses [node.js](https://nodejs.org) runtime
- tuntap device is created using [stdiotuntap](https://github.com/RepComm/stdiotuntap)
- stdiotuntap uses [LaKabane/libtuntap](https://github.com/LaKabane/libtuntap)
- [adb](https://developer.android.com/studio/command-line/adb) is used to connect to "service" android mobile device
- `adb reverse tcp:10209 tcp:10209` is run on "request" desktop device
