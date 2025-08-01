// AUTO GENERATED - do not edit by hand

// => importing ENDPOINTS:
import ENDPOINTS from './ENDPOINTS.js'

// => importing services:
import auth from './services/auth.js'
import permissions from './services/permissions.js'

// => importing components:
import AuditInfo from './components/AuditInfo.vue'
import HelloWorld from './components/HelloWorld.vue'
import UserInfo from './components/UserInfo.vue'

export function registerEndpoints(app) {
  app.config.globalProperties.$iam.ENDPOINTS = ENDPOINTS
}

export function registerComponents(app) {
  app.component('AuditInfo', AuditInfo)
  app.component('HelloWorld', HelloWorld)
  app.component('UserInfo', UserInfo)
}

export function registerServices(app) {
  app.config.globalProperties.$iam.services['auth'] = auth
  app.config.globalProperties.$iam.services['permissions'] = permissions
}

export const pages = {}
pages['create'] = (await import('./pages/accessprofiles/create.vue')).default
pages['edit'] = (await import('./pages/accessprofiles/edit.vue')).default
pages['list'] = (await import('./pages/accessprofiles/list.vue')).default
pages['view'] = (await import('./pages/accessprofiles/view.vue')).default
pages['login'] = (await import('./pages/auth/login.vue')).default
pages['permissions'] = (await import('./pages/permissions/permissions.vue')).default
pages['create'] = (await import('./pages/users/create.vue')).default
pages['edit'] = (await import('./pages/users/edit.vue')).default
pages['list'] = (await import('./pages/users/list.vue')).default
pages['myaccount'] = (await import('./pages/users/myaccount.vue')).default
pages['resetpass'] = (await import('./pages/users/resetpass.vue')).default
pages['view'] = (await import('./pages/users/view.vue')).default