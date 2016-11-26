angular.module('dunner').factory('emailService', ['$http', $http => ({

  sendEmail(subject, text, successMessage) {
    this.requestInProgress = true;
    $http.post('/user/mail', {
      mail: { subject, text },
    }).success(this.getResponseHandler('success', successMessage))
    .error(this.getResponseHandler('danger', 'Something Went Wrong.'));
  },

}),
]);
