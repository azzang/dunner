angular.module('dunner').factory('alertService', () => ({

  addAlert(type, msg) {
    this.alerts = [{ type, msg }];
  },

  closeAlert() {
    this.alerts.pop();
  },

  getResponseHandler(alertType, alertMessage) {
    return () => {
      this.addAlert(alertType, alertMessage);
      this.requestInProgress = false;
    };
  },

}) // eslint-disable-line comma-dangle
);
