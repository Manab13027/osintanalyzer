// ===== PLATFORM DATA =====
const platformGroups = [
  {
    name: 'GLOBAL',
    cssClass: 'global',
    indicator: '🟢',
    extended: false,
    platforms: [
      { name: 'LinkedIn', icon: '🔗', color: '#0a66c2' },
      { name: 'X / Twitter', icon: '✖', color: '#1da1f2' },
      { name: 'Instagram', icon: '📷', color: '#e1306c' },
      { name: 'Facebook', icon: '📘', color: '#1877f2' },
      { name: 'TikTok', icon: '🎵', color: '#ff0050' },
      { name: 'YouTube', icon: '▶', color: '#ff0000' },
      { name: 'Reddit', icon: '🔴', color: '#ff4500' },
      { name: 'Pinterest', icon: '📌', color: '#e60023' },
      { name: 'Discord', icon: '🟣', color: '#5865f2' },
      { name: 'Twitch', icon: '🟣', color: '#9146ff' },
      { name: 'Threads', icon: '🧵', color: '#ffffff' },
      { name: 'Snapchat', icon: '👻', color: '#fffc00' },
      { name: 'GitHub', icon: '🐙', color: '#8b949e' },
      { name: 'Medium', icon: '📝', color: '#00ab6c' },
      { name: 'Quora', icon: '❓', color: '#b92b27' },
      { name: 'Tumblr', icon: '🔵', color: '#36465d' },
      { name: 'Flickr', icon: '📸', color: '#ff0084' },
      { name: 'Rumble', icon: '▶', color: '#85c742' },
      { name: 'Clubhouse', icon: '🏠', color: '#f3e8c9' },
      { name: 'Telegram', icon: '✈', color: '#0088cc' },
      { name: 'Signal', icon: '🔒', color: '#3a76f0' },
      { name: 'Viber', icon: '📱', color: '#7360f2' },
      { name: 'Spotify', icon: '🎵', color: '#1db954' },
      { name: 'Patreon', icon: '🎨', color: '#ff424d' },
    ]
  },
  {
    name: 'CHINESE',
    cssClass: 'chinese',
    indicator: '🇨🇳',
    extended: true,
    platforms: [
      { name: 'Weibo', icon: '🔴', color: '#e6162d' },
      { name: 'Bilibili', icon: '📺', color: '#00a1d6' },
      { name: 'Zhihu', icon: '❓', color: '#0084ff' },
      { name: 'Douyin', icon: '🎵', color: '#161823' },
      { name: 'Kuaishou', icon: '⚡', color: '#ff5000' },
      { name: 'Xiaohongshu', icon: '📕', color: '#ff2442' },
      { name: 'Baidu Tieba', icon: '🐾', color: '#2319dc' },
      { name: 'WeChat', icon: '💬', color: '#07c160' },
      { name: 'QQ', icon: '🐧', color: '#12b7f5' },
      { name: 'Youku', icon: '▶', color: '#1ab1ff' },
      { name: 'iQiyi', icon: '📺', color: '#00be06' },
      { name: 'Tencent Video', icon: '🎬', color: '#ff7700' },
      { name: 'PLAP', icon: '⚓', color: '#c0392b' },
    ]
  },
  {
    name: 'RUSSIAN',
    cssClass: 'russian',
    indicator: '🇷🇺',
    extended: true,
    platforms: [
      { name: 'VKontakte', icon: '💙', color: '#4c75a3' },
      { name: 'OK.ru', icon: '🟠', color: '#ed812b' },
      { name: 'Yandex Q', icon: '🔵', color: '#fc3f1d' },
      { name: 'Yappy', icon: '🐕', color: '#7b68ee' },
    ]
  },
  {
    name: 'INDIAN',
    cssClass: 'indian',
    indicator: '🇮🇳',
    extended: true,
    platforms: [
      { name: 'ShareChat', icon: '💬', color: '#ff6a00' },
      { name: 'Moj', icon: '🎬', color: '#e91e63' },
      { name: 'Josh', icon: '⚡', color: '#ffab00' },
      { name: 'Koo', icon: '🐦', color: '#facc15' },
      { name: 'Chingari', icon: '🔥', color: '#ff5722' },
      { name: 'Roposo', icon: '🎭', color: '#e91e63' },
      { name: 'Mitron', icon: '📱', color: '#4caf50' },
      { name: 'Public App', icon: '📰', color: '#1565c0' },
    ]
  },
  {
    name: 'JAPANESE',
    cssClass: 'japanese',
    indicator: '🎌',
    extended: false,
    platforms: [
      { name: 'LINE', icon: '💚', color: '#00c300' },
      { name: 'Mixi', icon: '📙', color: '#d1a827' },
      { name: 'Ameba', icon: '📗', color: '#7bbf6a' },
      { name: 'NicoNico', icon: '🎮', color: '#e4007f' },
    ]
  },
  {
    name: 'SE ASIAN',
    cssClass: 'se-asian',
    indicator: '🟢',
    extended: false,
    platforms: [
      { name: 'Snack Video', icon: '📹', color: '#ff5722' },
      { name: 'Bolo Live', icon: '🔴', color: '#e91e63' },
      { name: 'Likee', icon: '💜', color: '#e040fb' },
      { name: 'Helo', icon: '👋', color: '#00bfa5' },
    ]
  },
  {
    name: 'PAKISTANI',
    cssClass: 'pakistani',
    indicator: '🇵🇰',
    extended: true,
    platforms: [
      { name: 'Rozee.pk', icon: '💼', color: '#0077b5' },
      { name: 'PakWheels', icon: '🚗', color: '#e63946' },
      { name: 'Zameen', icon: '🏠', color: '#00897b' },
      { name: 'Daraz PK', icon: '🛒', color: '#f26522' },
      { name: 'Urdu Point', icon: '📰', color: '#1a6eb5' },
      { name: 'Hamariweb', icon: '🌐', color: '#ff6b00' },
      { name: 'Cricingif', icon: '🏏', color: '#1e8449' },
      { name: 'Ary News', icon: '📺', color: '#cc0000' },
      { name: 'Pakistan Defence', icon: '🛡', color: '#2e4057' },
      { name: 'PPRA', icon: '📋', color: '#1b5e20' },
      { name: 'NDMA', icon: '⚠', color: '#e65100' },
    ]
  }
];

