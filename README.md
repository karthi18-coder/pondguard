   PondGuardian

Guarding Every Drop of Life 💧

PondGuardian is a web-based platform designed to help communities report, monitor, and track issues affecting ponds and other water bodies. The system connects citizens with administrators so that environmental problems can be reported and followed up efficiently.

---

🚀 Features

- 👤 User Registration & Login
  
  - Secure account creation and authentication
  - Firebase Authentication integration

- 📍 Pond & Location Reporting
  
  - Select the affected pond/location
  - Enter district, taluk, and area details
  - Submit environmental complaints

- 📸 Evidence Upload
  
  - Upload images/videos as evidence
  - Preview uploaded evidence before submission
  - Evidence stored using Firebase Storage

- 📊 Report Tracking
  
  - Each report receives a unique Report ID
  - Track pending and rectified complaints
  - Store report information in Cloud Firestore

- 🛠️ Admin Dashboard
  
  - View submitted reports
  - Monitor pending and resolved issues
  - Manage and track reported pond problems
  - Dashboard statistics for easier monitoring

- 🌿 Environment-Focused UI
  
  - Clean and responsive interface
  - Green/environment-themed design
  - Mobile-friendly layout

---

🏗️ System Architecture

                ┌──────────────────────┐
                │      User / Citizen  │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   PondGuardian Web   │
                │     Application      │
                └──────────┬───────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       Authentication   Firestore    Storage
              │            │            │
              └────────────┼────────────┘
                           ▼
                ┌──────────────────────┐
                │   Admin Dashboard    │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Report Monitoring &  │
                │    Resolution        │
                └──────────────────────┘

---

🛠️ Technologies Used

Frontend

- HTML5
- CSS3
- JavaScript
- Tailwind CSS

Backend / Cloud

- Firebase Authentication
- Cloud Firestore
- Firebase Storage

Deployment

- GitHub Pages

---

📂 Project Structure

PondGuardian/
│
├── index.html
├── login.html
├── signup.html
├── report.html
├── pondguardian_admin_dashboard.html
│
├── login.js
├── report.js
│
├── css/
│   └── styles.css
│
├── js/
│   └── scripts.js
│
└── README.md

---

🔄 How It Works

1. User Registration

Users create an account and log in to PondGuardian.

2. Submit a Report

The user selects the relevant location and provides information about the pond issue.

3. Upload Evidence

The user can attach photographs or videos to support the complaint.

4. Report Storage

The report details are stored in Cloud Firestore, while uploaded evidence is stored in Firebase Storage.

5. Admin Monitoring

Administrators can access the dashboard and view submitted complaints.

6. Issue Resolution

Reports can be monitored based on their status, such as Pending or Rectified.

---

🎯 Problem Statement

Ponds and local water bodies can suffer from problems such as:

- Waste dumping
- Water pollution
- Encroachment
- Poor maintenance
- Sewage contamination
- Damaged surroundings

Many such issues may go unnoticed or remain unresolved because there is no simple way for citizens to report and track them.

PondGuardian provides a centralized digital platform for reporting and monitoring these issues.

---

💡 Proposed Solution

PondGuardian enables citizens to:

«Report → Provide Evidence → Track → Monitor Resolution»

This creates a digital connection between the community and administrators, making pond-related issues easier to identify and monitor.

---

🔐 Firebase Integration

PondGuardian uses Firebase for its backend services:

Firebase Service| Purpose
Firebase Authentication| User login & registration
Cloud Firestore| Report & user data
Firebase Storage| Image/video evidence

---

📊 Admin Dashboard

The administrator dashboard provides an overview of submitted reports and helps administrators monitor:

- Total reports
- Pending reports
- Rectified reports
- Report details
- Uploaded evidence
- Location information


- 🗺️ Interactive pond maps
- 📍 GPS-based location detection
- 🔔 Notifications for report updates
- 🤖 AI-based image analysis
- 📈 Advanced environmental analytics
- 🏛️ Integration with government/local-body systems
- 📱 Dedicated Android application
- 🌐 Multi-language support including Tamil

---

👨‍💻 Project

PondGuardian — Pond Rejuvenation at Scale

Built as an environmental technology project to encourage community participation in protecting and rejuvenating local water bodies.

🌱 Mission

«Guarding every drop of life.»

---

📜 License

This project is developed for educational, environmental, and hackathon purposes.
