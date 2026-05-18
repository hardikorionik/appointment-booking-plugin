# @aaravpos/appointment-booking-plugin

React plugin for embedding the Aarav POS appointment booking system into your application.

---

# Installation

Using npm:

```bash
npm install @aaravpos/appointment-booking-plugin
```

Using yarn:

```bash
yarn add @aaravpos/appointment-booking-plugin
```

---

# Usage

Import the plugin into your React application.

```jsx
import { AppointmentBookingPlugin } from "@aaravpos/appointment-booking-plugin";

function App() {
  return (
    <AppointmentBookingPlugin bookingCode={"QK9E2A"} />
  );
}

export default App;
```

---

# Props

| Prop Name   | Type   | Required | Description                          |
| ------------ | ------ | -------- | ------------------------------------ |
| bookingCode | string | Yes      | Unique booking code for appointment booking |

---

# Example

```jsx
import React from "react";
import { AppointmentBookingPlugin } from "@aaravpos/appointment-booking-plugin";

const App = () => {
  return (
    <div>
      <AppointmentBookingPlugin bookingCode={"QK9E2A"} />
    </div>
  );
};

export default App;
```

---

# Requirements

- React 17+
- React 18+
- Node.js 16+

---

# Features

- Easy integration
- Lightweight plugin
- Responsive booking UI
- Secure booking flow

---

# Publish Package

```bash
npm publish --access public
```

---

# License

MIT License

---

# Support

For support and issues, contact the Aarav POS team.