// ===== API BASE URL =====
// Always point to the Express server on :3000, regardless of how this page
// was opened (file://, VS Code Live Server, Claude Preview, etc.)
const API_BASE = (() => {
  const { protocol, hostname, port } = window.location;
  if (protocol === 'file:' || port !== '3000') {
    return 'http://localhost:3000';
  }
  return ''; // same origin — relative URLs work fine
})();

// ===== STATE =====
let uploadedFiles = [];
let selectedPlatforms = new Set();
let searchResults = null;

// Initialize: select all platforms by default
platformGroups.forEach(group => {
  group.platforms.forEach(p => {
    selectedPlatforms.add(p.name);
  });
});

// ===== DOM REFERENCES =====
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const uploadPreview = document.getElementById('uploadPreview');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const blueprintStatus = document.getElementById('blueprintStatus');
const searchBtn = document.getElementById('searchBtn');
const thresholdSlider = document.getElementById('thresholdSlider');
const thresholdValue = document.getElementById('thresholdValue');
const platformsContainer = document.getElementById('platformsContainer');
const selectAllBtn = document.getElementById('selectAll');
const selectNoneBtn = document.getElementById('selectNone');
const godsEyeToggle = document.getElementById('godsEyeMode');

// Modal references
const resultsModal = document.getElementById('resultsModal');
const settingsModal = document.getElementById('settingsModal');
const progressModal = document.getElementById('progressModal');
const closeResultsModal = document.getElementById('closeResultsModal');
const closeSettingsModal = document.getElementById('closeSettingsModal');
const cancelSearchBtn = document.getElementById('cancelSearch');

