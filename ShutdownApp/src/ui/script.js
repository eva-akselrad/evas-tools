// State Management
let currentPendingCommand = null;
let currentPendingCard = null;
let isSystemUnlocked = false;
let globalPassword = null;

// Tab Switching Logic
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");

      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });
}

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

  card.addEventListener("click", () => handleCommandClick(cmd.name, card));
  return card;
}

// Handle Command Click (Password Protection Check)
function handleCommandClick(commandName, card) {
  if (commandName === "shutdown" || commandName === "restart") {
    currentPendingCommand = commandName;
    currentPendingCard = card;
    // Use stored password if already unlocked
    if (isSystemUnlocked && globalPassword) {
      executeCommand(commandName, card, globalPassword);
    } else {
      showPasswordModal();
    }
  } else {
    executeCommand(commandName, card);
  }
}

// Password Modal Logic
function showPasswordModal() {
  const modal = document.getElementById("passwordModal");
  const input = document.getElementById("systemPassword");
  modal.classList.add("active");
  input.value = "";
  input.focus();
}

function hidePasswordModal() {
  const modal = document.getElementById("passwordModal");
  modal.classList.remove("active");
  currentPendingCommand = null;
  currentPendingCard = null;
}

// Verify password for unlocking system tab
async function verifyAndUnlock(password) {
  try {
    const testResp = await fetch("/api/command/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
    });
    const result = await testResp.json();

    if (result.success || !result.message.includes("Unauthorized")) {
        globalPassword = password;
        isSystemUnlocked = true;
        
        // Dramatic Sequence
        hidePasswordModal();
        playDramaticTransition();
    } else {
        showFeedback("ACCESS_DENIED", false);
    }
  } catch (error) {
    showFeedback("Verification failed", false);
  }
}

function playDramaticTransition() {
    // 1. Create flash element
    const flash = document.createElement('div');
    flash.className = 'dramatic-flash';
    document.body.appendChild(flash);

    // 2. Slow theme change
    setTimeout(() => {
        document.body.classList.add('hacker-mode');
        // Matrix/Hacker Effect Trigger
        startHackerEffect();
        
        document.getElementById("system-lock-overlay").style.display = "none";
        document.getElementById("system-controls-content").style.display = "block";
        showFeedback("SYSTEM_OVERRIDE_SUCCESSFUL", true);
    }, 2000);

    // 3. Cleanup flash
    setTimeout(() => {
        flash.remove();
        document.body.style.overflow = 'auto';
    }, 5000);
}

function startHackerEffect() {
    document.body.classList.add('hacker-mode');
    const canvas = document.getElementById('hacker-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = latin + nums;

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const rainDrops = [];

    for (let x = 0; x < columns; x++) {
        rainDrops[x] = 1;
    }

    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

            if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    };

    setInterval(draw, 30);
    
    // Spaceship Terminal Simulation
    const terminal = document.createElement('div');
    terminal.className = 'spaceship-terminal glass';
    terminal.innerHTML = '<div id="terminal-text"></div>';
    document.getElementById('system-controls-content').prepend(terminal);
    
    const messages = [
        "> INITIALIZING SPACESHIP OVERRIDE...",
        "> LOADING MATRIX MODULES...",
        "> ACCESSING CORE SYSTEM COMMANDS...",
        "> TERMINAL_V1.2.0_ONLINE",
        "> READY FOR INPUT."
    ];
    
    let i = 0;
    const typeWriter = () => {
        if (i < messages.length) {
            document.getElementById('terminal-text').innerHTML += messages[i] + "<br>";
            i++;
            setTimeout(typeWriter, 500);
        }
    };
    typeWriter();
}

