const STORAGE_KEY = "faisal-meet-appointments";
const OWNER_ACCESS_CODE = "LEE-REEM LEE-GON";

const defaultAppointments = [
  {
    id: "FA-100101-221",
    name: "Ayesha Khan",
    email: "ayesha@example.com",
    phone: "+92 300 1234567",
    person: "Faisal",
    service: "Business",
    date: "2026-10-08",
    time: "10:30",
    status: "Pending"
  },
  {
    id: "FA-100102-512",
    name: "Usman Ali",
    email: "usman@example.com",
    phone: "+92 333 7654321",
    person: "Faisal",
    service: "Partnership",
    date: "2026-10-09",
    time: "15:00",
    status: "Confirmed"
  }
];

const pageType = document.body.dataset.page || "booking";
const form = document.getElementById("appointmentForm");
const todayDate = document.getElementById("todayDate");
const ownerCodeInput = document.getElementById("ownerCode");
const ownerAccessBtn = document.getElementById("ownerAccessBtn");
const ownerStatus = document.getElementById("ownerStatus");
const ownerDashboard = document.getElementById("ownerDashboard");
const ownerList = document.getElementById("ownerAppointmentList");
const totalRequestsEl = document.getElementById("totalRequests");
const confirmedTotalEl = document.getElementById("confirmedTotal");
const pendingTotalEl = document.getElementById("pendingTotal");
const modal = document.getElementById("confirmationModal");
const closeModalBtn = document.getElementById("closeModal");
const appointmentIdValue = document.getElementById("appointmentIdValue");
const appointmentSummary = document.getElementById("appointmentSummary");

let appointments = loadAppointments();
let ownerLoggedIn = false;
let modalReturnFocus = null;

function generateAppointmentId() {
  return `FA-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
}

function loadAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultAppointments;
  } catch (error) {
    return defaultAppointments;
  }
}

function saveAppointments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

function getStatusClass(status) {
  const normalized = (status || "Pending").toLowerCase();
  if (normalized === "confirmed") return "status-confirmed";
  if (normalized === "rejected") return "status-rejected";
  return "status-pending";
}

function setTodayDate() {
  if (!todayDate) return;

  const current = new Date();
  todayDate.textContent = current.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function showConfirmationModal(appointment) {
  if (!modal) return;

  modalReturnFocus = document.activeElement;
  appointmentIdValue.textContent = appointment.id;
  appointmentSummary.textContent = `${appointment.name} • ${appointment.service} • ${formatDate(appointment.date)} at ${formatTime(appointment.time)}`;
  modal.classList.remove("hidden");
  closeModalBtn.focus();
}

function closeConfirmationModal() {
  if (!modal) return;
  modal.classList.add("hidden");
  if (modalReturnFocus instanceof HTMLElement) modalReturnFocus.focus();
  modalReturnFocus = null;
}

function setMinimumAppointmentDate() {
  const dateInput = document.getElementById("date");
  if (!dateInput) return;

  const currentDate = new Date();
  const localDate = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  dateInput.min = localDate;
}

function renderOwnerAppointments() {
  if (!ownerDashboard || !ownerList) return;

  if (!ownerLoggedIn) {
    ownerDashboard.classList.add("hidden");
    return;
  }

  ownerDashboard.classList.remove("hidden");

  if (!appointments.length) {
    ownerList.innerHTML = '<p class="empty-state">No appointment requests found.</p>';
    totalRequestsEl.textContent = "0";
    confirmedTotalEl.textContent = "0";
    pendingTotalEl.textContent = "0";
    return;
  }

  const confirmedCount = appointments.filter((appointment) => appointment.status === "Confirmed").length;
  const pendingCount = appointments.filter((appointment) => appointment.status !== "Confirmed" && appointment.status !== "Rejected").length;

  totalRequestsEl.textContent = String(appointments.length);
  confirmedTotalEl.textContent = String(confirmedCount);
  pendingTotalEl.textContent = String(pendingCount);

  ownerList.innerHTML = appointments
    .map(
      (appointment) => `
        <article class="appointment-card">
          <div class="appointment-top">
            <div>
              <h4 class="appointment-name">${appointment.name}</h4>
            </div>
            <span class="status-pill ${getStatusClass(appointment.status)}">${appointment.status || "Pending"}</span>
          </div>
          <div class="appointment-meta">
            <span><strong>Appointment ID:</strong> ${appointment.id}</span>
            <span><strong>Person to Meet:</strong> ${appointment.person}</span>
            <span><strong>Reason:</strong> ${appointment.service}</span>
            <span><strong>When:</strong> ${formatDate(appointment.date)} at ${formatTime(appointment.time)}</span>
            <span><strong>Email:</strong> ${appointment.email}</span>
            <span><strong>Phone:</strong> ${appointment.phone}</span>
          </div>
          <div class="owner-actions">
            <button class="confirm-btn" data-action="confirm" data-id="${appointment.id}">Confirm</button>
            <button class="reject-btn" data-action="reject" data-id="${appointment.id}">Reject</button>
            <button class="delete-btn" data-action="delete" data-id="${appointment.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const buttonId = event.currentTarget.dataset.id;
      const action = event.currentTarget.dataset.action;

      if (action === "confirm") {
        appointments = appointments.map((appointment) =>
          appointment.id === buttonId ? { ...appointment, status: "Confirmed" } : appointment
        );
      }

      if (action === "reject") {
        appointments = appointments.map((appointment) =>
          appointment.id === buttonId ? { ...appointment, status: "Rejected" } : appointment
        );
      }

      if (action === "delete") {
        appointments = appointments.filter((appointment) => appointment.id !== buttonId);
      }

      saveAppointments();
      renderOwnerAppointments();
    });
  });
}

if (pageType === "booking") {
  const formNode = document.getElementById("appointmentForm");
  setMinimumAppointmentDate();

  if (formNode) {
    formNode.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(formNode);
      const appointment = {
        id: generateAppointmentId(),
        name: formData.get("name").toString().trim(),
        email: formData.get("email").toString().trim(),
        phone: formData.get("phone").toString().trim(),
        person: "Faisal",
        service: formData.get("service").toString(),
        date: formData.get("date").toString(),
        time: formData.get("time").toString(),
        status: "Pending"
      };

      if (!appointment.name || !appointment.email || !appointment.phone || !appointment.service || !appointment.date || !appointment.time) {
        alert("Please complete all required fields before booking.");
        return;
      }

      appointments.unshift(appointment);
      saveAppointments();
      showConfirmationModal(appointment);
      formNode.reset();
      const personField = document.getElementById("person");
      if (personField) personField.value = "Faisal";
    });
  }

  const modalClose = document.getElementById("closeModal");
  if (modalClose) modalClose.addEventListener("click", closeConfirmationModal);
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeConfirmationModal();
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      closeConfirmationModal();
    }
  });
}

if (pageType === "owner") {
  ownerAccessBtn.addEventListener("click", () => {
    const enteredCode = ownerCodeInput.value.trim();

    if (enteredCode === OWNER_ACCESS_CODE) {
      ownerLoggedIn = true;
      ownerStatus.textContent = "Owner access granted. Dashboard is open.";
      ownerStatus.style.color = "var(--success)";
      renderOwnerAppointments();
      return;
    }

    ownerLoggedIn = false;
    ownerStatus.textContent = "Invalid access code. Please use the correct owner code.";
    ownerStatus.style.color = "var(--danger)";
    ownerDashboard.classList.add("hidden");
  });
}

setTodayDate();
renderOwnerAppointments();