// ===== RENDER PLATFORMS =====
function renderPlatforms() {
  platformsContainer.innerHTML = '';

  platformGroups.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = `platform-group${group.extended ? ' extended' : ''}`;
    if (group.extended && !godsEyeToggle.checked) {
      groupEl.classList.add('dimmed');
    }

    const headerEl = document.createElement('div');
    headerEl.className = 'group-header';
    headerEl.innerHTML = `
      <div class="group-label ${group.cssClass}">
        <span class="indicator">${group.indicator}</span>
        <span>${group.name}</span>
      </div>
      <div class="group-allnone">
        <button class="group-allnone-btn" data-group="${group.name}" data-action="all">All</button>
        <button class="group-allnone-btn" data-group="${group.name}" data-action="none">None</button>
      </div>
    `;
    groupEl.appendChild(headerEl);

    const chipsEl = document.createElement('div');
    chipsEl.className = 'chips-container';

    group.platforms.forEach(platform => {
      const chip = document.createElement('div');
      chip.className = `platform-chip${selectedPlatforms.has(platform.name) ? ' selected' : ''}`;
      chip.dataset.platform = platform.name;
      chip.innerHTML = `
        <span class="chip-icon">${platform.icon}</span>
        <span>${platform.name}</span>
      `;
      chip.addEventListener('click', () => {
        if (selectedPlatforms.has(platform.name)) {
          selectedPlatforms.delete(platform.name);
          chip.classList.remove('selected');
        } else {
          selectedPlatforms.add(platform.name);
          chip.classList.add('selected');
        }
      });
      chipsEl.appendChild(chip);
    });

    groupEl.appendChild(chipsEl);
    platformsContainer.appendChild(groupEl);
  });

  // Group all/none buttons
  document.querySelectorAll('.group-allnone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const groupName = btn.dataset.group;
      const action = btn.dataset.action;
      const group = platformGroups.find(g => g.name === groupName);
      if (!group) return;

      group.platforms.forEach(p => {
        if (action === 'all') {
          selectedPlatforms.add(p.name);
        } else {
          selectedPlatforms.delete(p.name);
        }
      });

      const groupEl = btn.closest('.platform-group');
      groupEl.querySelectorAll('.platform-chip').forEach(chip => {
        if (action === 'all') {
          chip.classList.add('selected');
        } else {
          chip.classList.remove('selected');
        }
      });
    });
  });
}

// ===== UPLOAD HANDLING =====
uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
});

function handleFiles(files) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

  for (const file of files) {
    if (!validTypes.includes(file.type)) continue;
    if (uploadedFiles.length >= 5) break;
    uploadedFiles.push(file);
  }

  updateUploadUI();
}

function updateUploadUI() {
  uploadPreview.innerHTML = '';

  if (uploadedFiles.length > 0) {
    uploadPlaceholder.style.display = 'none';

    uploadedFiles.forEach((file, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'photo-thumb';

      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-photo';
      removeBtn.textContent = '✕';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedFiles.splice(index, 1);
        updateUploadUI();
      });

      thumb.appendChild(img);
      thumb.appendChild(removeBtn);
      uploadPreview.appendChild(thumb);
    });

    blueprintStatus.innerHTML = `
      <span class="status-dot green pulse"></span>
      <span>Blueprint Ready — ${uploadedFiles.length} photo${uploadedFiles.length > 1 ? 's' : ''} loaded</span>
    `;
    blueprintStatus.classList.add('ready');
    updateSearchButtonState();
  } else {
    uploadPlaceholder.style.display = '';
    blueprintStatus.innerHTML = `
      <span class="status-dot yellow pulse"></span>
      <span>No Blueprint — Name-only search supported</span>
    `;
    blueprintStatus.classList.remove('ready');
    updateSearchButtonState();
  }
}

