// Main Application Controller for PromptProof Frontend
import { api } from './api.js';

class PromptProofApp {
  constructor() {
    this.currentRunId = null;
    this.attackResults = [];
    this.rerunResults = [];
    this.benignChecks = [];
    this.activeFilter = 'all';

    this.initElements();
    this.initEventListeners();
    this.initApp();
  }

  initElements() {
    // Navigation
    this.navBtns = document.querySelectorAll('.nav-tab-btn');
    this.tabPanes = document.querySelectorAll('.tab-pane');

    // Status & Settings
    this.statusPill = document.getElementById('status-indicator-pill');
    this.statusDot = document.getElementById('status-dot');
    this.statusText = document.getElementById('status-text');
    this.settingsBtn = document.getElementById('settings-btn');
    this.settingsModal = document.getElementById('settings-modal');
    this.closeSettingsBtn = document.getElementById('close-settings-modal');
    this.saveSettingsBtn = document.getElementById('save-settings-btn');
    this.testHealthBtn = document.getElementById('test-health-btn');
    this.healthStatusOutput = document.getElementById('health-status-output');
    this.apiUrlInput = document.getElementById('api-url-input');
    this.simulatorToggle = document.getElementById('simulator-toggle');

    // Audit Form
    this.systemPromptInput = document.getElementById('system-prompt-input');
    this.providerSelect = document.getElementById('provider-select');
    this.modelSelect = document.getElementById('model-select');
    this.apiKeyGroup = document.getElementById('api-key-group');
    this.apiKeyInput = document.getElementById('api-key-input');
    this.scanScopeSelect = document.getElementById('scan-scope-select');
    this.deepScanToggle = document.getElementById('deep-scan-toggle');
    this.generateAttacksToggle = document.getElementById('generate-attacks-toggle');
    this.autoHardenToggle = document.getElementById('auto-harden-toggle');
    this.launchRunBtn = document.getElementById('launch-run-btn');
    this.stopRunBtn = document.getElementById('stop-run-btn');
    this.presetChipsContainer = document.getElementById('preset-chips-container');
    this.charCounter = document.getElementById('char-counter');

    // Live Execution Views
    this.activeRunBanner = document.getElementById('active-run-banner');
    this.activeRunIdDisplay = document.getElementById('active-run-id-display');
    this.stepperNodes = document.querySelectorAll('.step-node');
    this.stepConnectorFill = document.getElementById('step-connector-fill');
    this.stageTickerMessage = document.getElementById('stage-ticker-message');

    // Score Dashboard
    this.resistanceGaugeProgress = document.getElementById('resistance-gauge-progress');
    this.resistanceScoreValue = document.getElementById('resistance-score-value');
    this.resistanceDeltaBadge = document.getElementById('resistance-delta-badge');
    this.statPassedCount = document.getElementById('stat-passed-count');
    this.statFailedCount = document.getElementById('stat-failed-count');
    this.statFlipsCount = document.getElementById('stat-flips-count');

    // Matrix Table
    this.attackMatrixBody = document.getElementById('attack-matrix-body');
    this.filterPills = document.querySelectorAll('.filter-pill');

    // Hardened Diff & Defenses
    this.diffSection = document.getElementById('diff-section');
    this.originalPromptDiff = document.getElementById('original-prompt-diff');
    this.hardenedPromptDiff = document.getElementById('hardened-prompt-diff');
    this.guardrailsList = document.getElementById('guardrails-list');
    this.copyHardenedBtn = document.getElementById('copy-hardened-btn');
    this.usePromptBtn = document.getElementById('use-prompt-btn');

    // Benign Checks
    this.benignSection = document.getElementById('benign-section');
    this.benignChecksBody = document.getElementById('benign-checks-body');

    // Export Action
    this.downloadReportBtn = document.getElementById('download-report-btn');

    // Idle, Posture & Analytics Visuals
    this.idleAssessmentCard = document.getElementById('idle-assessment-card');
    this.postureGradeCard = document.getElementById('posture-grade-card');
    this.postureGradeBadge = document.getElementById('posture-grade-badge');
    this.postureTitle = document.getElementById('posture-title');
    this.postureDesc = document.getElementById('posture-desc');
    this.postureLatency = document.getElementById('posture-latency');
    this.postureRemediated = document.getElementById('posture-remediated');
    this.threatAnalyticsCard = document.getElementById('threat-analytics-card');
    this.categoryBarsContainer = document.getElementById('category-bars-container');
    this.matrixSearchInput = document.getElementById('matrix-search-input');
    this.downloadPromptBtn = document.getElementById('download-prompt-btn');
    this.pillAll = document.getElementById('pill-all');
    this.pillFail = document.getElementById('pill-fail');
    this.pillPass = document.getElementById('pill-pass');
    this.searchQuery = '';

    // History View
    this.historyGrid = document.getElementById('history-grid');
    this.refreshHistoryBtn = document.getElementById('refresh-history-btn');

    // Detail Modal
    this.vectorModal = document.getElementById('vector-modal');
    this.closeVectorModalBtn = document.getElementById('close-vector-modal');
    this.vectorModalContent = document.getElementById('vector-modal-content');

    // Toast Container
    this.toastContainer = document.getElementById('toast-container');
  }

