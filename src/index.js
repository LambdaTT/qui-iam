// src/index.js
import { registerComponents, registerServices, pages } from './registrations.js'

export default {
  install(app) {
    // 1) Register all components
    registerComponents(app)

    // 2) Register all services under $api
    app.config.globalProperties.$api = {}
    registerServices(app)

    // 3) Expose pages for manual routing
    app.config.globalProperties.$bundlePages = pages
  }
}