// Enable search button when name is entered OR photos are uploaded
function updateSearchButtonState() {
  const name = document.getElementById('targetName').value.trim();
  const hasPhotos = uploadedFiles.length > 0;
  if (hasPhotos) {
    searchBtn.disabled = false;
    searchBtn.innerHTML = '&#x1F50D; INITIATE SEARCH';
  } else if (name.length > 0) {
    searchBtn.disabled = false;
    searchBtn.innerHTML = '&#x1F50D; SEARCH BY NAME';
  } else {
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<span class="lock-icon">&#x1F512;</span> ENTER NAME OR UPLOAD PHOTO';
  }
}

// ===== THRESHOLD SLIDER =====
thresholdSlider.addEventListener('input', () => {
  thresholdValue.textContent = parseFloat(thresholdSlider.value).toFixed(2);
});

// ===== GODS EYE / PHANTOM MODE =====
godsEyeToggle.addEventListener('change', () => {
  document.querySelectorAll('.platform-group.extended').forEach(el => {
    if (godsEyeToggle.checked) {
      el.classList.remove('dimmed');
    } else {
      el.classList.add('dimmed');
    }
  });
});

// ===== SELECT ALL / NONE =====
selectAllBtn.addEventListener('click', () => {
  platformGroups.forEach(group => {
    group.platforms.forEach(p => selectedPlatforms.add(p.name));
  });
  document.querySelectorAll('.platform-chip').forEach(chip => {
    chip.classList.add('selected');
  });
});

selectNoneBtn.addEventListener('click', () => {
  selectedPlatforms.clear();
  document.querySelectorAll('.platform-chip').forEach(chip => {
    chip.classList.remove('selected');
  });
});

// ===== MODAL HANDLING =====
function openModal(modal) {
  modal.classList.add('active');
}

function closeModal(modal) {
  modal.classList.remove('active');
}

if (closeResultsModal) {
  closeResultsModal.addEventListener('click', () => closeModal(resultsModal));
}
if (closeSettingsModal) {
  closeSettingsModal.addEventListener('click', () => closeModal(settingsModal));
}
if (cancelSearchBtn) {
  cancelSearchBtn.addEventListener('click', () => closeModal(progressModal));
}

// Close modals on backdrop click
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

// ===== TABS =====
document.querySelectorAll('.results-tabs .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    // Deactivate all tabs
    btn.closest('.results-tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Show matching content
    document.querySelectorAll('.results-content .tab-content').forEach(tc => tc.classList.remove('active'));
    const target = document.getElementById(tab + 'Tab');
    if (target) target.classList.add('active');
  });
});

document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.settingsTab;
    btn.closest('.settings-tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.settings-content .tab-content').forEach(tc => tc.classList.remove('active'));
    const target = document.getElementById(tab + 'Settings');
    if (target) target.classList.add('active');
  });
});

