document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";
        activityCard.dataset.activityName = name;

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p class="activity-availability" data-max-participants="${details.max_participants}">
            <strong>Availability:</strong> ${spotsLeft} spots left
          </p>
        `;

        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeading = document.createElement("h5");
        participantsHeading.className = "participants-heading";
        participantsHeading.textContent = `Participants (${details.participants.length})`;

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";
        participantsList.dataset.participants = "";

        if (details.participants.length === 0) {
          const emptyMessage = document.createElement("li");
          emptyMessage.className = "participants-empty";
          emptyMessage.textContent = "No participants yet";
          participantsList.appendChild(emptyMessage);
        } else {
          details.participants.forEach((participant) => {
            const participantItem = document.createElement("li");
            participantItem.textContent = participant;
            participantsList.appendChild(participantItem);
          });
        }

        participantsSection.append(participantsHeading, participantsList);
        activityCard.appendChild(participantsSection);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        const activityCard = [...activitiesList.querySelectorAll(".activity-card")]
          .find((card) => card.dataset.activityName === activity);
        const participantsList = activityCard?.querySelector("[data-participants]");
        const participantsHeading = activityCard?.querySelector(".participants-heading");
        const availability = activityCard?.querySelector(".activity-availability");

        if (participantsList && participantsHeading && availability) {
          participantsList.querySelector(".participants-empty")?.remove();
          const participantItem = document.createElement("li");
          participantItem.textContent = email;
          participantsList.appendChild(participantItem);
          participantsHeading.textContent = `Participants (${participantsList.children.length})`;

          const maxParticipants = Number(availability.dataset.maxParticipants);
          const spotsLeft = maxParticipants - participantsList.children.length;
          const availabilityLabel = document.createElement("strong");
          availabilityLabel.textContent = "Availability:";
          availability.replaceChildren(availabilityLabel, ` ${spotsLeft} spots left`);
        }

        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
