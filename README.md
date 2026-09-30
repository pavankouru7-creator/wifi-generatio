# Wi-Fi Generation Comparison Tool

Micro project for Introduction to Wireless Communication.

## Files
- index.html : page structure (need bar, tabs, results area)
- style.css  : styling (light and dark theme)
- script.js  : logic (text parsing, capacity model, Chart.js chart, table)

## How to run
Open index.html in a browser. Internet is needed once to load Chart.js and the fonts from a CDN.

## How it works
1. The sentence is parsed for the number of devices and activity keywords (gaming, streaming, calls, downloads, VR, IoT).
2. Speed per device = heaviest activity + 30% of the others.
3. Total required = devices x speed per device x 1.25 (headroom).
4. Usable capacity = real throughput / (1 + k x (devices - 1)), where k models contention and is smaller for newer generations.
5. Each generation (802.11b, a, g, n, ac, ax, 6E, be) is rated Excellent / Good / Struggles / Not enough, with a latency check for gaming and VR.

Note: this is an educational estimation model, not measured data.
