[![Node version](https://img.shields.io/node/v/@lambdatt/qui-iam.svg?style=flat)](https://nodejs.org/download/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# @lambdatt/qui-iam

> A zero-config **Vue 3 + Quasar** bundle: globally registers your components, pages & services as a plugin so you can drop them into any Quasar app in one line.

---

## 🚀 Features

- **Auto-register** all `.vue` components under `src/components/`  
- **Expose pages** under `src/pages/` via `this.$iam.pages.<PageName>`  
- **Inject services** under `src/services/` as `this.$iam.services.<serviceName>()`  
- **Dynamic discovery**: drop new files into your bundle folders—no extra imports needed!  
- **Peer-driven**: relies on your app’s single copy of Vue, Quasar (and any other peer bundles)  
- **Minimal boilerplate**: one `app.use()` in your boot file and you’re done  

---

## 📦 Installation

### From npm (recommended)

```bash
npm install @lambdatt/qui-iam
# or
yarn add @lambdatt/qui-iam
```

## ⚡🔌 Auto-wire

```javascript
// src/boot/qui-iam.js
import { boot } from 'quasar/wrappers'
import Iam from '@lambdatt/qui-iam'

export default boot(({ app }) => {
  app.use(Iam)
})
```