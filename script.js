
document.addEventListener('DOMContentLoaded', function () {
  var reportForm = document.getElementById('reportForm');
  var formMessage = document.getElementById('formMessage');

  if (reportForm) {
    reportForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var issueType = document.getElementById('issueType');
      var location = document.getElementById('location');
      var description = document.getElementById('description');

      if (!issueType.value || !location.value.trim() || !description.value.trim()) {
        formMessage.textContent = 'Please complete all required fields before submitting.';
        formMessage.style.color = '#c0392b';
        return;
      }

      reportForm.reset();
      formMessage.textContent = 'Thank you! Your report has been submitted successfully.';
      formMessage.style.color = '#2a8d78';
    });
  }
});
