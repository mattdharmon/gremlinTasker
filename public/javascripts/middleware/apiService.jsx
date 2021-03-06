'use strict';


import { browserHistory } from 'react-router';
import Axios from 'axios';
import Cookie from 'js-cookie';

/**
 * Channel all api requests here.
 **/
export default class ApiService {

  constructor() {
    this.session = this.getSession();
    this.apiConfig = {
      baseURL: '/api/v1/'
    };
  }

  getSession() {
    if (Cookie.get('session')) {
      return Cookie.getJSON('session');
    }
    return {};
  }

  setSession(sessionData) {
    sessionStorage.setItem('session', JSON.stringify(sessionData));
    Cookie.set('session', sessionData);
  }

  getBaseApi() {
    if (this.session) {
      this.apiConfig.headers = {
        'Authorization': this.session.session_id
      };
    }

    const axios = Axios.create(this.apiConfig);

    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // If there is a 401 error, return the user to the login screen.
        if (error.status == 401) {
          Cookie.remove('session');
          browserHistory.push('/login');
        }
        return Promise.reject(error);
      }
    );

    return axios;
  }

  /**
   * Check whether or not the user has a session_id.
   *
   * @return {Boolean}
   */
  isAuthenticated() {
    return this.getSession().hasOwnProperty('session_id');
  }


  /**
   * This is the deleteUserSession callback.
   * @callback ApiCallBack
   * @param {Object} err - A response object.
   * @param {Object} response - A response object.
   */

  /**
   * This will create a user Session after logging in the user.
   *
   * @param {String} uuid
   *
   * @returns {Promise}
   */
  login(loginData) {
    return this.getBaseApi()
      .post('users/login', loginData);
  }

  /**
   * This will create a user.
   *
   * @param {String} uuid
   * @return {Promise}
   */
  register(registerData) {
    return this.getBaseApi()
      .post('users/register', registerData);
  }

  /**
   * This will run a graphQL query.
   *
   * @param {String} uuid
   * @return {Promise}
   */
  graphQL(query) {
    return this.getBaseApi()
      .post('graphql', {query: query});
  }
}
