import { auth, db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const $ = (id) => document.getElementById(id);

let allReports = [];
let currentReports = [];
let unsubscribeReports = null;


const els = {
  table: $("reportsTableBody"),

  total: $("totalReports"),
  pending: $("pendingReports"),
  progress: $("progressReports"),
  rectified: $("rectifiedReports"),

  resolution: $("resolutionRate"),

  pendingPercent: $("pendingPercent"),
  progressPercent: $("progressPercent"),
  rectifiedPercent: $("rectifiedPercent"),

  pendingBar: $("pendingBar"),
  progressBar: $("progressBar"),
  rectifiedBar: $("rectifiedBar"),

  resultCount: $("resultCount"),
  lastUpdated: $("lastUpdated"),

  search: $("searchInput"),
  status: $("statusFilter"),
  water: $("waterFilter"),

  activity: $("activityList"),
  topLocations: $("topLocations"),
  commonIssues: $("commonIssues")
};


function escapeHTML(value) {

  return String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function getDate(report) {

  try {

    if (report.createdAt?.toDate) {
      return report.createdAt.toDate();
    }

    if (report.createdAt?.seconds) {
      return new Date(report.createdAt.seconds * 1000);
    }

    if (report.createdAt) {
      return new Date(report.createdAt);
    }

  } catch (_) {}

  return null;
}


function formatDate(report) {

  const date = getDate(report);

  return date
    ? date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "-";
}


function formatDateTime(report) {

  const date = getDate(report);

  return date
    ? date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "-";
}


function reportId(id) {

  return "#PG-" + id.slice(0, 6).toUpperCase();

}


function statusClass(status) {

  if (status === "Rectified") {
    return "done";
  }

  if (status === "In Progress") {
    return "progress";
  }

  return "pending";
}


function showToast(message) {

  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);

}


function updateCounters(reports) {

  const total = reports.length;

  const pending =
    reports.filter(
      r => (r.status || "Pending") === "Pending"
    ).length;

  const progress =
    reports.filter(
      r => r.status === "In Progress"
    ).length;

  const rectified =
    reports.filter(
      r => r.status === "Rectified"
    ).length;


  els.total.textContent = total;

  els.pending.textContent = pending;

  els.progress.textContent = progress;

  els.rectified.textContent = rectified;


  const rate =
    total
      ? Math.round((rectified / total) * 100)
      : 0;

  els.resolution.textContent = `${rate}%`;


  const p1 =
    total
      ? Math.round((pending / total) * 100)
      : 0;

  const p2 =
    total
      ? Math.round((progress / total) * 100)
      : 0;

  const p3 =
    total
      ? Math.round((rectified / total) * 100)
      : 0;


  els.pendingPercent.textContent = `${p1}%`;

  els.progressPercent.textContent = `${p2}%`;

  els.rectifiedPercent.textContent = `${p3}%`;


  els.pendingBar.style.width = `${p1}%`;

  els.progressBar.style.width = `${p2}%`;

  els.rectifiedBar.style.width = `${p3}%`;


  $("navAll").textContent = total;

  $("navPending").textContent = pending;

  $("navProgress").textContent = progress;

  $("navRectified").textContent = rectified;


  const types = {
    Pond: 0,
    Lake: 0,
    Dam: 0,
    River: 0,
    Other: 0
  };


  reports.forEach(r => {

    const type =
      r.waterBodyType || "Other";

    if (types[type] !== undefined) {
      types[type]++;
    } else {
      types.Other++;
    }

  });


  $("pondCount").textContent = types.Pond;

  $("lakeCount").textContent = types.Lake;

  $("damCount").textContent = types.Dam;

  $("riverCount").textContent = types.River;

  $("otherCount").textContent = types.Other;

}


function renderTable() {

  const search =
    els.search.value.trim().toLowerCase();

  const status =
    els.status.value;

  const water =
    els.water.value;


  currentReports =
    allReports.filter(r => {

      const reportStatus =
        r.data.status || "Pending";


      const haystack = [

        r.data.district,

        r.data.taluk,

        r.data.area,

        r.data.waterBodyType,

        r.data.issueDescription,

        r.data.email,

        r.data.mobile,

        r.data.userId

      ]
      .join(" ")
      .toLowerCase();


      return (

        (!search ||
          haystack.includes(search))

        &&

        (
          status === "all" ||
          reportStatus === status
        )

        &&

        (
          water === "all" ||
          (r.data.waterBodyType || "Other") === water
        )

      );

    });


  els.resultCount.textContent =
    `${currentReports.length} report${
      currentReports.length === 1
        ? ""
        : "s"
    }`;


  if (!currentReports.length) {

    els.table.innerHTML = `
      <tr>
        <td colspan="7" class="loading-cell">
          No reports found for the current filters.
        </td>
      </tr>
    `;

    return;
  }


  els.table.innerHTML =
    currentReports.map(({ id, data }) => {

      const location =
        [
          data.area,
          data.taluk,
          data.district
        ]
        .filter(Boolean)
        .join(", ");


      const issue =
        data.issueDescription ||
        "No description";


      const shortIssue =
        issue.length > 38
          ? issue.slice(0, 38) + "…"
          : issue;


      const statusValue =
        data.status || "Pending";


      return `
        <tr>

          <td>
            <strong>
              ${escapeHTML(reportId(id))}
            </strong>
          </td>

          <td>
            ${escapeHTML(location || "-")}
          </td>

          <td>
            ${escapeHTML(
              data.waterBodyType || "-"
            )}
          </td>

          <td title="${escapeHTML(issue)}">
            ${escapeHTML(shortIssue)}
          </td>

          <td>
            ${escapeHTML(formatDate(data))}
          </td>

          <td>
            <span class="status ${statusClass(statusValue)}">
              ${escapeHTML(statusValue)}
            </span>
          </td>

          <td>
            <button
              class="action-btn"
              data-view="${escapeHTML(id)}">
              View
            </button>
          </td>

        </tr>
      `;

    }).join("");


  els.table
    .querySelectorAll("[data-view]")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        const item =
          allReports.find(
            x => x.id === btn.dataset.view
          );

        if (item) {

          openReportModal(
            item.id,
            item.data
          );

        }

      });

    });

      }
