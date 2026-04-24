// Fetch and display commands
async function loadCommands() {
  try {
    const response = await fetch("/api/commands");
    const commands = await response.json();

    const grid = document.getElementById("commandsGrid");
    grid.innerHTML = "";

    commands.forEach((cmd) => {
      const card = createCommandCard(cmd);
      grid.appendChild(card);
    });
  } catch (error) {
    showFeedback("Failed to load commands", false);
  }
}

// Create command card element
function createCommandCard(cmd) {
  const card = document.createElement("div");
  card.className = "command-card";
  card.innerHTML = `
    <span class="command-icon">${cmd.icon || "⚙️"}</span>
    <span class="command-name">${cmd.name}</span>
    <span class="command-description">${cmd.description}</span>
  `;

  card.addEventListener("click", () => executeCommand(cmd.name, card));
  return card;
}

// Execute command
async function executeCommand(commandName, card) {
  if (card.classList.contains("loading")) return;

  card.classList.add("loading", "executing");

  try {
    const response = await fetch(`/api/command/${commandName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const result = await response.json();

    if (result.success) {
      showFeedback(result.message, true);
      if (commandName === "status") {
        updateStatusPanel(result.data);
      }
    } else {
      showFeedback(result.message, false);
    }
  } catch (error) {
    showFeedback("Command execution failed", false);
  } finally {
    card.classList.remove("loading", "executing");
  }
}

// Show feedback message
function showFeedback(message, success) {
  const section = document.getElementById("feedbackSection");
  const messageEl = document.getElementById("feedbackMessage");
  const iconEl = document.getElementById("feedbackIcon");
  const timeEl = document.getElementById("feedbackTime");

  messageEl.textContent = message;
  messageEl.className = success ? "feedback-success" : "feedback-error";
  iconEl.textContent = success ? "✓" : "✗";
  iconEl.style.color = success ? "#00ff00" : "#ff0055";

  const now = new Date();
  timeEl.textContent = `${now.toLocaleTimeString()}`;

  section.style.display = "block";

  setTimeout(() => {
    section.style.display = "none";
  }, 5000);
}

// Update status panel
function updateStatusPanel(data) {
  if (data) {
    document.getElementById("hostname").textContent = data.hostname || "--";
    document.getElementById("uptime").textContent = data.uptime || "--";
    document.getElementById("cpus").textContent = data.cpus || "--";
    document.getElementById("memory").textContent =
      `${data.freeMemory} / ${data.totalMemory}` || "--";
  }
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  loadCommands();
  // Refresh status every 30 seconds
  setInterval(() => executeCommand("status", { classList: { add: () => {}, remove: () => {} } }), 30000);
});