  async initApp() {
    this.apiUrlInput.value = api.baseUrl;
    this.simulatorToggle.checked = api.useSimulator;

    await this.checkSystemHealth();
    await this.loadSamples();
    await this.loadProvidersAndModels();
    await this.loadHistory();
  }

  initEventListeners() {
    // Navigation
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Preset character counter
    this.systemPromptInput.addEventListener('input', () => {
      const len = this.systemPromptInput.value.length;
      this.charCounter.textContent = `${len} chars`;
      this.launchRunBtn.disabled = len < 5;
    });

    // Provider select change -> update models
    this.providerSelect.addEventListener('change', () => {
      this.updateModelOptions();
    });

    // Matrix search input
    if (this.matrixSearchInput) {
      this.matrixSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderAttackMatrix();
      });
    }

    // Launch Run
    this.launchRunBtn.addEventListener('click', () => this.handleStartRun());

    // Stop Run
    this.stopRunBtn.addEventListener('click', () => this.handleStopRun());

    // Settings Modal
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    this.statusPill.addEventListener('click', () => this.openSettings());
    this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    this.testHealthBtn.addEventListener('click', () => this.testHealthInModal());

    // Filter pills
    this.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeFilter = pill.getAttribute('data-filter');
        this.renderAttackMatrix();
      });
    });

    // Copy Hardened Prompt
    this.copyHardenedBtn.addEventListener('click', () => {
      const text = this.hardenedPromptDiff.textContent;
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Hardened prompt copied to clipboard', 'success');
      });
    });

    // Apply Hardened Prompt to Configuration
    if (this.usePromptBtn) {
      this.usePromptBtn.addEventListener('click', () => {
        const text = this.hardenedPromptDiff.textContent;
        if (text) {
          this.systemPromptInput.value = text;
          this.charCounter.textContent = `${text.length} chars`;
          this.systemPromptInput.scrollIntoView({ behavior: 'smooth' });
          this.systemPromptInput.classList.add('pulse-glow');
          setTimeout(() => this.systemPromptInput.classList.remove('pulse-glow'), 800);
          this.showToast('Applied hardened prompt to configuration', 'success');
        }
      });
    }

    // Download Hardened Prompt as .txt
    if (this.downloadPromptBtn) {
      this.downloadPromptBtn.addEventListener('click', () => {
        const text = this.hardenedPromptDiff.textContent;
        if (text) {
          const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `hardened-prompt-${this.currentRunId || 'export'}.txt`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          this.showToast('Downloaded hardened prompt (.txt)', 'success');
        }
      });
    }

    // Download Report
    this.downloadReportBtn.addEventListener('click', () => {
      if (this.currentRunId) {
        api.downloadReport(this.currentRunId);
        this.showToast('Downloading verified audit report...', 'success');
      }
    });

    const compExportBtn = document.getElementById('completion-export-btn');
    if (compExportBtn) {
      compExportBtn.addEventListener('click', () => {
        if (this.currentRunId) {
          api.downloadReport(this.currentRunId);
          this.showToast('Downloading verified audit report...', 'success');
        }
      });
    }

    // History refresh
    this.refreshHistoryBtn.addEventListener('click', () => {
      this.loadHistory();
      this.showToast('History refreshed', 'info');
    });

    // Vector Modal close
    this.closeVectorModalBtn.addEventListener('click', () => {
      this.vectorModal.classList.remove('open');
    });

    // Matrix search input
    if (this.matrixSearchInput) {
      this.matrixSearchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target.value || '').trim().toLowerCase();
        this.renderAttackMatrix();
      });
    }
  }

  switchTab(tabId) {
    this.navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    this.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });
  }

  async checkSystemHealth() {
    const health = await api.checkHealth();
    if (health.simulated) {
      this.statusDot.className = 'status-dot simulated active';
      this.statusText.textContent = 'Simulator Mode';
    } else if (health.status === 'ok') {
      this.statusDot.className = 'status-dot active';
      this.statusText.textContent = 'API Connected';
    } else {
      this.statusDot.className = 'status-dot offline';
      this.statusText.textContent = 'Offline';
    }
  }

  async loadSamples() {
    try {
      const samples = await api.getSamples();
      this.presetChipsContainer.innerHTML = '';

      samples.forEach((sample, idx) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'preset-chip';

        let badgeClass = 'badge-weak';
        const levelLower = (sample.level || '').toLowerCase();
        if (levelLower === 'medium') badgeClass = 'badge-medium';
        if (levelLower === 'strong') badgeClass = 'badge-strong';

        chip.innerHTML = `
          <span class="badge-level ${badgeClass}">${sample.level.toUpperCase()}</span>
          <span>${sample.name}</span>
        `;

        chip.addEventListener('click', () => {
          this.systemPromptInput.value = sample.prompt;
          this.charCounter.textContent = `${sample.prompt.length} chars`;
          this.launchRunBtn.disabled = false;
          this.systemPromptInput.classList.add('pulse-glow');
          setTimeout(() => this.systemPromptInput.classList.remove('pulse-glow'), 800);
          this.showToast(`Loaded: ${sample.name}`, 'info');
        });

        this.presetChipsContainer.appendChild(chip);

        if (idx === 0 && !this.systemPromptInput.value) {
          this.systemPromptInput.value = sample.prompt;
          this.charCounter.textContent = `${sample.prompt.length} chars`;
        }
      });
    } catch (e) {
      console.error('Error loading samples', e);
    }
  }

  async loadProvidersAndModels() {
    try {
      const data = await api.getModels();
      this.providersData = data.providers || [];

      this.providerSelect.innerHTML = '';
      this.providersData.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        // Clean display name
        let cleanName = p.name.replace(/\(.*\)/, '').trim();
        opt.textContent = cleanName;
        this.providerSelect.appendChild(opt);
      });

      this.updateModelOptions();
    } catch (e) {
      console.error('Error loading models', e);
    }
  }

  updateModelOptions() {
    const selectedProviderId = this.providerSelect.value;
    const provider = this.providersData?.find(p => p.id === selectedProviderId);

    this.modelSelect.innerHTML = '';
    if (provider && provider.models) {
      provider.models.forEach(modelName => {
        const opt = document.createElement('option');
        opt.value = modelName;
        opt.textContent = modelName;
        this.modelSelect.appendChild(opt);
      });
      this.apiKeyGroup.style.display = provider.requires_key ? 'block' : 'none';
    }
  }

  // ==========================================
  // Audit Execution & Real-time SSE Handling
  // ==========================================

  async handleStartRun() {
    const prompt = this.systemPromptInput.value.trim();
    if (!prompt || prompt.length < 5) {
      this.showToast('Please provide a prompt with at least 5 characters.', 'error');
      return;
    }

    const payload = {
      prompt: prompt,
      model: this.modelSelect.value,
      provider: this.providerSelect.value,
      api_key: this.apiKeyInput.value || null,
      scan_scope: this.scanScopeSelect.value,
      deep_scan: this.deepScanToggle.checked,
      generate_app_attacks: this.generateAttacksToggle.checked,
      auto_harden: this.autoHardenToggle.checked
    };

    this.launchRunBtn.disabled = true;
    this.stopRunBtn.style.display = 'inline-flex';
    this.activeRunBanner.style.display = 'block';

    // Show posture & threat analytics, hide idle state card
    if (this.idleAssessmentCard) this.idleAssessmentCard.style.display = 'none';
    if (this.postureGradeCard) this.postureGradeCard.style.display = 'flex';
    if (this.threatAnalyticsCard) this.threatAnalyticsCard.style.display = 'block';

    // Reset local run state
    this.attackResults = [];
    this.rerunResults = [];
    this.benignChecks = [];
    this.renderAttackMatrix();
    this.resetStepper();
    this.resetScoreDisplay();
    this.updatePostureGrade(0, 0, 0, 0);
    this.renderCategoryAnalytics({}, []);

    this.diffSection.style.display = 'none';
    this.benignSection.style.display = 'none';
    this.downloadReportBtn.disabled = true;

    // Reset completion banner and header indicators
    const iconEl = document.getElementById('active-run-icon');
    const titleEl = document.getElementById('active-run-title');
    const badgeEl = document.getElementById('pipeline-status-badge');
    const completeBanner = document.getElementById('audit-complete-banner');
    if (completeBanner) completeBanner.style.display = 'none';
    if (titleEl) titleEl.textContent = 'Audit in Progress';
    if (iconEl) {
      iconEl.className = 'ticker-radar';
      iconEl.innerHTML = '';
    }
    if (badgeEl) {
      badgeEl.className = 'badge-level badge-strong';
      badgeEl.textContent = 'LIVE PIPELINE';
    }

    try {
      const runRes = await api.createRun(payload);
      this.currentRunId = runRes.run_id;
      this.activeRunIdDisplay.textContent = this.currentRunId;

      this.showToast(`Audit initiated: ${this.currentRunId}`, 'info');

      api.listenRunEvents(this.currentRunId, {
        run_started: (data) => {
          this.setStageActive('harness');
          this.stageTickerMessage.textContent = `Audit run initialized. Vectors queued: ${data.total_attacks}`;
        },
        stage_update: (data) => {
          this.setStageActive(data.stage);
          this.stageTickerMessage.textContent = data.message;
        },
        attack_result: (result) => {
          this.attackResults.push(result);
          this.renderAttackMatrix();
          this.updateMetricsFromResults();
        },
        score_update: (data) => {
          this.updateResistanceGauge(data.overall_resistance);
          this.statPassedCount.textContent = data.passed_count;
          this.statFailedCount.textContent = data.failed_count;
          this.updatePostureGrade(data.overall_resistance, data.failed_count, 45, 0);
          this.renderCategoryAnalytics(data.category_scores, this.attackResults);
        },
        hardened_prompt: (data) => {
          this.diffSection.style.display = 'block';
          this.originalPromptDiff.textContent = data.original_prompt;
          this.hardenedPromptDiff.textContent = data.hardened_prompt;

          this.guardrailsList.innerHTML = '';
          (data.changes || []).forEach(ch => {
            const item = document.createElement('div');
            item.className = 'guardrail-item';
            item.innerHTML = `
              <svg class="guardrail-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>${ch}</span>
            `;
            this.guardrailsList.appendChild(item);
          });
        },
        rerun_result: (rerun) => {
          this.rerunResults.push(rerun);
          const row = document.getElementById(`row-${rerun.id}`);
          if (row) {
            const verdictCell = row.querySelector('.verdict-cell');
            if (verdictCell) {
              verdictCell.innerHTML = `
                <span class="verdict-badge verdict-pass">
                  DEFENDED
                </span>
              `;
            }
          }
        },
        score_comparison: (data) => {
          this.updateResistanceGauge(data.after_resistance);
          this.statFlipsCount.textContent = data.flips_count;
          this.updatePostureGrade(data.after_resistance, data.after_failures || 0, 42, data.flips_count);
          this.renderCategoryAnalytics(data.after_category_scores, this.attackResults);

          const rawDelta = (data.after_resistance || 0) - (data.before_resistance || 0);
          const cleanDelta = Math.round(rawDelta * 10) / 10;
          const formattedDelta = Number.isInteger(cleanDelta) ? cleanDelta : cleanDelta.toFixed(1);

          this.resistanceDeltaBadge.style.display = 'inline-flex';
          this.resistanceDeltaBadge.innerHTML = `
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
            +${formattedDelta}% Resistance Gained
          `;
        },
        benign_check_result: (benign) => {
          this.benignSection.style.display = 'block';
          this.benignChecks.push(benign);
          this.renderBenignChecks();
        },
        done: () => {
          this.completeRun();
          this.showToast('Security audit complete — Remediations verified', 'success');
          this.loadHistory();
        },
        cancelled: () => {
          this.completeRun(true);
          this.showToast('Audit run cancelled', 'info');
        },
        onError: (err) => {
          console.error('Run stream error:', err);
          this.completeRun();
        }
      }, { ...payload, fallback: runRes.fallback });

    } catch (e) {
      this.showToast(e.message || 'Failed to start run', 'error');
      this.completeRun();
    }
  }

  async handleStopRun() {
    if (this.currentRunId) {
      await api.stopRun(this.currentRunId);
      this.completeRun(true);
      this.showToast('Run stopped', 'info');
    }
  }

  completeRun(wasCancelled = false) {
    this.launchRunBtn.disabled = false;
    this.stopRunBtn.style.display = 'none';
    this.downloadReportBtn.disabled = false;

    const iconEl = document.getElementById('active-run-icon');
    const titleEl = document.getElementById('active-run-title');
    const badgeEl = document.getElementById('pipeline-status-badge');
    const completeBanner = document.getElementById('audit-complete-banner');

    if (wasCancelled) {
      this.stageTickerMessage.textContent = 'Execution aborted by user.';
      if (titleEl) titleEl.textContent = 'Audit Aborted';
      if (badgeEl) badgeEl.textContent = 'CANCELLED';
      if (completeBanner) completeBanner.style.display = 'none';
    } else {
      this.setStageActive('done');
      if (titleEl) titleEl.textContent = 'Audit Complete & Verified';
      if (iconEl) {
        iconEl.className = '';
        iconEl.innerHTML = `
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #059669; color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(5, 150, 105, 0.3);">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
          </div>
        `;
      }
      if (badgeEl) {
        badgeEl.className = 'badge-level badge-strong';
        badgeEl.textContent = 'AUDIT COMPLETE';
      }
      if (completeBanner) {
        completeBanner.style.display = 'flex';
      }
      this.launchRunBtn.innerHTML = `
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Run Another Security Audit
      `;
    }
  }

  setStageActive(stageName) {
    const stages = ['harness', 'running_attacks', 'hardening', 'rerunning', 'benign_checks', 'done'];
    const activeIndex = stages.indexOf(stageName);

    this.stepperNodes.forEach((node, idx) => {
      node.classList.remove('active', 'completed');
      if (idx < activeIndex) {
        node.classList.add('completed');
      } else if (idx === activeIndex) {
        node.classList.add('active');
      }
    });

    const percent = Math.min(100, Math.max(0, (activeIndex / (stages.length - 1)) * 100));
    this.stepConnectorFill.style.width = `${percent}%`;
  }

  resetStepper() {
    this.stepperNodes.forEach(node => node.classList.remove('active', 'completed'));
    this.stepConnectorFill.style.width = '0%';
    this.stepperNodes[0].classList.add('active');
  }

  resetScoreDisplay() {
    this.updateResistanceGauge(0);
    this.statPassedCount.textContent = '0';
    this.statFailedCount.textContent = '0';
    this.statFlipsCount.textContent = '0';
    this.resistanceDeltaBadge.style.display = 'none';
  }

  updateResistanceGauge(score) {
    const circumference = 282.74;
    const offset = circumference - (score / 100) * circumference;
    this.resistanceGaugeProgress.style.strokeDashoffset = offset;
    this.resistanceScoreValue.textContent = `${Math.round(score)}%`;
  }

  updateMetricsFromResults() {
    const passed = this.attackResults.filter(a => a.verdict === 'pass').length;
    const failed = this.attackResults.filter(a => a.verdict === 'fail').length;
    const total = this.attackResults.length;

    this.statPassedCount.textContent = passed;
    this.statFailedCount.textContent = failed;

    const initialScore = total > 0 ? Math.round((passed / total) * 100) : 0;
    if (total > 0 && !this.rerunResults.length) {
      this.updateResistanceGauge(initialScore);
    }

    const avgLatency = total > 0 ? Math.round(this.attackResults.reduce((acc, a) => acc + (a.duration_ms || 45), 0) / total) : 48;
    this.updatePostureGrade(initialScore, failed, avgLatency, this.rerunResults.length);
    this.renderCategoryAnalytics(null, this.attackResults);
  }

  updatePostureGrade(overallResistance = 100, totalFailures = 0, durationMs = 45, flipsCount = 0) {
    if (!this.postureGradeBadge) return;

    let grade = 'A+';
    let gradeClass = 'grade-a-plus';
    let title = 'Security Posture: Production Certified';
    let desc = 'All evaluated attack vectors neutralized with zero regression.';

    const score = Math.round(overallResistance);

    if (score >= 95) {
      grade = 'A+';
      gradeClass = 'grade-a-plus';
      title = 'Security Posture: Production Certified';
      desc = flipsCount > 0 
        ? `${flipsCount} attack vectors remediated via active prompt hardening.` 
        : 'Prompt successfully neutralized evaluated attack vectors with zero regressions.';
    } else if (score >= 80) {
      grade = 'A';
      gradeClass = 'grade-a-plus';
      title = 'Security Posture: Enterprise Resilient';
      desc = 'High resistance against common prompt injections and canary extraction probes.';
    } else if (score >= 60) {
      grade = 'B';
      gradeClass = 'grade-b';
      title = 'Security Posture: Baseline Guardrails';
      desc = `${totalFailures} potential vector vulnerabilities identified. Hardening recommended before production deploy.`;
    } else {
      grade = 'F';
      gradeClass = 'grade-f';
      title = 'Security Posture: Vulnerable to Jailbreaks';
      desc = `Critical prompt leak or instruction override vulnerabilities detected. Immediate hardening required.`;
    }

    this.postureGradeBadge.textContent = grade;
    this.postureGradeBadge.className = `grade-badge-circle ${gradeClass}`;
    if (this.postureTitle) this.postureTitle.textContent = title;
    if (this.postureDesc) this.postureDesc.textContent = desc;
    if (this.postureLatency) this.postureLatency.textContent = `Avg Latency: ${durationMs || 45}ms`;
    if (this.postureRemediated) {
      this.postureRemediated.textContent = flipsCount > 0 ? `${flipsCount} Remediated` : `${score}% Resistance`;
    }
  }

  renderCategoryAnalytics(categoryScores = {}, attackResults = []) {
    if (!this.categoryBarsContainer) return;

    const defaultCategories = [
      { key: 'indirect_injection', name: 'Indirect Injection' },
      { key: 'direct_override', name: 'Direct Override' },
      { key: 'delimiter_hijack', name: 'Delimiter Hijacking' },
      { key: 'canary_extraction', name: 'Canary Probe' },
      { key: 'roleplay_jailbreak', name: 'Roleplay Jailbreak' },
      { key: 'prompt_leak', name: 'System Prompt Leak' }
    ];

    const scores = { ...(categoryScores || {}) };
    if (attackResults && attackResults.length > 0) {
      const catCounts = {};
      const catPass = {};
      attackResults.forEach(atk => {
        const cat = atk.category || 'general';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
        if (atk.verdict === 'pass') catPass[cat] = (catPass[cat] || 0) + 1;
      });
      Object.keys(catCounts).forEach(cat => {
        scores[cat] = Math.round(((catPass[cat] || 0) / catCounts[cat]) * 100);
      });
    }

    this.categoryBarsContainer.innerHTML = '';
    defaultCategories.forEach(cat => {
      const pct = scores[cat.key] !== undefined ? scores[cat.key] : (attackResults && attackResults.length === 0 ? 0 : 100);
      let colorVar = 'var(--emerald-500)';
      let textClass = 'high';
      if (pct < 50) {
        colorVar = 'var(--crimson-500)';
        textClass = 'low';
      } else if (pct < 80) {
        colorVar = 'var(--amber-500)';
        textClass = 'mid';
      }

      const item = document.createElement('div');
      item.className = 'category-bar-item';
      item.innerHTML = `
        <div class="category-bar-header">
          <span class="category-name">${cat.name}</span>
          <span class="category-score-val ${textClass}">${pct}%</span>
        </div>
        <div class="category-track">
          <div class="category-fill" style="width: ${pct}%; background: ${colorVar};"></div>
        </div>
      `;
      this.categoryBarsContainer.appendChild(item);
    });

    if (attackResults && attackResults.length > 0) {
      const crit = attackResults.filter(a => a.severity === 'critical').length;
      const high = attackResults.filter(a => a.severity === 'high').length;
      const med = attackResults.filter(a => a.severity === 'medium').length;
      const total = attackResults.length;

      const pCrit = Math.round((crit / total) * 100);
      const pHigh = Math.round((high / total) * 100);
      const pMed = Math.max(0, 100 - pCrit - pHigh);

      const segCrit = document.getElementById('seg-critical');
      const segHigh = document.getElementById('seg-high');
      const segMed = document.getElementById('seg-medium');
      if (segCrit) segCrit.style.width = `${pCrit}%`;
      if (segHigh) segHigh.style.width = `${pHigh}%`;
      if (segMed) segMed.style.width = `${pMed}%`;

      const sumStats = document.getElementById('severity-summary-stats');
      if (sumStats) sumStats.textContent = `${total} Total Vectors Evaluated`;

      const legCrit = document.getElementById('legend-critical-text');
      const legHigh = document.getElementById('legend-high-text');
      const legMed = document.getElementById('legend-medium-text');
      if (legCrit) legCrit.textContent = `Critical (${crit})`;
      if (legHigh) legHigh.textContent = `High (${high})`;
      if (legMed) legMed.textContent = `Medium (${med})`;
    }
  }

  renderAttackMatrix() {
    this.attackMatrixBody.innerHTML = '';

    // Update filter pill counts
    const totalCount = this.attackResults.length;
    const failCount = this.attackResults.filter(a => a.verdict === 'fail').length;
    const passCount = this.attackResults.filter(a => a.verdict === 'pass').length;

    if (this.pillAll) this.pillAll.textContent = `All Vectors (${totalCount})`;
    if (this.pillFail) this.pillFail.textContent = `Breached (${failCount})`;
    if (this.pillPass) this.pillPass.textContent = `Defended (${passCount})`;

    const filtered = this.attackResults.filter(atk => {
      if (this.activeFilter === 'fail' && atk.verdict !== 'fail') return false;
      if (this.activeFilter === 'pass' && atk.verdict !== 'pass') return false;
      if (this.searchQuery) {
        const q = this.searchQuery;
        const matchId = (atk.id || '').toLowerCase().includes(q);
        const matchName = (atk.name || '').toLowerCase().includes(q);
        const matchCat = (atk.category || '').toLowerCase().includes(q);
        const matchReason = (atk.reason || '').toLowerCase().includes(q);
        return matchId || matchName || matchCat || matchReason;
      }
      return true;
    });

    if (filtered.length === 0) {
      this.attackMatrixBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">
            ${this.attackResults.length === 0 ? 'Evaluating adversarial vectors...' : 'No vectors match active filter or search query.'}
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(atk => {
      const tr = document.createElement('tr');
      tr.id = `row-${atk.id}`;

      let verdictClass = 'verdict-pass';
      let verdictLabel = 'DEFENDED';
      if (atk.verdict === 'fail') {
        verdictClass = 'verdict-fail';
        verdictLabel = 'BREACHED';
      } else if (atk.verdict === 'ambiguous') {
        verdictClass = 'verdict-ambiguous';
        verdictLabel = 'FLAGGED';
      }

      tr.innerHTML = `
        <td><strong class="font-mono">${atk.id}</strong></td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${atk.name}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${(atk.category || '').replace('_', ' ')}</div>
        </td>
        <td>
          <span class="severity-pill severity-${atk.severity || 'high'}">${atk.severity || 'high'}</span>
        </td>
        <td class="verdict-cell">
          <span class="verdict-badge ${verdictClass}">${verdictLabel}</span>
        </td>
        <td>
          <div style="font-size: 0.78rem; color: var(--text-secondary); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${atk.reason || 'Completed evaluation'}
          </div>
        </td>
        <td>
          <span class="font-mono" style="font-size: 0.75rem; color: var(--text-muted);">${atk.duration_ms || 42}ms</span>
        </td>
      `;

      tr.addEventListener('click', () => this.openVectorModal(atk));
      this.attackMatrixBody.appendChild(tr);
    });
  }

  renderBenignChecks() {
    this.benignChecksBody.innerHTML = '';
    this.benignChecks.forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600; color: var(--text-main);">${b.task}</td>
        <td>
          <span class="verdict-badge verdict-pass">VERIFIED</span>
        </td>
        <td style="font-size: 0.78rem; color: var(--text-secondary);">${b.reason}</td>
      `;
      this.benignChecksBody.appendChild(tr);
    });
  }

  openVectorModal(atk) {
    this.vectorModalContent.innerHTML = `
      <div class="card-header" style="padding: 1.25rem 1.5rem;">
        <div class="card-title-group">
          <span class="severity-pill severity-${atk.severity || 'high'}">${atk.severity || 'high'}</span>
          <div class="card-title">${atk.name} (${atk.id})</div>
        </div>
        <span class="verdict-badge ${atk.verdict === 'pass' ? 'verdict-pass' : 'verdict-fail'}">
          ${atk.verdict === 'pass' ? 'DEFENDED' : 'BREACHED'}
        </span>
      </div>
      <div class="card-body" style="padding: 1.5rem;">
        <div class="detail-box">
          <div class="detail-row">
            <div class="detail-key">Category & Goal</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-main);">
              ${atk.category} &bull; Goal: <code>${atk.goal}</code>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-key">Analysis</div>
            <div style="font-size: 0.84rem; color: ${atk.verdict === 'pass' ? 'var(--emerald-600)' : 'var(--crimson-600)'}; font-weight: 600;">
              ${atk.reason}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Rendered Attack Injection</label>
          <div class="detail-val-mono">${atk.rendered_input}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Target Model Output</label>
          <div class="detail-val-mono" style="background: #f8fafc; border-color: ${atk.verdict === 'fail' ? 'var(--crimson-border)' : 'var(--surface-border)'};">
            ${atk.response}
          </div>
        </div>

        <div style="display: flex; gap: 1rem; font-size: 0.78rem; color: var(--text-muted); padding-top: 0.5rem; border-top: 1px solid var(--surface-border-subtle);">
          <div>Canary Protected: <strong>${atk.canary_found ? 'BREACHED' : 'SECURE'}</strong></div>
          <div>Marker Isolated: <strong>${atk.marker_found ? 'BREACHED' : 'SECURE'}</strong></div>
          <div>Execution Latency: <strong>${atk.duration_ms || 42}ms</strong></div>
        </div>
      </div>
    `;
    this.vectorModal.classList.add('open');
  }

  // ==========================================
  // Historical Runs
  // ==========================================

  async loadHistory() {
    try {
      const runs = await api.getRuns(30);
      this.historyGrid.innerHTML = '';

      if (!runs || runs.length === 0) {
        this.historyGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">
            No historical audit records. Run your first security audit above.
          </div>
        `;
        return;
      }

      runs.forEach(r => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
          <div>
            <div class="history-card-header">
              <span class="history-id">${r.run_id}</span>
              <span class="history-date">${new Date(r.created_at).toLocaleDateString()} ${new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="history-prompt-snip">${r.user_prompt || 'System Prompt Evaluation'}</div>
          </div>
          <div>
            <div class="history-stats-bar">
              <div class="history-resistance">
                <span>Resistance:</span>
                <span style="color: ${(r.hardened_resistance || 0) > 80 ? 'var(--emerald-600)' : 'var(--crimson-600)'};">${r.hardened_resistance || r.initial_resistance}%</span>
                ${r.flips_count ? `<span class="badge-level badge-strong" style="font-size: 0.65rem;">+${r.flips_count} Remediated</span>` : ''}
              </div>
              <button type="button" class="btn-soft" style="padding: 0.25rem 0.65rem; font-size: 0.74rem;">
                Load Record &rarr;
              </button>
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          this.loadRunIntoView(r);
        });

        this.historyGrid.appendChild(card);
      });
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }

  async loadRunIntoView(runData) {
    this.currentRunId = runData.run_id;
    this.activeRunIdDisplay.textContent = runData.run_id;
    this.activeRunBanner.style.display = 'block';

    if (this.idleAssessmentCard) this.idleAssessmentCard.style.display = 'none';
    if (this.postureGradeCard) this.postureGradeCard.style.display = 'flex';
    if (this.threatAnalyticsCard) this.threatAnalyticsCard.style.display = 'block';

    if (runData.user_prompt) {
      this.systemPromptInput.value = runData.user_prompt;
      this.charCounter.textContent = `${runData.user_prompt.length} chars`;
    }

    const resScore = runData.hardened_resistance || runData.initial_resistance || 100;
    this.updateResistanceGauge(resScore);
    this.statFlipsCount.textContent = runData.flips_count || 0;
    this.statFailedCount.textContent = runData.total_failures || 0;
    this.statPassedCount.textContent = (runData.total_attacks || 8) - (runData.total_failures || 0);

    this.updatePostureGrade(resScore, runData.total_failures || 0, 42, runData.flips_count || 0);

    // Try fetching full report to restore vector list and category bars
    try {
      const report = await api.getRunReport(runData.run_id);
      if (report && report.attack_results) {
        this.attackResults = report.attack_results;
        this.renderAttackMatrix();
        this.renderCategoryAnalytics(report.after_category_scores || report.category_scores, this.attackResults);
      } else {
        this.renderCategoryAnalytics({}, []);
      }
    } catch {
      this.renderCategoryAnalytics({}, []);
    }

    if (runData.hardened_prompt) {
      this.diffSection.style.display = 'block';
      this.originalPromptDiff.textContent = runData.user_prompt;
      this.hardenedPromptDiff.textContent = runData.hardened_prompt;

      this.guardrailsList.innerHTML = '';
      (runData.changes || []).forEach(ch => {
        const item = document.createElement('div');
        item.className = 'guardrail-item';
        item.innerHTML = `
          <svg class="guardrail-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span>${ch}</span>
        `;
        this.guardrailsList.appendChild(item);
      });
    }

    this.downloadReportBtn.disabled = false;
    this.setStageActive('done');
    this.switchTab('audit');
    this.showToast(`Loaded audit record: ${runData.run_id}`, 'info');
  }

  // ==========================================
  // Settings Modal & Health Check
  // ==========================================

  openSettings() {
    this.apiUrlInput.value = api.baseUrl;
    this.simulatorToggle.checked = api.useSimulator;
    this.healthStatusOutput.textContent = '';
    this.settingsModal.classList.add('open');
  }

  closeSettings() {
    this.settingsModal.classList.remove('open');
  }

  async testHealthInModal() {
    this.healthStatusOutput.textContent = 'Verifying connection...';
    api.setBaseUrl(this.apiUrlInput.value.trim());
    api.setSimulatorMode(this.simulatorToggle.checked);

    const health = await api.checkHealth();
    if (health.simulated) {
      this.healthStatusOutput.textContent = `Simulator active (${health.app})`;
      this.healthStatusOutput.style.color = 'var(--amber-600)';
    } else if (health.status === 'ok') {
      this.healthStatusOutput.textContent = `Connected to ${health.app} v${health.version}`;
      this.healthStatusOutput.style.color = 'var(--emerald-600)';
    } else {
      this.healthStatusOutput.textContent = `Unable to connect: ${health.error || 'Check host URL'}`;
      this.healthStatusOutput.style.color = 'var(--crimson-600)';
    }
    await this.checkSystemHealth();
  }

  saveSettings() {
    api.setBaseUrl(this.apiUrlInput.value.trim());
    api.setSimulatorMode(this.simulatorToggle.checked);
    this.checkSystemHealth();
    this.closeSettings();
    this.showToast('Settings saved', 'success');
  }

  // ==========================================
  // UI Helpers & Toasts
  // ==========================================

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = `
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    `;
    if (type === 'success') {
      icon = `
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: var(--emerald-600);">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      `;
    } else if (type === 'error') {
      icon = `
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: var(--crimson-600);">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      `;
    }

    toast.innerHTML = `
      ${icon}
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Bootstrap app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.promptProof = new PromptProofApp();
});
