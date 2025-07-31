import { http, eventbroadcaster, utils } from '@lambdatt-qui/toolcase'
import ENDPOINTS from './ENDPOINTS.js';

export default {
  loggedUser: null,

  async authenticate() {
    if (navigator.onLine === false) return;

    eventbroadcaster.$broadcast('load', 'auth');

    try {
      const response = await http.get(ENDPOINTS.AUTH.LOGGED_USER);

      this.loggedUser = response.data;
    } catch (error) {
      console.error(error);
      if (error.response?.status == 401) {
        localStorage.removeItem('xsrf_token');
        localStorage.removeItem('iam_session_key');
        localStorage.removeItem('regularPermissions');
        localStorage.removeItem('customPermissions');
        utils.getRouter().push(`/login?goTo=${utils.getCurrentRoute().path}`)
      }
    } finally {
      eventbroadcaster.$broadcast('loaded', 'auth');
    }
  },

  logout($component) {
    $component.$emit('load', 'logout');

    var url = ENDPOINTS.AUTH.LOGOUT;

    if (localStorage.getItem('authtoken'))
      url += '?token=' + localStorage.getItem('authtoken');

    return http.delete(url)
      .then(function () {
        $component.$emit('loaded', 'logout');
        localStorage.removeItem('authtoken');
        localStorage.removeItem('xsrf_token');
        localStorage.removeItem('iam_session_key');
        localStorage.removeItem('regularPermissions');
        localStorage.removeItem('customPermissions');
      });
  }
}
