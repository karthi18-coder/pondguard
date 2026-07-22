
document.addEventListener('DOMContentLoaded', function () {
  var reportForm = document.getElementById('report-form');
  var reportMessage = document.getElementById('formMessage');
  var communityForm = document.getElementById('community-signup');
  var communityMessage = document.getElementById('communityMessage');

  if (reportForm) {
    reportForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var issueType = document.getElementById('issueType');
      var district = document.getElementById('district');
      var location = document.getElementById('location');
      var description = document.getElementById('description');
      var submitButton = reportForm.querySelector('button[type="submit"]');

      if (!issueType || !issueType.value || !district || !district.value || !location || !location.value || !description || !description.value.trim()) {
        if (reportMessage) {
          reportMessage.textContent = 'Please complete all required fields before submitting.';
          reportMessage.style.color = '#c0392b';
        }
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
      }

      var formData = new FormData(reportForm);

      fetch('/api/reports', {
        method: 'POST',
        body: formData
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Unable to submit report.');
          }
          return response.json();
        })
        .then(function (data) {
          reportForm.reset();
          if (reportMessage) {
            reportMessage.textContent = data.message || 'Thank you! Your issue report was submitted successfully.';
            reportMessage.style.color = '#2a8d78';
          }
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Report';
          }
        })
        .catch(function (error) {
          if (reportMessage) {
            reportMessage.textContent = error.message || 'Submission failed. Try again later.';
            reportMessage.style.color = '#c0392b';
          }
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Report';
          }
        });
    });

    var mapFrame = document.getElementById('mapFrame');
    var locationSelect = document.getElementById('location');

    function updateMap() {
      var selectedLocation = locationSelect ? locationSelect.value : '';
      var query = selectedLocation ? encodeURIComponent(selectedLocation + ' Krishnagiri district Tamil Nadu') : 'Krishnagiri district pond';
      if (mapFrame) {
        mapFrame.src = 'https://www.google.com/maps?q=' + query + '&output=embed';
      }
    }

    if (locationSelect && mapFrame) {
      locationSelect.addEventListener('change', updateMap);
    }
  }

  if (communityForm) {
    communityForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = communityForm.querySelector('input[name="name"]');
      var email = communityForm.querySelector('input[name="email"]');
      var interest = communityForm.querySelector('select[name="interest"]');

      if (!name || !name.value.trim() || !email || !email.value.trim() || !interest || !interest.value) {
        if (communityMessage) {
          communityMessage.textContent = 'Please fill in your details before joining.';
          communityMessage.style.color = '#c0392b';
        }
        return;
      }

      communityForm.reset();
      if (communityMessage) {
        communityMessage.textContent = 'Thanks for joining! We will share the next event details with you soon.';
        communityMessage.style.color = '#2a8d78';
      }
    });
  }
});