function renderAnalytics(reports) {

  const locationMap = {};
  const issueMap = {};

  reports.forEach(report => {

    const data = report.data;

    const location =
      data.district ||
      "Unknown";

    locationMap[location] =
      (locationMap[location] || 0) + 1;


    const issue =
      data.issueDescription ||
      "Other issue";

    const words =
      issue
        .trim()
        .split(/\s+/)
        .slice(0, 4)
        .join(" ");

    const issueKey =
      words || "Other issue";

    issueMap[issueKey] =
      (issueMap[issueKey] || 0) + 1;

  });


  const locations =
    Object.entries(locationMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);


  const issues =
    Object.entries(issueMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);


  if (els.topLocations) {

    if (!locations.length) {

      els.topLocations.innerHTML = `
        <div class="analytics-empty">
          Waiting for report data...
        </div>
      `;

    } else {

      const max =
        locations[0][1];

      els.topLocations.innerHTML =
        locations.map(([name, count]) => {

          const width =
            Math.max(
              8,
              Math.round(
                (count / max) * 100
              )
            );

          return `
            <div class="analytics-row">

              <div class="analytics-label">
                <span>
                  ${escapeHTML(name)}
                </span>

                <strong>
                  ${count}
                </strong>
              </div>

              <div class="analytics-bar">
                <span
                  style="width:${width}%">
                </span>
              </div>

            </div>
          `;

        }).join("");

    }

  }


  if (els.commonIssues) {

    if (!issues.length) {

      els.commonIssues.innerHTML = `
        <div class="analytics-empty">
          Waiting for report data...
        </div>
      `;

    } else {

      const max =
        issues[0][1];

      els.commonIssues.innerHTML =
        issues.map(([name, count]) => {

          const width =
            Math.max(
              8,
              Math.round(
                (count / max) * 100
              )
            );

          return `
            <div class="analytics-row">

              <div class="analytics-label">

                <span
                  title="${escapeHTML(name)}">

                  ${escapeHTML(name)}

                </span>

                <strong>
                  ${count}
                </strong>

              </div>

              <div class="analytics-bar issue-bar">

                <span
                  style="width:${width}%">
                </span>

              </div>

            </div>
          `;

        }).join("");

    }

  }

}


