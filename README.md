# FingerprintAudit

FingerprintAudit is a professional browser intelligence and diagnostic tool designed to reveal exactly what anti-fraud systems (like Amazon, Stripe, Facebook, and Google Ads) see when a client connects to their services. 

It provides advanced insights into browser fingerprinting, detecting spoofing attempts, proxy/VPN leaks, and exposing the underlying hardware and network signatures often hidden by privacy extensions or anti-detect browsers.

## Key Features

### Comprehensive Network Intelligence
- **TLS Fingerprinting**: Extracts **JA3**, **JA4**, **PeetPrint Hash**, and **Akamai HTTP/2 Fingerprint** by analyzing the raw TLS handshake and HTTP/2 frames, bypassing browser-level spoofing.
- **WebRTC Leak Detection**: Bypasses VPNs and proxies by forcefully enumerating local and public IP addresses via ICE candidates.
- **ALPN & Negotiation Validation**: Detects anomalies in supported HTTP/TLS versions, cipher suites, and extensions.

### Advanced Hardware & Rendering Signatures
- **Canvas & WebGL Fingerprinting**: Hashes the rendered output of HTML5 Canvas and WebGL contexts. Detects anomalies between User-Agent asserted platforms and actual WebGL renderers (e.g., claiming Windows but using Apple GPU).
- **Audio Context Fingerprinting**: Generates stable hashes from the Web Audio API's dynamics compressor.
- **System Fonts Detection**: Enumerates system fonts to detect standard vs customized OS environments.

### Deep Client Diagnostics (Passive & Active)
- **Permissions API Analysis**: Analyzes default hardware access states (Geolocation, Media Devices).
- **Math Precision Fingerprinting**: Uses extreme floating-point operations (`Math.tan`, `Math.cos`) to identify CPU/OS-level precision quirks.
- **Storage & Quota Forensics**: Tests for IndexedDB/localStorage availability, and analyzes navigator storage estimates.
- **WebGPU Adapter Insights**: Queries the modern `navigator.gpu` for deep, unspooled hardware adapter information.
- **Media Codec Checks**: Verifies specific audio and video codec support, which heavily varies by OS and browser distribution.
- **CSS Media Queries Validation**: Inspects color gamuts and interaction capabilities.
- **Behavioral Heuristics**: Identifies abnormal mouse jitter and typing cadence (measures bot-like entropy).

### Interactive Fingerprint Comparison
- Compare two separate scans side-by-side using unique Scan IDs.
- Easily visualize which signals remained stable and which were spoofed or randomized (e.g., identifying when noise injection is applied to Canvas/WebGL).

### Platform-Specific Risk Scoring
- Evaluates the accumulated fingerprint against known heuristics from top anti-fraud platforms:
  - **Amazon (Strict IP & Hardware integrity)**
  - **Google Ads & Google Play (Deep automation detection)**
  - **Stripe & PayPal (Financial fraud & VPN indicators)**
  - **Facebook Ads (Behavioral & Headless Chrome indicators)**

## Tech Stack
- **Framework**: Next.js 15 (App Router), React
- **Styling**: Tailwind CSS
- **Network Scanning Proxy**: Custom implementation interacting with `tls.peet.ws` and IP geolocation APIs.

## Purpose and Use Cases
This tool is built for security researchers, penetration testers, and developers integrating anti-fraud measures. It demonstrates the depth at which modern tracking systems operate and exposes the severe limitations of purely software-based anonymization tools (like simple VPNs or basic User-Agent switchers).