// ===== SEARCH BUTTON =====
searchBtn.addEventListener('click', async () => {
  if (searchBtn.disabled) return;

  const targetName = document.getElementById('targetName').value;
  const profileSearch = document.getElementById('profileSearch').checked;
  const reverseImage = document.getElementById('reverseImage').checked;
  const godsEye = godsEyeToggle.checked;
  const threshold = parseFloat(thresholdSlider.value);

  // Show progress modal
  openModal(progressModal);
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const searchDetails = document.getElementById('searchDetails');

  searchBtn.innerHTML = '⏳ SEARCHING...';
  searchBtn.disabled = true;

  const platforms = Array.from(selectedPlatforms);
  let progress = 0;
  let elapsed = 0;

  // Stage-based progress: reflects real server pipeline
  // Stage 1  0–10%  : face detection / upload          (~2s)
  // Stage 2 10–40%  : news fetch + profile scan        (~4-12s)
  // Stage 3 40–70%  : AI analysis (Ollama call 1)      (~18s)
  // Stage 4 70–95%  : AI prediction (Ollama call 2)    (~20s)
  const STAGES = [
    { until: 10, speed: 2.0,  label: () => uploadedFiles.length > 0 ? 'Detecting faces in photos...' : 'Preparing search...' },
    { until: 40, speed: 1.2,  label: () => 'Fetching news & scanning profiles...' },
    { until: 70, speed: 0.55, label: () => 'AI generating intelligence brief...' },
    { until: 95, speed: 0.45, label: () => `AI generating predictive forecast... (${Math.round(elapsed)}s)` },
    { until: 98, speed: 0.08, label: () => `Finalising results... (${Math.round(elapsed)}s)` },
  ];

  progressText.textContent = 'Starting search...';
  const progressInterval = setInterval(() => {
    elapsed += 0.5;
    const stage = STAGES.find(s => progress < s.until) || STAGES[STAGES.length - 1];
    progress = Math.min(progress + stage.speed, stage.until);
    progressFill.style.width = progress + '%';
    progressText.textContent = stage.label();
    searchDetails.textContent = `${platforms.length} platforms · Ollama: ${document.getElementById('queueCount')?.textContent || 'checking...'}`;
  }, 500);

  try {
    const formData = new FormData();
    formData.append('targetName', targetName);
    formData.append('profileSearch', profileSearch);
    formData.append('reverseImage', reverseImage);
    formData.append('godsEye', godsEye);
    formData.append('threshold', threshold);
    formData.append('platforms', JSON.stringify(platforms));
    uploadedFiles.forEach(file => formData.append('photos', file));

    // Use XMLHttpRequest for better browser compatibility (fixes Safari "load failed")
    searchResults = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', API_BASE + '/api/search-multipart');
      xhr.timeout = 300000; // 5 min
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch (e) { reject(new Error('Invalid JSON response')); }
        } else {
          reject(new Error(`Server error: ${xhr.status} ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error — is the server running?'));
      xhr.ontimeout = () => reject(new Error('Request timed out'));
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.min((e.loaded / e.total) * 30, 30);
          progressFill.style.width = pct + '%';
          progressText.textContent = 'Uploading images...';
        }
      };
      xhr.send(formData);
    });

    clearInterval(progressInterval);
    progressFill.style.width = '100%';
    progressText.textContent = 'Processing results...';

    const lastEl = document.getElementById('lastSearch');
    if (lastEl) lastEl.textContent = new Date().toLocaleTimeString();

    setTimeout(() => {
      closeModal(progressModal);
      progressFill.style.width = '0%';
      displayResults(searchResults);
    }, 600);

  } catch (err) {
    clearInterval(progressInterval);
    console.error('Search error:', err);
    progressText.textContent = 'Error: ' + err.message;
    searchDetails.textContent = 'Check that the server is running on localhost:3000';
    setTimeout(() => closeModal(progressModal), 4000);
  } finally {
    searchBtn.disabled = false;
    searchBtn.innerHTML = '&#x1F50D; INITIATE SEARCH';
  }
});

// ===== DISPLAY RESULTS =====
function displayResults(data) {
  const summary = document.getElementById('resultsSummary');
  const newsResults = document.getElementById('newsResults');
  const profilesResults = document.getElementById('profilesResults');
  const analysisResults = document.getElementById('analysisResultsTab');
  const predictionResults = document.getElementById('predictionResults');

  // Summary
  const parts = [];
  if (data.news) parts.push(`${data.news.count} news articles found.`);
  if (data.usernameCheck) parts.push(`${data.usernameCheck.found.length} profiles found.`);
  if (data.faceAnalysis) parts.push(`${data.faceAnalysis.facesExtracted} face(s) detected.`);
  if (data.aiAnalysis && !data.aiAnalysis.error) parts.push(`AI analysis by ${data.aiAnalysis.model}.`);
  if (data.prediction && !data.prediction.error) parts.push('Predictive forecast generated.');
  summary.innerHTML = parts.join(' ') || 'Search complete.';

  // === NEWS TAB ===
  let newsHTML = '';
  if (data.news && data.news.articles && data.news.articles.length > 0) {
    newsHTML += `<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">${data.news.count} articles about "${data.news.query}"</p>`;
    data.news.articles.forEach(a => {
      newsHTML += `
        <div style="padding:14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:8px;margin-bottom:10px;">
          <a href="${a.link}" target="_blank" style="color:var(--cyan);font-size:14px;font-weight:500;text-decoration:none;line-height:1.4;display:block;">${a.title}</a>
          <div style="display:flex;justify-content:space-between;margin-top:6px;">
            <span style="color:var(--toggle-active);font-size:11px;font-weight:600;">${a.source}</span>
            <span style="color:var(--text-muted);font-size:11px;">${a.dateFormatted}</span>
          </div>
          ${a.description ? `<p style="color:var(--text-secondary);font-size:12px;margin-top:8px;line-height:1.5;">${a.description}</p>` : ''}
        </div>`;
    });
  } else {
    newsHTML = '<p style="color:var(--text-muted)">No news articles found.</p>';
  }
  newsResults.innerHTML = newsHTML;

  // === PROFILES TAB ===
  let profileHTML = '';

  if (data.usernameCheck && data.usernameCheck.found && data.usernameCheck.found.length > 0) {
    profileHTML += '<h3 style="color:var(--green);font-size:14px;margin-bottom:12px;font-family:var(--font-display);letter-spacing:1px;">PROFILES FOUND</h3>';
    profileHTML += `<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Usernames checked: ${data.usernameCheck.usernames.join(', ')}</p>`;

    data.usernameCheck.found.forEach(r => {
      profileHTML += `
        <div style="padding:12px;background:var(--bg-input);border:1px solid var(--green);border-radius:8px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <strong style="color:var(--cyan)">${r.platform}</strong>
              <span style="color:var(--text-muted);font-size:12px;margin-left:8px;">@${r.username}</span>
            </div>
            <span style="color:var(--green);font-size:12px;">FOUND</span>
          </div>
          ${r.url ? `<a href="${r.url}" target="_blank" style="color:var(--cyan);font-size:11px;text-decoration:none;display:block;margin-top:6px;">${r.url}</a>` : ''}
        </div>`;
    });
  }

  if (data.usernameCheck) {
    profileHTML += `<p style="font-size:11px;color:var(--text-muted);margin-top:12px;">Checked: ${data.usernameCheck.total} | Found: ${data.usernameCheck.found.length} | Not found: ${data.usernameCheck.notFound}</p>`;
  }

  if (data.faceAnalysis && data.faceAnalysis.details) {
    profileHTML += '<h3 style="color:var(--cyan);font-size:14px;margin:16px 0 12px;font-family:var(--font-display);letter-spacing:1px;">FACE DETECTION</h3>';
    data.faceAnalysis.details.forEach(d => {
      const statusColor = d.faces > 0 ? 'var(--green)' : 'var(--red)';
      const statusText = d.faces > 0 ? `${d.faces} face(s) — ${(d.confidence * 100).toFixed(1)}%` : (d.error || 'No face detected');
      profileHTML += `
        <div style="padding:12px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:8px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong style="color:var(--text-primary)">${d.file}</strong>
            <span style="color:${statusColor};font-size:12px;">${statusText}</span>
          </div>
        </div>`;
    });
  }

  profilesResults.innerHTML = profileHTML || '<p style="color:var(--text-muted)">No profiles or face data.</p>';

  // === ANALYSIS TAB ===
  if (data.aiAnalysis && data.aiAnalysis.brief) {
    const formatted = formatAIText(data.aiAnalysis.brief);
    analysisResults.innerHTML = `
      <div style="padding:16px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <strong style="color:var(--cyan);font-family:var(--font-display);font-size:12px;letter-spacing:1px;">INTELLIGENCE BRIEF</strong>
          <span style="font-size:11px;color:var(--text-muted)">Model: ${data.aiAnalysis.model}</span>
        </div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">${formatted}</div>
      </div>`;
  } else if (data.aiAnalysis && data.aiAnalysis.error) {
    analysisResults.innerHTML = `<p style="color:var(--red)">AI analysis failed: ${data.aiAnalysis.error}</p>`;
  } else {
    analysisResults.innerHTML = '<p style="color:var(--text-muted)">Ollama not available — analysis skipped.</p>';
  }

  // === PREDICTION TAB ===
  if (data.prediction && data.prediction.forecast) {
    const formatted = formatAIText(data.prediction.forecast);
    predictionResults.innerHTML = `
      <div style="padding:16px;background:var(--bg-input);border:1px solid #7c3aed;border-radius:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <strong style="color:#a78bfa;font-family:var(--font-display);font-size:12px;letter-spacing:1px;">PREDICTIVE FORECAST</strong>
          <span style="font-size:11px;color:var(--text-muted)">Model: ${data.prediction.model}</span>
        </div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">${formatted}</div>
      </div>
      <p style="font-size:10px;color:var(--text-muted);margin-top:10px;font-style:italic;">
        Predictions are AI-generated based on recent news patterns. Not financial or legal advice.
      </p>`;
  } else if (data.prediction && data.prediction.error) {
    predictionResults.innerHTML = `<p style="color:var(--red)">Prediction failed: ${data.prediction.error}</p>`;
  } else {
    predictionResults.innerHTML = '<p style="color:var(--text-muted)">No predictive analysis available.</p>';
  }

  openModal(resultsModal);
}

// ===== EXPORT RESULTS =====
const exportBtn = document.getElementById('exportResults');
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    if (!searchResults) return;
    const blob = new Blob([JSON.stringify(searchResults, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'phantom-trace-results.json';
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ===== SYSTEM STATUS =====
async function updateSystemStatus() {
  try {
    const res = await fetch(API_BASE + '/api/status');
    const data = await res.json();

    const statusEl = document.getElementById('systemStatus');
    if (statusEl) {
      statusEl.textContent = data.system === 'online' ? 'Online' : 'Offline';
      statusEl.style.color = data.system === 'online' ? 'var(--green)' : 'var(--red)';
    }

    const proxyEl = document.getElementById('proxyCount');
    if (proxyEl) {
      proxyEl.textContent = data.ollama ? data.ollamaModel : 'Offline';
      proxyEl.style.color = data.ollama ? 'var(--green)' : 'var(--text-muted)';
    }

    const queueEl = document.getElementById('queueCount');
    if (queueEl) {
      queueEl.textContent = data.faceModels ? 'Loaded' : 'Not loaded';
      queueEl.style.color = data.faceModels ? 'var(--green)' : 'var(--red)';
    }

    const torEl = document.getElementById('torStatus');
    if (torEl) {
      torEl.textContent = data.tor ? 'Connected' : 'Offline';
      torEl.style.color = data.tor ? 'var(--green)' : 'var(--text-muted)';
    }

    const vpnEl = document.getElementById('vpnStatus');
    if (vpnEl) {
      vpnEl.textContent = data.vpn ? 'Active' : 'Not detected';
      vpnEl.style.color = data.vpn ? 'var(--green)' : 'var(--text-muted)';
    }

    const lastEl = document.getElementById('lastSearch');
    if (lastEl && !lastEl.dataset.updated) lastEl.textContent = 'Never';
  } catch {
    const statusEl = document.getElementById('systemStatus');
    if (statusEl) {
      statusEl.textContent = 'Server Offline';
      statusEl.style.color = 'var(--red)';
    }
  }
}

// ===== CONNECTION DIAGNOSTICS =====
async function runDiagnostics() {
  const box = document.getElementById('diagBox');
  const pageUrlEl = document.getElementById('diagPageUrl');
  const apiUrlEl = document.getElementById('diagApiUrl');
  const pingEl = document.getElementById('diagPing');
  const adviceEl = document.getElementById('diagAdvice');

  if (!box) return;
  box.style.display = 'block';

  const pageUrl = window.location.href;
  const apiTarget = API_BASE + '/api/status';

  pageUrlEl.textContent = pageUrl;
  apiUrlEl.textContent = apiTarget;

  try {
    const r = await fetch(apiTarget, { cache: 'no-store' });
    const data = await r.json();
    pingEl.textContent = '✓ CONNECTED — ' + (data.ollama ? 'Ollama: ON' : 'Ollama: OFF') + ' | Face models: ' + (data.faceModels ? 'OK' : 'FAIL');
    pingEl.style.color = '#22c55e';
    adviceEl.textContent = '';
    // Hide after 8s if all good
    setTimeout(() => { box.style.display = 'none'; }, 8000);
  } catch (err) {
    pingEl.textContent = '✗ FAILED — ' + err.message;
    pingEl.style.color = '#ef4444';
    if (pageUrl.startsWith('file://')) {
      adviceEl.textContent = '⚠ You opened this as a file. Open http://localhost:3000 in your browser instead.';
    } else {
      adviceEl.textContent = '⚠ Cannot reach localhost:3000. Start the server: cd /Users/fighter/Documents/osintanalyzer && /opt/homebrew/bin/node server.js';
    }
  }
}

// ===== INIT =====
renderPlatforms();
updateSystemStatus();
runDiagnostics();
// Refresh status every 30s
setInterval(updateSystemStatus, 30000);
// Enable search when name is typed (photos are optional)
document.getElementById('targetName').addEventListener('input', updateSearchButtonState);

// ===== FORMAT AI TEXT =====
// Renders markdown-style LLM output as structured HTML
function formatAIText(text) {
  if (!text) return '';
  // Escape HTML
  let t = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text**
  t = t.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--cyan)">$1</strong>');
  // Italic: *text*
  t = t.replace(/\*([^*]+?)\*/g, '<em style="color:var(--toggle-active)">$1</em>');

  // Numbered section headers like "1. SHORT-TERM FORECAST" or "1. SITUATION SUMMARY"
  t = t.replace(
    /^(\d+)\.\s+([A-Z][A-Z &\/\-]+?)(?:\s*[—–\-]\s*|\s*\n|\s*$)(.*?)(?=\n\d+\.|$)/gms,
    (_, num, heading, body) => {
      const cleanBody = body.trim().replace(/\n/g, '<br>');
      return `<div style="margin:14px 0 8px;padding:12px 14px;background:rgba(0,229,255,0.04);border-left:3px solid var(--cyan-dim);border-radius:4px;">
        <div style="color:var(--cyan);font-family:var(--font-display);font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">${num}. ${heading.trim()}</div>
        <div style="color:var(--text-secondary);line-height:1.7;">${cleanBody}</div>
      </div>`;
    }
  );

  // Remaining markdown headers (###)
  t = t.replace(/^#{1,3}\s*(.+)$/gm,
    '<div style="color:var(--cyan);font-family:var(--font-display);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:10px 0 4px;">$1</div>');

  // Bullet points
  t = t.replace(/^[-•]\s+(.+)$/gm,
    '<div style="padding:3px 0 3px 14px;position:relative;"><span style="position:absolute;left:0;color:var(--cyan-dim);">›</span>$1</div>');

  // Double newlines become paragraph breaks
  t = t.replace(/\n{2,}/g, '</p><p style="margin-top:8px;">');
  t = t.replace(/\n/g, '<br>');

  return '<p style="margin:0;">' + t + '</p>';
}
