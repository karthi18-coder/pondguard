 
    const pondData = [
      { id: 'PG-001', name: 'Anna Nagar Pond', district: 'Madurai', location: 'Anna Nagar, Madurai', lat: 9.93, lng: 78.12 },
      { id: 'PG-002', name: 'Kallankulam Pond', district: 'Thanjavur', location: 'Kallankulam, Thanjavur', lat: 10.79, lng: 79.13 },
      { id: 'PG-003', name: 'Pudhu Nagar Tank', district: 'Coimbatore', location: 'Pudhu Nagar, Coimbatore', lat: 11.02, lng: 76.96 },
      { id: 'PG-004', name: 'Mela Oorani', district: 'Salem', location: 'Mela Oorani, Salem', lat: 11.66, lng: 78.15 },
      { id: 'PG-005', name: 'Kovilpatti Pond', district: 'Tirunelveli', location: 'Kovilpatti, Tirunelveli', lat: 8.77, lng: 77.71 }
    ];

    const tamilNaduDistricts = [
      'Ariyalur',
      'Chengalpattu',
      'Chennai',
      'Coimbatore',
      'Cuddalore',
      'Dharmapuri',
      'Dindigul',
      'Erode',
      'Kallakurichi',
      'Kanchipuram',
      'Kanyakumari',
      'Karur',
      'Krishnagiri',
      'Madurai',
      'Mayiladuthurai',
      'Nagapattinam',
      'Namakkal',
      'Nilgiris',
      'Perambalur',
      'Pudukkottai',
      'Ramanathapuram',
      'Ranipet',
      'Salem',
      'Sivaganga',
      'Tenkasi',
      'Thanjavur',
      'Theni',
      'Thoothukudi',
      'Tirunelveli',
      'Tirupathur',
      'Tiruppur',
      'Tiruvallur',
      'Tiruvannamalai',
      'Tiruvarur',
      'Trichy',
      'Vellore',
      'Viluppuram',
      'Virudhunagar'
    ];

    const issueOptions = [
      { icon: '🗑️', label: 'Garbage / Waste Dumping' },
      { icon: '💧', label: 'Water Pollution' },
      { icon: '🚰', label: 'Sewage or Drainage Issue' },
      { icon: '🏗️', label: 'Encroachment / Illegal Construction' },
      { icon: '🌱', label: 'Invasive Plants or Overgrowth' },
      { icon: '🐟', label: 'Dead Fish or Environmental Damage' },
      { icon: '🌊', label: 'Water Level Problem' },
      { icon: '⚠️', label: 'Other Issue' }
    ];

    const mockReports = [
      { id: 'PG-TN-100201', pond: 'Anna Nagar Pond', issue: 'Water Pollution', date: '2026-07-20', status: 'pending' },
      { id: 'PG-TN-100202', pond: 'Kallankulam Pond', issue: 'Garbage / Waste Dumping', date: '2026-07-18', status: 'review' },
      { id: 'PG-TN-100203', pond: 'Mela Oorani', issue: 'Dead Fish or Environmental Damage', date: '2026-07-15', status: 'resolved' }
    ];

    const state = {
      currentScreen: 'home',
      currentStep: 1,
      selectedPond: null,
      selectedProblems: [],
      selectedSeverity: null,
      evidenceCount: 0,
      locationCollected: false,
      complaintId: null,
      loggedIn: false,
      userName: 'User'
    };

    const screens = {
      home: document.getElementById('homeScreen'),
      auth: document.getElementById('authScreen'),
      dashboard: document.getElementById('dashboardScreen'),
      reportFlow: document.getElementById('reportFlowScreen'),
      success: document.getElementById('successScreen')
    };

    function showScreen(name) {
      Object.entries(screens).forEach(([key, el]) => { el.classList.toggle('hidden', key !== name); });
      state.currentScreen = name;
    }

    function renderStep() {
      const stepTitles = [
        'Step 1 of 4 — Select Pond',
        'Step 2 of 4 — Select Problem',
        'Step 3 of 4 — Add Evidence',
        'Step 4 of 4 — Review & Submit'
      ];
      document.getElementById('stepIndicator').textContent = stepTitles[state.currentStep - 1];
      document.getElementById('progressFill').style.width = `${state.currentStep * 25}%`;

      document.querySelectorAll('.step-step').forEach((el, index) => {
        el.classList.toggle('hidden', index + 1 !== state.currentStep);
      });

      const prevButton = document.getElementById('prevStepBtn');
      const nextButton = document.getElementById('nextStepBtn');
      prevButton.classList.toggle('hidden', state.currentStep === 1);
      nextButton.textContent = state.currentStep === 4 ? 'Submit Report' : 'Next';
    }

    function renderSearchResults(query) {
      const searchResults = document.getElementById('searchResults');
      const filtered = pondData.filter(pond =>
        `${pond.name} ${pond.district} ${pond.location}`.toLowerCase().includes(query.toLowerCase())
      );
      if (!query.trim()) {
        searchResults.innerHTML = '';
        return;
      }
      searchResults.innerHTML = filtered.map(pond => `
        <div class="option-card pond-option" data-pond-id="${pond.id}">
          <span class="option-icon">💧</span>
          <strong>${pond.name}</strong>
          <div class="tiny">${pond.district} • ${pond.location}</div>
        </div>
      `).join('') || '<div class="tiny">No pond found. Try another name or district.</div>';
      document.querySelectorAll('.pond-option').forEach(card => {
        card.addEventListener('click', () => {
          const pond = pondData.find(item => item.id === card.dataset.pondId);
          selectPond(pond);
        });
      });
    }

    function selectPond(pond) {
      state.selectedPond = pond;
      document.getElementById('selectedPondName').textContent = pond.name;
      document.getElementById('selectedPondDistrict').textContent = pond.district;
      document.getElementById('selectedPondLocation').textContent = pond.location;
      document.getElementById('selectedPondId').textContent = pond.id;
      document.getElementById('selectedPondPreview').classList.remove('hidden');
      document.getElementById('reviewPondName').textContent = pond.name;
      document.getElementById('reviewLocation').textContent = pond.location;
      document.getElementById('step1Error').textContent = '';
    }

    function refreshCustomLocationPreview() {
      const district = document.getElementById('districtSelect').value.trim();
      const location = document.getElementById('locationInput').value.trim();
      const pondName = document.getElementById('pondInput').value.trim();

      document.getElementById('selectedPondName').textContent = pondName || 'Enter pond name';
      document.getElementById('selectedPondDistrict').textContent = district || 'Choose a district';
      document.getElementById('selectedPondLocation').textContent = location || 'Enter a location name';
      document.getElementById('selectedPondId').textContent = 'Custom Entry';
      document.getElementById('selectedPondPreview').classList.remove('hidden');

      document.getElementById('reviewPondName').textContent = pondName || '-';
      document.getElementById('reviewLocation').textContent = `${location || '-'}${district ? ', ' + district : ''}`;
    }

    function renderProblemCards() {
      document.getElementById('problemGrid').innerHTML = issueOptions.map(issue => `
        <div class="option-card problem-card" data-label="${issue.label}">
          <span class="option-icon">${issue.icon}</span>
          <strong>${issue.label}</strong>
        </div>
      `).join('');
      document.querySelectorAll('.problem-card').forEach(card => {
        card.addEventListener('click', () => {
          const label = card.dataset.label;
          if (state.selectedProblems.includes(label)) {
            state.selectedProblems = state.selectedProblems.filter(item => item !== label);
          } else {
            state.selectedProblems.push(label);
          }
          card.classList.toggle('active', state.selectedProblems.includes(label));
          document.getElementById('reviewIssue').textContent = state.selectedProblems.join(', ') || 'Not selected';
        });
      });
    }

    function renderDistrictMap() {
      const districtMap = document.getElementById('districtMap');
      const districtSelect = document.getElementById('districtSelect');

      districtMap.innerHTML = tamilNaduDistricts.map(district => `
        <button type="button" data-district="${district}">${district}</button>
      `).join('');

      districtSelect.innerHTML = '<option value="">Choose a district</option>' + tamilNaduDistricts.map(district => `
        <option value="${district}">${district}</option>
      `).join('');

      districtMap.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
          districtSelect.value = button.dataset.district;
          document.querySelectorAll('#districtMap button').forEach(item => item.classList.remove('active'));
          button.classList.add('active');
          refreshCustomLocationPreview();
        });
      });

      districtSelect.addEventListener('change', () => {
        const selectedDistrict = districtSelect.value;
        document.querySelectorAll('#districtMap button').forEach(item => {
          item.classList.toggle('active', item.dataset.district === selectedDistrict);
        });
        refreshCustomLocationPreview();
      });
    }

    function validateStep() {
      if (state.currentStep === 1) {
        const district = document.getElementById('districtSelect').value.trim();
        const location = document.getElementById('locationInput').value.trim();
        const pondName = document.getElementById('pondInput').value.trim();

        if (!district || !location || !pondName) {
          document.getElementById('step1Error').textContent = 'Please choose a district, enter a location name, and add the pond name before continuing.';
          return false;
        }

        state.selectedPond = {
          name: pondName,
          district: district,
          location: `${location}, ${district}`
        };
        refreshCustomLocationPreview();
      }
      if (state.currentStep === 2) {
        if (!state.selectedProblems.length) {
          document.getElementById('step2Error').textContent = 'Please select at least one problem type.';
          return false;
        }
        if (!state.selectedSeverity) {
          document.getElementById('step2Error').textContent = 'Please choose the severity level.';
          return false;
        }
      }
      if (state.currentStep === 3) {
        if (!state.evidenceCount && !document.getElementById('descriptionInput').value.trim()) {
          document.getElementById('step3Error').textContent = 'Please add a photo, video, or description to continue.';
          return false;
        }
      }
      return true;
    }

    function nextStep() {
      if (!validateStep()) return;
      if (state.currentStep < 4) {
        state.currentStep += 1;
        if (state.currentStep === 4) {
          document.getElementById('reviewPondName').textContent = state.selectedPond?.name || '-';
          document.getElementById('reviewLocation').textContent = state.selectedPond?.location || '-';
          document.getElementById('reviewIssue').textContent = state.selectedProblems.join(', ');
          document.getElementById('reviewSeverity').textContent = state.selectedSeverity || '-';
          document.getElementById('reviewEvidence').textContent = `${state.evidenceCount} files uploaded`;
          document.getElementById('reviewDescription').textContent = document.getElementById('descriptionInput').value.trim() || 'No description added';
        }
        renderStep();
      } else {
        submitReport();
      }
    }

    function prevStep() {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
        renderStep();
      }
    }

    function submitReport() {
      if (!validateStep()) return;
      const loadingBtn = document.getElementById('nextStepBtn');
      loadingBtn.disabled = true;
      loadingBtn.textContent = 'Submitting...';
      setTimeout(() => {
        const date = new Date();
        state.complaintId = `PG-TN-${String(Math.floor(100000 + Math.random() * 900000))}`;
        document.getElementById('complaintIdOutput').textContent = state.complaintId;
        showScreen('success');
        const reportItem = {
          id: state.complaintId,
          pond: state.selectedPond.name,
          issue: state.selectedProblems[0],
          date: date.toISOString().split('T')[0],
          status: 'pending'
        };
        mockReports.unshift(reportItem);
        renderRecentReports();
        loadingBtn.disabled = false;
        loadingBtn.textContent = 'Submit Report';
        resetForm();
      }, 900);
    }

    function resetForm() {
      state.currentStep = 1;
      state.selectedPond = null;
      state.selectedProblems = [];
      state.selectedSeverity = null;
      state.evidenceCount = 0;
      state.locationCollected = false;
      document.getElementById('pondSearch').value = '';
      document.getElementById('descriptionInput').value = '';
      document.getElementById('photoUpload').value = '';
      document.getElementById('videoUpload').value = '';
      document.getElementById('selectedPondPreview').classList.add('hidden');
      document.querySelectorAll('.severity-box').forEach(box => box.classList.remove('active'));
      document.querySelectorAll('.problem-card').forEach(box => box.classList.remove('active'));
      document.getElementById('locationStatus').textContent = 'Location not collected yet.';
      renderStep();
    }

    function renderRecentReports() {
      const reportList = document.getElementById('recentReports');
      const summaryReports = document.getElementById('summaryReports');
      const summaryPending = document.getElementById('summaryPending');
      const summaryResolved = document.getElementById('summaryResolved');
      reportList.innerHTML = mockReports.slice(0, 4).map(r => `
        <div class="report-item">
          <div>
            <div><strong>${r.id}</strong></div>
            <div class="tiny">${r.pond} • ${r.issue}</div>
            <div class="tiny">${r.date}</div>
          </div>
          <span class="badge ${statusClass(r.status)}">${statusText(r.status)}</span>
        </div>
      `).join('');
      summaryReports.textContent = mockReports.length;
      summaryPending.textContent = mockReports.filter(r => r.status === 'pending' || r.status === 'review' || r.status === 'progress').length;
      summaryResolved.textContent = mockReports.filter(r => r.status === 'resolved').length;
    }

    function statusClass(key) {
      if (key === 'pending') return 'pending';
      if (key === 'review') return 'review';
      if (key === 'progress') return 'progress';
      if (key === 'resolved') return 'resolved';
      if (key === 'rejected') return 'rejected';
      return 'pending';
    }

    function statusText(key) {
      if (key === 'pending') return '🟡 Pending Verification';
      if (key === 'review') return '🔵 Under Review';
      if (key === 'progress') return '🟠 Action in Progress';
      if (key === 'resolved') return '🟢 Resolved';
      if (key === 'rejected') return '🔴 Rejected';
      return '🟡 Pending Verification';
    }

    document.getElementById('showLoginBtn').addEventListener('click', () => { showScreen('auth'); });
    document.getElementById('demoDashBtn').addEventListener('click', () => {
      state.loggedIn = true;
      state.userName = 'Demo User';
      document.getElementById('userNameLabel').textContent = state.userName;
      showScreen('dashboard');
    });
    document.getElementById('backHomeBtn').addEventListener('click', () => showScreen('home'));

    document.getElementById('loginBtn').addEventListener('click', () => {
      const name = document.getElementById('nameInput').value.trim();
      const phone = document.getElementById('phoneInput').value.trim();
      if (!name || !phone) {
        alert('Please enter your name and mobile number to continue.');
        return;
      }
      state.loggedIn = true;
      state.userName = name;
      document.getElementById('userNameLabel').textContent = state.userName;
      showScreen('dashboard');
    });

    document.getElementById('reportPrimaryBtn').addEventListener('click', () => {
      if (!state.loggedIn) {
        alert('Please login or register first.');
        showScreen('auth');
        return;
      }
      state.currentStep = 1;
      renderStep();
      showScreen('reportFlow');
    });

    document.getElementById('prevStepBtn').addEventListener('click', prevStep);
    document.getElementById('nextStepBtn').addEventListener('click', nextStep);
    document.getElementById('trackBtn').addEventListener('click', () => { showScreen('dashboard'); });
    document.getElementById('anotherReportBtn').addEventListener('click', () => { showScreen('reportFlow'); resetForm(); });
    document.getElementById('dashboardBtn').addEventListener('click', () => { showScreen('dashboard'); });

    document.getElementById('pondSearch').addEventListener('input', (e) => renderSearchResults(e.target.value));

    document.querySelectorAll('[data-select-type]').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.selectType;
        document.querySelectorAll('[data-select-type]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        document.getElementById('searchArea').classList.toggle('hidden', type !== 'search');
        document.getElementById('locationArea').classList.toggle('hidden', type !== 'location');
        document.getElementById('mapArea').classList.toggle('hidden', type !== 'map');
      });
    });

    document.getElementById('getLocationBtn').addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const nearest = pondData[0];
          document.getElementById('nearbyPond').textContent = `${nearest.name}, ${nearest.district}`;
          selectPond(nearest);
          document.getElementById('locationStatus').textContent = `Location collected: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          state.locationCollected = true;
        }, () => {
          document.getElementById('locationStatus').textContent = 'Location permission denied. You can still continue.';
        });
      } else {
        document.getElementById('locationStatus').textContent = 'Geolocation is not supported by this browser.';
      }
    });

    document.getElementById('collectLocationBtn').addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          document.getElementById('locationStatus').textContent = `Location collected: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          state.locationCollected = true;
        }, () => {
          document.getElementById('locationStatus').textContent = 'Location permission denied. Please continue with the report.';
        });
      } else {
        document.getElementById('locationStatus').textContent = 'Geolocation unavailable in this browser.';
      }
    });

    document.getElementById('cameraBtn').addEventListener('click', () => {
      document.getElementById('photoUpload').click();
    });

    document.getElementById('photoUpload').addEventListener('change', (e) => {
      state.evidenceCount += e.target.files.length;
      document.getElementById('reviewEvidence').textContent = `${state.evidenceCount} files uploaded`;
      document.getElementById('step3Error').textContent = '';
    });

    document.getElementById('videoUpload').addEventListener('change', (e) => {
      if (e.target.files.length) {
        state.evidenceCount += 1;
        document.getElementById('reviewEvidence').textContent = `${state.evidenceCount} files uploaded`;
        document.getElementById('step3Error').textContent = '';
      }
    });

    document.querySelectorAll('.severity-box').forEach(box => {
      box.addEventListener('click', () => {
        state.selectedSeverity = box.dataset.severity;
        document.querySelectorAll('.severity-box').forEach(b => b.classList.remove('active'));
        box.classList.add('active');
        document.getElementById('reviewSeverity').textContent = state.selectedSeverity;
        document.getElementById('step2Error').textContent = '';
      });
    });

    document.getElementById('selectMapCard').addEventListener('click', () => {
      document.getElementById('mapArea').classList.remove('hidden');
      const districtButton = document.querySelector('#districtMap button');
      if (districtButton) {
        districtButton.classList.add('active');
      }
    });

    document.getElementById('locationInput').addEventListener('input', refreshCustomLocationPreview);
    document.getElementById('pondInput').addEventListener('input', refreshCustomLocationPreview);

    renderStep();
    renderProblemCards();
    renderRecentReports();
    renderSearchResults('');
    renderDistrictMap();
  