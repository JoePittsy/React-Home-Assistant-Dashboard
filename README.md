# Casa — Home Assistant Dashboard

A production-grade React dashboard for Home Assistant. Dark, editorial aesthetic — a deliberate departure from Lovelace.

Built with Vite + TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, Framer Motion, and `home-assistant-js-websocket`.

---

## Installation

```bash
npm install
```

---

## Getting a Home Assistant Long-Lived Token

1. Open Home Assistant in your browser
2. Click your profile picture (bottom-left of the sidebar)
3. Scroll to **Long-Lived Access Tokens** at the bottom of the page
4. Click **Create Token**, give it a name (e.g. "Dashboard"), and copy the token immediately — it is only shown once

---

## Configuration

All configuration lives in `public/dashboard.yaml`. This file is excluded from git (see `.gitignore`) to protect your token.

```yaml
ha:
  url: "https://your-ha-instance.example.com"   # HTTPS URL (wss:// is derived automatically)
  token: "your-long-lived-access-token"

dashboard:
  title: "Casa"
  pages:
    - name: "Living Room"
      icon: "sofa"          # any Lucide icon name, kebab-case
      columns: 3            # cards per row on desktop
      cards:

        - type: light
          entity: light.living_room_ceiling
          name: "Ceiling"
          show_brightness: true

        - type: switch
          entity: switch.tv_plug
          name: "TV"

        - type: sensor
          entity: sensor.temperature
          name: "Temperature"
          unit: "°C"
          icon: thermometer
          decimals: 1

        - type: binary_sensor
          entity: binary_sensor.front_door
          name: "Front Door"
          device_class: door   # door | motion | window | smoke | moisture
```

### Card types

| Type | Controls | Fields |
|---|---|---|
| `light` | Toggle + optional brightness slider | `entity`, `name`, `show_brightness` |
| `switch` | Toggle | `entity`, `name` |
| `sensor` | Read-only value display | `entity`, `name`, `unit`, `icon`, `decimals` |
| `binary_sensor` | Read-only icon indicator | `entity`, `name`, `device_class` |

### Icons

Icon names come from [Lucide](https://lucide.dev/icons/) in kebab-case: `thermometer`, `door-open`, `layout-dashboard`, etc.

---

## Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. The dashboard connects to your HA instance immediately on load.

---

## Production Build

```bash
npm run build
npm run preview    # serves the dist/ folder locally to verify
```

To deploy, copy the `dist/` folder to any static web host, or serve it from HA itself by placing it under `config/www/`.