function renderActivity(reports) {

  if (!els.activity) {
    return;
  }


  const recent =
    [...reports]
      .sort((a, b) => {

        const dateA =
          getDate(a.data)?.getTime() || 0;

        const dateB =
          getDate(b.data)?.getTime() || 0;

        return dateB - dateA;

      })
      .slice(0, 6);


  if (!recent.length) {

    els.activity.innerHTML = `
      <div class="analytics-empty">
        Waiting for report data...
      </div>
    `;

    return;
  }


  els.activity.innerHTML =
    recent.map(({ id, data }) => {

      const status =
        data.status || "Pending";

      const location =
        [
          data.area,
          data.taluk,
          data.district
        ]
        .filter(Boolean)
        .join(", ");


      let icon = "📋";

      if (status === "Pending") {
        icon = "⏳";
      }

      if (status === "In Progress") {
        icon = "🔄";
      }

      if (status === "Rectified") {
        icon = "✓";
      }


      return `
        <div class="activity-item">

          <div class="activity-icon">
            ${icon}
          </div>

          <div class="activity-content">

            <strong>
              ${escapeHTML(
                reportId(id)
              )}
            </strong>

            <span>
              ${escapeHTML(
                location || "Location unavailable"
              )}
            </span>

            <small>
              ${escapeHTML(
                formatDateTime(data)
              )}
            </small>

          </div>

          <span
            class="status ${statusClass(status)}">

            ${escapeHTML(status)}

          </span>

        </div>
      `;

    }).join("");

}


function openReportModal(id, data) {

  const modal =
    $("reportModal");

  if (!modal) {
    console.error(
      "Report modal not found."
    );
    return;
  }


  const location =
    [
      data.area,
      data.taluk,
      data.district
    ]
    .filter(Boolean)
    .join(", ");


  const evidence =
    Array.isArray(data.evidence)
      ? data.evidence
      : [];


  $("modalReportId").textContent =
    reportId(id);


  $("modalStatus").innerHTML = `
    <span class="status ${statusClass(
      data.status || "Pending"
    )}">
      ${escapeHTML(
        data.status || "Pending"
      )}
    </span>
  `;


  $("modalLocation").textContent =
    location || "-";


  $("modalWaterType").textContent =
    data.waterBodyType || "-";


  $("modalIssue").textContent =
    data.issueDescription || "-";


  $("modalMobile").textContent =
    data.mobile || "-";


  $("modalEmail").textContent =
    data.email || "-";


  $("modalDate").textContent =
    formatDateTime(data);


  const evidenceContainer =
    $("modalEvidence");


  if (evidenceContainer) {

    if (!evidence.length) {

      evidenceContainer.innerHTML = `
        <div class="no-evidence">
          No evidence uploaded.
        </div>
      `;

    } else {

      evidenceContainer.innerHTML =
        evidence.map(item => {

          const url =
            item.url || "";

          const type =
            item.type || "";


          if (type.startsWith("video/")) {

            return `
              <div class="evidence-item">

                <video
                  src="${escapeHTML(url)}"
                  controls
                  preload="metadata">
                </video>

              </div>
            `;

          }


          return `
            <a
              href="${escapeHTML(url)}"
              target="_blank"
              rel="noopener"
              class="evidence-item">

              <img
                src="${escapeHTML(url)}"
                alt="Report evidence"
                loading="lazy">

            </a>
          `;

        }).join("");

    }

  }


  modal.classList.add("open");

  document.body.classList.add(
    "modal-open"
  );

}


function closeReportModal() {

  const modal =
    $("reportModal");

  if (!modal) return;

  modal.classList.remove("open");

  document.body.classList.remove(
    "modal-open"
  );

}


function setupModal() {

  const close =
    $("closeReportModal");

  if (close) {

    close.addEventListener(
      "click",
      closeReportModal
    );

  }


  const modal =
    $("reportModal");

  if (modal) {

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {

          closeReportModal();

        }

      }
    );

  }


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        closeReportModal();

      }

    }
  );

}


function setupFilters() {

  if (els.search) {

    els.search.addEventListener(
      "input",
      renderTable
    );

  }


  if (els.status) {

    els.status.addEventListener(
      "change",
      renderTable
    );

  }


  if (els.water) {

    els.water.addEventListener(
      "change",
      renderTable
    );

  }


  const clear =
    $("clearFilters");

  if (clear) {

    clear.addEventListener(
      "click",
      () => {

        els.search.value = "";

        els.status.value = "all";

        els.water.value = "all";

        renderTable();

      }
    );

  }

}


