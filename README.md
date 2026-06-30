# mluona IPTV

A professional, high-performance IPTV application designed natively for LG webOS (IPK format).

## Features
- **Native TV UI**: Built for DPAD navigation (Arrow keys + OK).
- **High Performance**: Minimal DOM manipulation, hardware-accelerated animations.
- **Support for LG webOS 4-24**.
- **Xtream API & M3U** Support.
- **VOD & Live TV**.

## Architecture
- `index.html`: Entry point & Login.
- `pages/`: UI pages for the different app sections.
- `assets/`: Styling specific to pages without heavy frameworks.
- `js/`: UI logic and spatial navigation code.
- `api/`: Fetch and parse APIs.

## Building
To package as an IPK file for LG webOS, utilize the `ares-package` CLI tool:
`ares-package . -o ./dist`
