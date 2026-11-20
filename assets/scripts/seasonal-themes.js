/**
 * ============================================================
 * AUTOMATIC SEASONAL THEME SYSTEM — FESTIVE MOTION GRAPHICS
 * Semon Jacob | Multimedia Creator & Video Editor Portfolio
 * 
 * Schedule:
 * - November (Month index 10): Diwali Theme (Warm Golden Embers, Diya Flame, Festive Shimmer)
 * - December (Month index 11): Christmas Theme (Gentle Snow Dust, Frost Sparkles, Winter Accents)
 * - January–October (Months 0-9): Normal Theme (Original Portfolio, zero overrides)
 * 
 * Features:
 * - Works automatically every year based on local client date.
 * - Respects prefers-reduced-motion and tab visibility.
 * - Lightweight canvas particle engine (CPU-optimized, throttled, pauses offscreen).
 * - High-contrast Light Mode + Edit Suite Dark Mode compatibility.
 * - Seamless manual testing API: window.SeasonalTheme.setSeason('diwali'|'christmas'|'none'|'auto').
 * ============================================================
 */

(function () {
    'use strict';

    // Festival registry configuration — easily extensible for future seasons
    const SEASON_CALENDAR = {
        10: {
            id: 'diwali',
            name: 'Diwali Festive Edition',
            shortName: 'DIWALI',
            monthName: 'November',
            tagline: 'FESTIVE GRADE // DIWALI EDITION',
            particleColorPalette: ['#ffb100', '#ffcf40', '#ff9800', '#ff5722', '#fff4cc'],
            flowDirection: 'up' // warm rising embers
        },
        11: {
            id: 'christmas',
            name: 'Holiday Christmas Edition',
            shortName: 'CHRISTMAS',
            monthName: 'December',
            tagline: 'HOLIDAY CUT // DECEMBER SPECIAL',
            particleColorPalette: ['#ffffff', '#e0f7fa', '#80deea', '#b2ebf2', '#ffffff'],
            flowDirection: 'down' // gentle falling snow
        }
    };

    class SeasonalThemeManager {
        constructor() {
            this.activeSeason = 'none';
            this.isManualOverride = false;
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.animFrameId = null;
            this.lastTime = 0;
            this.isReducedMotion = false;
            this.isTabVisible = true;

            this.init();
        }

        init() {
            // Check accessibility prefers-reduced-motion
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.isReducedMotion = motionQuery.matches;
            motionQuery.addEventListener('change', (e) => {
                this.isReducedMotion = e.matches;
                if (this.isReducedMotion) {
                    this.stopCanvas();
                } else if (this.activeSeason !== 'none') {
                    this.startCanvas();
                }
            });

            // Listen to tab visibility to save CPU
            document.addEventListener('visibilitychange', () => {
                this.isTabVisible = !document.hidden;
                if (!this.isTabVisible) {
                    this.stopCanvas();
                } else if (this.activeSeason !== 'none' && !this.isReducedMotion) {
                    this.startCanvas();
                }
            });

            // Determine active season from query param, storage, or local date
            const initialSeason = this.resolveActiveSeason();
            this.applySeason(initialSeason, false);

            // Setup Interactive Particle Burst on clicks
            this.setupInteractiveSparkles();

            // Setup HUD Controls once DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.injectSeasonalHUD());
            } else {
                this.injectSeasonalHUD();
            }

            // Expose globally for review, testing, and customization
            window.SeasonalTheme = {
                setSeason: (season, persist) => this.setSeason(season, persist),
                getSeason: () => this.activeSeason,
                getDetectedSeason: () => this.getCalendarSeason(),
                isAutoMode: () => !this.isManualOverride,
                resetToAuto: () => this.setSeason('auto', true)
            };

            console.log(
                `%c[Seasonal Theme Engine]%c Active: %c${this.activeSeason.toUpperCase()}%c (Mode: ${this.isManualOverride ? 'Manual Override' : 'Auto Date-Based'}). Type window.SeasonalTheme.setSeason('diwali'|'christmas'|'none'|'auto') to test anytime.`,
                'color: #ffb100; font-weight: bold;',
                'color: inherit;',
                'color: #22d3d3; font-weight: bold;',
                'color: inherit;'
            );
        }

        /**
         * Resolves the season:
         * 1. URL Query Param: ?season=diwali | ?season=christmas | ?season=none | ?season=auto
         * 2. LocalStorage override
         * 3. Automatic calendar month (10 -> diwali, 11 -> christmas, else -> none)
         */
        resolveActiveSeason() {
            // 1. URL parameter check
            try {
                const params = new URLSearchParams(window.location.search);
                const seasonParam = params.get('season');
                if (seasonParam) {
                    const cleanParam = seasonParam.toLowerCase().trim();
                    if (['diwali', 'christmas', 'none'].includes(cleanParam)) {
                        this.isManualOverride = true;
                        try { sessionStorage.setItem('portfolio_season_override', cleanParam); } catch (e) {}
                        return cleanParam;
                    } else if (cleanParam === 'auto') {
                        this.isManualOverride = false;
                        try {
                            sessionStorage.removeItem('portfolio_season_override');
                            localStorage.removeItem('portfolio_season_override');
                        } catch (e) {}
                    }
                }
            } catch (e) {}

            // 2. Storage override check
            try {
                const storedOverride = sessionStorage.getItem('portfolio_season_override') || 
                                       localStorage.getItem('portfolio_season_override');
                if (storedOverride && ['diwali', 'christmas', 'none'].includes(storedOverride)) {
                    this.isManualOverride = true;
                    return storedOverride;
                }
            } catch (e) {}

            // 3. Automatic Calendar Date Check (Every year in November & December)
            this.isManualOverride = false;
            return this.getCalendarSeason();
        }

        /**
         * Returns the calendar season based on local month
         * Month 10 = November (Diwali)
         * Month 11 = December (Christmas)
         * Months 0–9 = January to October (None)
         */
        getCalendarSeason() {
            const currentMonth = new Date().getMonth();
            const seasonConfig = SEASON_CALENDAR[currentMonth];
            return seasonConfig ? seasonConfig.id : 'none';
        }

        /**
         * Applies the active season to the DOM
         */
        applySeason(seasonName, showNotification = true) {
            this.activeSeason = seasonName;
            document.documentElement.setAttribute('data-season', seasonName);

            // Update seasonal canvas
            if (seasonName === 'none' || this.isReducedMotion) {
                this.stopCanvas();
            } else {
                this.initCanvas();
                this.startCanvas();
            }

            // Update UI HUD indicators
            this.updateHUDDisplay();

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('seasonchange', {
                detail: { season: seasonName, isManual: this.isManualOverride }
            }));

            // Optional HUD toast feedback
            if (showNotification && typeof window.showHudToast === 'function') {
                const label = seasonName === 'diwali' ? 'FESTIVE DIWALI THEME ENGAGED' :
                              seasonName === 'christmas' ? 'HOLIDAY CHRISTMAS THEME ENGAGED' :
                              'STANDARD PORTFOLIO THEME RESTORED';
                window.showHudToast(label, true);
            }
        }

        /**
         * Public API to switch season
         */
        setSeason(seasonName, persist = true) {
            const clean = String(seasonName).toLowerCase().trim();
            if (clean === 'auto') {
                this.isManualOverride = false;
                try {
                    localStorage.removeItem('portfolio_season_override');
                    sessionStorage.removeItem('portfolio_season_override');
                } catch (e) {}
                this.applySeason(this.getCalendarSeason(), true);
            } else if (['diwali', 'christmas', 'none'].includes(clean)) {
                this.isManualOverride = true;
                if (persist) {
                    try {
                        localStorage.setItem('portfolio_season_override', clean);
                        sessionStorage.setItem('portfolio_season_override', clean);
                    } catch (e) {}
                }
                this.applySeason(clean, true);
            }
        }

        /* ============================================================
           CANVAS FESTIVE PARTICLE ATMOSPHERE ENGINE
           ============================================================ */

        initCanvas() {
            if (!this.canvas) {
                this.canvas = document.getElementById('seasonalAtmosphereCanvas');
                if (!this.canvas) {
                    this.canvas = document.createElement('canvas');
                    this.canvas.id = 'seasonalAtmosphereCanvas';
                    this.canvas.setAttribute('aria-hidden', 'true');
                    document.body.prepend(this.canvas);
                }
                this.ctx = this.canvas.getContext('2d', { alpha: true });

                window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });
            }

            this.resizeCanvas();
            this.spawnParticles();
        }

        resizeCanvas() {
            if (!this.canvas) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.canvas.width = w * dpr;
            this.canvas.height = h * dpr;
            this.canvas.style.width = w + 'px';
            this.canvas.style.height = h + 'px';
            if (this.ctx) {
                this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
        }

        spawnParticles() {
            const isMobile = window.innerWidth < 768;
            const count = isMobile ? 18 : 34; // lightweight, smooth 60fps
            const w = window.innerWidth;
            const h = window.innerHeight;

            const currentMonth = new Date().getMonth();
            const config = (this.activeSeason === 'diwali') ? SEASON_CALENDAR[10] :
                           (this.activeSeason === 'christmas') ? SEASON_CALENDAR[11] : null;

            const palette = config ? config.particleColorPalette : ['#ffb100', '#ffffff'];
            const flow = config ? config.flowDirection : 'up';

            this.particles = [];
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 1.2 + Math.random() * 2.6,
                    speedY: flow === 'up' 
                        ? -(0.25 + Math.random() * 0.55) 
                        : (0.35 + Math.random() * 0.75),
                    speedX: (Math.random() - 0.5) * 0.35,
                    swayOffset: Math.random() * Math.PI * 2,
                    swaySpeed: 0.015 + Math.random() * 0.02,
                    swayRadius: 0.6 + Math.random() * 1.4,
                    alpha: 0.2 + Math.random() * 0.65,
                    pulseSpeed: 0.02 + Math.random() * 0.03,
                    color: palette[Math.floor(Math.random() * palette.length)],
                    isSpark: Math.random() > 0.45,
                    rotation: Math.random() * Math.PI,
                    rotSpeed: (Math.random() - 0.5) * 0.03
                });
            }
        }

        startCanvas() {
            if (this.animFrameId || this.isReducedMotion || !this.isTabVisible) return;
            this.lastTime = performance.now();
            const loop = (timestamp) => {
                const delta = Math.min((timestamp - this.lastTime) / 1000, 0.1);
                this.lastTime = timestamp;
                this.render(delta);
                if (this.activeSeason !== 'none' && !this.isReducedMotion && this.isTabVisible) {
                    this.animFrameId = requestAnimationFrame(loop);
                } else {
                    this.animFrameId = null;
                }
            };
            this.animFrameId = requestAnimationFrame(loop);
        }

        stopCanvas() {
            if (this.animFrameId) {
                cancelAnimationFrame(this.animFrameId);
                this.animFrameId = null;
            }
            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        render(delta) {
            if (!this.ctx || !this.canvas || this.activeSeason === 'none') return;
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.ctx.clearRect(0, 0, w, h);

            const isDiwali = this.activeSeason === 'diwali';

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];

                // Movement physics
                p.y += p.speedY * (delta * 60);
                p.swayOffset += p.swaySpeed;
                p.x += (p.speedX + Math.sin(p.swayOffset) * p.swayRadius) * (delta * 60);
                p.rotation += p.rotSpeed;

                // Subtle alpha breathing
                const currentAlpha = Math.max(0.08, Math.min(0.9, p.alpha + Math.sin(p.swayOffset * 2) * 0.25));

                // Screen wrapping
                if (isDiwali) {
                    if (p.y < -10) {
                        p.y = h + 10;
                        p.x = Math.random() * w;
                    }
                } else {
                    if (p.y > h + 10) {
                        p.y = -10;
                        p.x = Math.random() * w;
                    }
                }
                if (p.x < -20) p.x = w + 20;
                if (p.x > w + 20) p.x = -20;

                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);
                this.ctx.globalAlpha = currentAlpha;
                this.ctx.fillStyle = p.color;

                if (isDiwali) {
                    // Warm golden ember or 4-pointed micro-stardust sparkle
                    if (p.isSpark) {
                        this.drawSparkleStar(this.ctx, p.size * 1.5);
                    } else {
                        // Soft glowing orb
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                } else {
                    // Christmas: gentle soft crystalline snowflake or snow dust
                    if (p.isSpark) {
                        this.drawSnowflakeCross(this.ctx, p.size * 1.8);
                    } else {
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, p.size * 0.85, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }

                this.ctx.restore();
            }
        }

        drawSparkleStar(ctx, r) {
            ctx.beginPath();
            ctx.moveTo(0, -r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.quadraticCurveTo(0, 0, 0, r);
            ctx.quadraticCurveTo(0, 0, -r, 0);
            ctx.quadraticCurveTo(0, 0, 0, -r);
            ctx.fill();
        }

        drawSnowflakeCross(ctx, r) {
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = ctx.fillStyle;
            ctx.beginPath();
            ctx.moveTo(-r, 0);
            ctx.lineTo(r, 0);
            ctx.moveTo(0, -r);
            ctx.lineTo(0, r);
            ctx.moveTo(-r * 0.7, -r * 0.7);
            ctx.lineTo(r * 0.7, r * 0.7);
            ctx.moveTo(r * 0.7, -r * 0.7);
            ctx.lineTo(-r * 0.7, r * 0.7);
            ctx.stroke();
        }

        /* ============================================================
           INTERACTIVE CLICK SPARKLES
           Clicking project cards, buttons, or thumbnails spawns
           subtle festive particle bursts
           ============================================================ */
        setupInteractiveSparkles() {
            document.addEventListener('click', (e) => {
                if (this.activeSeason === 'none' || this.isReducedMotion) return;

                const target = e.target.closest(
                    '.btn-action, .film-frame-card, .featured-video-card, .play-overlay-btn, .nav-brand, .floating-balloon-theme-toggle'
                );
                if (!target) return;

                const isDiwali = this.activeSeason === 'diwali';
                const colorPalette = isDiwali 
                    ? ['#ffb100', '#ffcf40', '#ff9800', '#ffffff'] 
                    : ['#ffffff', '#22d3d3', '#80deea'];

                const count = 6;
                for (let i = 0; i < count; i++) {
                    const spark = document.createElement('div');
                    spark.className = 'festive-sparkle-particle';
                    const size = 3 + Math.random() * 4;
                    const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
                    const distance = 24 + Math.random() * 32;
                    const dx = Math.cos(angle) * distance + 'px';
                    const dy = Math.sin(angle) * distance + 'px';

                    spark.style.width = size + 'px';
                    spark.style.height = size + 'px';
                    spark.style.left = e.clientX + 'px';
                    spark.style.top = e.clientY + 'px';
                    spark.style.backgroundColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
                    spark.style.boxShadow = `0 0 8px ${spark.style.backgroundColor}`;
                    spark.style.setProperty('--dx', dx);
                    spark.style.setProperty('--dy', dy);

                    document.body.appendChild(spark);
                    setTimeout(() => spark.remove(), 700);
                }
            }, { passive: true });
        }

        /* ============================================================
           DISCREET HUD SEASONAL CONTROL & PREVIEW
           ============================================================ */
        injectSeasonalHUD() {
            // Find scrubber header container or footer to place the subtle HUD pill
            const targetContainer = document.querySelector('.scrubber-header .nav-container') || document.body;
            let hud = document.getElementById('seasonalHudControl');
            if (hud) return;

            hud = document.createElement('div');
            hud.className = 'seasonal-hud-control';
            hud.id = 'seasonalHudControl';

            hud.innerHTML = `
                <button type="button" class="seasonal-hud-trigger" id="seasonalHudTrigger" aria-expanded="false" title="Seasonal Theme Settings (Automatic & Preview)">
                    <span id="seasonalHudIcon"><span class="diya-flame-icon"></span></span>
                    <span id="seasonalHudLabel">DIWALI (AUTO)</span>
                    <i class="fas fa-chevron-up" style="font-size: 0.55rem; opacity: 0.6;"></i>
                </button>
                <div class="seasonal-dropdown-menu" id="seasonalDropdownMenu" role="menu">
                    <div style="padding: 4px 10px 6px; font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); border-bottom: 1px solid rgba(255,255,255,0.08);">
                        SEASONAL MOTION GRAPHICS
                    </div>
                    <button type="button" class="seasonal-option-btn" data-season-select="auto">
                        <span><i class="fas fa-calendar-check" style="width: 14px;"></i> Automatic (Calendar)</span>
                        <span style="font-size: 0.62rem; opacity: 0.7;">Default</span>
                    </button>
                    <button type="button" class="seasonal-option-btn" data-season-select="diwali">
                        <span><span class="diya-flame-icon" style="margin-right: 4px;"></span> Diwali Edition</span>
                        <span style="font-size: 0.62rem; color: #ffb100;">Nov</span>
                    </button>
                    <button type="button" class="seasonal-option-btn" data-season-select="christmas">
                        <span><span class="snowflake-micro-icon" style="margin-right: 4px;"></span> Christmas Edition</span>
                        <span style="font-size: 0.62rem; color: #22d3d3;">Dec</span>
                    </button>
                    <button type="button" class="seasonal-option-btn" data-season-select="none">
                        <span><i class="fas fa-power-off" style="width: 14px;"></i> Original (Off)</span>
                        <span style="font-size: 0.62rem; opacity: 0.7;">Jan–Oct</span>
                    </button>
                </div>
            `;

            // Insert neatly before mobile toggle or at suitable spot in nav
            const navRightGroup = document.querySelector('.nav-container > div:last-child');
            if (navRightGroup) {
                navRightGroup.prepend(hud);
            } else {
                targetContainer.appendChild(hud);
            }

            // Dropdown toggle logic
            const trigger = hud.querySelector('#seasonalHudTrigger');
            const menu = hud.querySelector('#seasonalDropdownMenu');

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = menu.classList.contains('is-open');
                menu.classList.toggle('is-open', !isOpen);
                trigger.setAttribute('aria-expanded', !isOpen);
            });

            document.addEventListener('click', (e) => {
                if (!hud.contains(e.target)) {
                    menu.classList.remove('is-open');
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });

            // Menu option clicks
            menu.querySelectorAll('.seasonal-option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const chosen = btn.getAttribute('data-season-select');
                    this.setSeason(chosen, true);
                    menu.classList.remove('is-open');
                    trigger.setAttribute('aria-expanded', 'false');
                });
            });

            this.updateHUDDisplay();
        }

        updateHUDDisplay() {
            const trigger = document.getElementById('seasonalHudTrigger');
            const label = document.getElementById('seasonalHudLabel');
            const icon = document.getElementById('seasonalHudIcon');
            const menu = document.getElementById('seasonalDropdownMenu');

            if (!label || !icon) return;

            const isDiwali = this.activeSeason === 'diwali';
            const isChristmas = this.activeSeason === 'christmas';
            const isAuto = !this.isManualOverride;

            if (isDiwali) {
                icon.innerHTML = '<span class="diya-flame-icon"></span>';
                label.textContent = isAuto ? 'DIWALI (AUTO)' : 'DIWALI (ACTIVE)';
                if (trigger) trigger.title = 'Current: Diwali Festive Theme (Click to switch season)';
            } else if (isChristmas) {
                icon.innerHTML = '<span class="snowflake-micro-icon"></span>';
                label.textContent = isAuto ? 'HOLIDAY (AUTO)' : 'HOLIDAY (ACTIVE)';
                if (trigger) trigger.title = 'Current: Christmas Holiday Theme (Click to switch season)';
            } else {
                icon.innerHTML = '<i class="fas fa-circle-notch" style="font-size: 0.7rem;"></i>';
                label.textContent = isAuto ? 'STANDARD (AUTO)' : 'STANDARD';
                if (trigger) trigger.title = 'Current: Standard Theme (Jan–Oct) (Click to preview festive)';
            }

            // Update active option in menu
            if (menu) {
                menu.querySelectorAll('.seasonal-option-btn').forEach(btn => {
                    const targetSeason = btn.getAttribute('data-season-select');
                    if (isAuto && targetSeason === 'auto') {
                        btn.classList.add('is-active');
                    } else if (!isAuto && targetSeason === this.activeSeason) {
                        btn.classList.add('is-active');
                    } else {
                        btn.classList.remove('is-active');
                    }
                });
            }
        }
    }

    // Auto-instantiate early so the page initializes immediately with no flicker
    if (typeof window !== 'undefined') {
        window.seasonalThemeInstance = new SeasonalThemeManager();
    }
})();