function setupNavigation() {

  const links =
    document.querySelectorAll(
      ".nav-link"
    );


  links.forEach(link => {

    link.addEventListener(
      "click",
      event => {

        event.preventDefault();


        links.forEach(item => {

          item.classList.remove(
            "active"
          );

        });


        link.classList.add(
          "active"
        );


        const section =
          link.dataset.section;


        if (
          section === "all"
        ) {

          els.search.value = "";

          els.status.value = "all";

          els.water.value = "all";

          renderTable();

        }


        if (
          section === "pending"
        ) {

          els.status.value =
            "Pending";

          renderTable();

        }


        if (
          section === "progress"
        ) {

          els.status.value =
            "In Progress";

          renderTable();

        }


        if (
          section === "rectified"
        ) {

          els.status.value =
            "Rectified";

          renderTable();

        }


        const table =
          $("reportsSection");

        if (table) {

          table.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }

      }
    );

  });

}


function exportCSV() {

  if (!allReports.length) {

    showToast(
      "No report data available to export."
    );

    return;

  }


  const headers = [

    "Report ID",

    "District",

    "Taluk",

    "Area",

    "Water Body Type",

    "Issue",

    "Mobile",

    "Email",

    "Status",

    "Date"

  ];


  const rows =
    allReports.map(({ id, data }) => [

      reportId(id),

      data.district || "",

      data.taluk || "",

      data.area || "",

      data.waterBodyType || "",

      data.issueDescription || "",

      data.mobile || "",

      data.email || "",

      data.status || "Pending",

      formatDate(data)

    ]);


  const csv = [

    headers,

    ...rows

  ]
  .map(row =>
    row.map(value => {

      const text =
        String(value)
          .replaceAll('"', '""');

      return `"${text}"`;

    }).join(",")

  )
  .join("\n");


  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    `pondguardian_reports_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;


  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);


  showToast(
    "Report data exported successfully."
  );

}


function setupExport() {

  const button =
    $("exportReports");

  if (button) {

    button.addEventListener(
      "click",
      exportCSV
    );

  }

}


function updateLastUpdated() {

  if (!els.lastUpdated) {
    return;
  }


  els.lastUpdated.textContent =
    "Updated " +
    new Date().toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

          }
function setupMobileMenu() {

  const button =
    $("mobileMenuButton");

  const sidebar =
    $("sidebar");

  if (!button || !sidebar) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      sidebar.classList.toggle(
        "mobile-open"
      );

    }
  );


  document.addEventListener(
    "click",
    event => {

      if (
        window.innerWidth > 900
      ) {
        return;
      }


      if (
        !sidebar.contains(
          event.target
        ) &&
        !button.contains(
          event.target
        )
      ) {

        sidebar.classList.remove(
          "mobile-open"
        );

      }

    }
  );

}


function setupRefresh() {

  const button =
    $("refreshReports");

  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    async () => {

      button.disabled = true;

      button.classList.add(
        "loading"
      );


      try {

        await loadReportsOnce();

        showToast(
          "Dashboard refreshed."
        );

      } catch (error) {

        console.error(
          "Refresh error:",
          error
        );

        showToast(
          "Unable to refresh reports."
        );

      } finally {

        button.disabled = false;

        button.classList.remove(
          "loading"
        );

      }

    }
  );

}


async function loadReportsOnce() {

  const reportsRef =
    collection(
      db,
      "reports"
    );


  const reportsQuery =
    query(
      reportsRef,
      orderBy(
        "createdAt",
        "desc"
      )
    );


  const snapshot =
    await getDocs(
      reportsQuery
    );


  allReports =
    snapshot.docs.map(
      document => ({

        id: document.id,

        data: document.data()

      })
    );


  updateDashboard();

}


function updateDashboard() {

  updateCounters(
    allReports
  );

  renderTable();

  renderAnalytics(
    allReports
  );

  renderActivity(
    allReports
  );

  updateLastUpdated();

}


function startRealtimeReports() {

  if (unsubscribeReports) {

    unsubscribeReports();

    unsubscribeReports = null;

  }


  const reportsRef =
    collection(
      db,
      "reports"
    );


  const reportsQuery =
    query(
      reportsRef,
      orderBy(
        "createdAt",
        "desc"
      )
    );


  unsubscribeReports =
    onSnapshot(

      reportsQuery,

      snapshot => {

        allReports =
          snapshot.docs.map(
            document => ({

              id: document.id,

              data: document.data()

            })
          );


        updateDashboard();


        if (
          snapshot.metadata
            .hasPendingWrites
        ) {

          return;

        }


        updateLastUpdated();

      },

      error => {

        console.error(
          "Realtime report listener error:",
          error
        );


        if (els.table) {

          els.table.innerHTML = `
            <tr>
              <td
                colspan="7"
                class="loading-cell error-cell">

                Unable to load reports.

                <br>

                <small>
                  ${escapeHTML(
                    error.message
                  )}
                </small>

              </td>
            </tr>
          `;

        }


        showToast(
          "Unable to load Firebase reports."
        );

      }

    );

}


function setupAuthState() {

    auth.onAuthStateChanged(user => {

        console.log("========== PONDGUARDIAN AUTH DEBUG ==========");

        if (!user) {
            console.error("❌ NO FIREBASE USER LOGGED IN");

            alert("Firebase authentication failed. No user is signed in.");

            return;
        }

        console.log("✅ Firebase user authenticated");
        console.log("Email:", user.email);
        console.log("UID:", user.uid);
        console.log("Project:", "pondguardian-b4808");

        const adminEmail = $("adminEmail");

        if (adminEmail) {
            adminEmail.textContent = user.email || "Administrator";
        }
      console.log(
    "🔥 ADMIN UID USED BY DASHBOARD:",
    user.uid
);

        startRealtimeReports();
    });
}


function setupQuickActions() {

  const viewAll =
    $("viewAllReports");

  if (viewAll) {

    viewAll.addEventListener(
      "click",
      event => {

        event.preventDefault();


        if (els.search) {
          els.search.value = "";
        }

        if (els.status) {
          els.status.value = "all";
        }

        if (els.water) {
          els.water.value = "all";
        }


        renderTable();


        const section =
          $("reportsSection");

        if (section) {

          section.scrollIntoView({
            behavior: "smooth"
          });

        }

      }
    );

  }

}


function setupDateDisplay() {

  const dateElement =
    $("dashboardDate");

  if (!dateElement) {
    return;
  }


  dateElement.textContent =
    new Date().toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );

}


function setupLogout() {

  const logout =
    $("logoutButton");

  if (!logout) {
    return;
  }


  logout.addEventListener(
    "click",
    async () => {

      try {

        await auth.signOut();

        showToast(
          "Logged out successfully."
        );


        setTimeout(() => {

          window.location.href =
            "login.html";

        }, 800);


      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

        showToast(
          "Logout failed."
        );

      }

    }
  );

}


function setupTableSorting() {

  const headers =
    document.querySelectorAll(
      "#reportsTable thead th[data-sort]"
    );


  headers.forEach(header => {

    header.addEventListener(
      "click",
      () => {

        const key =
          header.dataset.sort;


        if (!key) {
          return;
        }


        allReports.sort(
          (a, b) => {

            let valueA =
              a.data[key] ?? "";

            let valueB =
              b.data[key] ?? "";


            if (
              key === "createdAt"
            ) {

              valueA =
                getDate(a.data)
                  ?.getTime() || 0;

              valueB =
                getDate(b.data)
                  ?.getTime() || 0;

            }


            return String(valueA)
              .localeCompare(
                String(valueB),
                undefined,
                {
                  numeric: true,
                  sensitivity: "base"
                }
              );

          }
        );


        renderTable();

      }
    );

  });

}


function initializeDashboard() {

  console.log(
    "🌿 PondGuardian Admin Dashboard initializing..."
  );


  setupFilters();

  setupModal();

  setupNavigation();

  setupExport();

  setupMobileMenu();

  setupRefresh();

  setupQuickActions();

  setupDateDisplay();

  setupLogout();

  setupTableSorting();

  setupAuthState();


  console.log(
    "✅ PondGuardian Admin Dashboard ready."
  );

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
  );

} else {

  initializeDashboard();

          }