// Execute command
async function executeCommand(commandName, card, password = null) {
  if (card && card.classList.contains("loading")) return;

  if (card) card.classList.add("loading", "executing");

  try {
    const response = await fetch(`/api/command/${commandName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password || globalPassword }),
    });

    const result = await response.json();

    if (result.success) {
      showFeedback(result.message, true);
      if (commandName === "status") {
        updateStatusPanel(result.data);
      }
    } else {
      showFeedback(result.message, false);
      // If unauthorized, reset lock
      if (result.message.includes("Unauthorized")) {
          isSystemUnlocked = false;
          globalPassword = null;
          document.getElementById("system-lock-overlay").style.display = "flex";
          document.getElementById("system-controls-content").style.display = "none";
      }
    }
  } catch (error) {
    showFeedback("Command execution failed", false);
  } finally {
    if (card) card.classList.remove("loading", "executing");
    hidePasswordModal();
  }
}

// Torrent Search Logic
async function searchTorrents() {
  const query = document.getElementById("searchInput").value;
  const category = document.getElementById("categorySelect").value;
  const resultsList = document.getElementById("resultsList");
  const searchBtn = document.getElementById("searchBtn");

  if (!query) return;

  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";
  resultsList.innerHTML = '<div class="empty-state">Searching Jackett...</div>';

  try {
    const response = await fetch(`/api/torrents/search?q=${encodeURIComponent(query)}&category=${category}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }
    const results = await response.json();

    resultsList.innerHTML = "";

    if (results.length === 0) {
      resultsList.innerHTML = '<div class="empty-state">No results found</div>';
      return;
    }

    results.forEach((result, index) => {
      const card = createResultCard(result, index === 0, category);
      resultsList.appendChild(card);
    });
  } catch (error) {
    showFeedback("Search failed", false);
    resultsList.innerHTML = '<div class="empty-state">Error performing search</div>';
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
  }
}

function createResultCard(result, isSuggested, category) {
  const card = document.createElement("div");
  card.className = `result-card ${isSuggested ? "suggested" : ""}`;
  
  const sourceHtml = result.source && result.source !== "Unknown" ? `<span class="source">Source: ${result.source}</span>` : "";
  const uploaderHtml = result.uploader ? `<span class="uploader">By: ${result.uploader}</span>` : "";
  const seedersHtml = `<span class="seeders">Seeders: ${result.seeders !== undefined ? result.seeders : "N/A"}</span>`;

  card.innerHTML = `
    <div class="result-info">
      ${isSuggested ? '<span class="suggested-badge">Best Match</span>' : ""}
      <div class="result-title">${result.title}</div>
      <div class="result-meta">
        <span>Size: ${result.size}</span>
        ${seedersHtml}
        ${sourceHtml}
        ${uploaderHtml}
        ${result.description ? `<span class="description">${result.description}</span>` : ""}
      </div>
    </div>
    <div class="result-actions">
      <button type="button" class="glass-btn small download-btn">Download</button>
    </div>
  `;

  // Use the button specifically and prevent bubbling if needed
  const btn = card.querySelector(".download-btn");
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent card click
    downloadTorrent(result, category);
  });

  // Also allow clicking the card
  card.addEventListener("click", () => downloadTorrent(result, category));
  
  return card;
}

async function downloadTorrent(result, category) {
  showFeedback(`Initiating download for ${result.title}...`, true);
  
  try {
    const response = await fetch("/api/torrents/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        link: result.link, 
        title: result.title,
        category: category 
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      showFeedback(data.message, true);
    } else {
      showFeedback(data.message, false);
    }
  } catch (error) {
    showFeedback("Download request failed", false);
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
  initTabs();
  loadCommands();

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('Service Worker registered:', reg);
      }).catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
    });
  }

  // Search Listeners
  document.getElementById("searchBtn").addEventListener("click", searchTorrents);
  document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchTorrents();
  });

  // Unlock Button
  document.getElementById("unlockSystemBtn").addEventListener("click", () => {
    currentPendingCommand = "unlock";
    showPasswordModal();
  });

  // Modal Listeners
  document.getElementById("cancelBtn").addEventListener("click", hidePasswordModal);
  document.getElementById("confirmBtn").addEventListener("click", () => {
    const password = document.getElementById("systemPassword").value;
    if (currentPendingCommand === "unlock") {
        verifyAndUnlock(password);
    } else {
        executeCommand(currentPendingCommand, currentPendingCard, password);
    }
  });

  // Refresh status every 30 seconds
  setInterval(() => executeCommand("status", null), 30000);
});
