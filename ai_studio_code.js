// --- ENVIRONMENT & SEASONS SYSTEM (10 KM ROTATION) ---

// Preload Environment Backgrounds
const imgNight = new Image(); imgNight.src = 'night.png';
const imgSpring = new Image(); imgSpring.src = 'spring.png';
const imgDay = new Image(); imgDay.src = 'day.png';

// Preload 4 Rain Clouds
const imgClouds = [
    new Image(), new Image(), new Image(), new Image()
];
imgClouds[0].src = 'cloud1.png';
imgClouds[1].src = 'cloud2.png';
imgClouds[2].src = 'cloud3.png';
imgClouds[3].src = 'cloud4.png';

// Preload Rain & Spring Particles
const imgRainDrop = new Image(); imgRainDrop.src = 'raindrop.png';
const imgPetal = new Image(); imgPetal.src = 'petal.png';

const EnvironmentSystem = {
    environments: [
        { id: 'standard', name: 'Standard Forest', icon: '🍃' },
        { id: 'rainy', name: 'Rainy Winter', icon: '🌧️' },
        { id: 'night', name: 'Night Realm', icon: '🌙' },
        { id: 'spring', name: 'Spring Blossom', icon: '🌸' }
    ],
    particles: [],
    clouds: [],
    lastEnvIndex: 0,
    KM_PER_ENV: 10, // تم التغيير إلى 10 كيلو كحد أقصى لكل بيئة

    init() {
        if (typeof GameData.accumulatedKm !== 'number') {
            GameData.accumulatedKm = 0;
        }
        this.particles = [];
        this.clouds = [];
        this.lastEnvIndex = this.getCurrentEnvIndex();
    },

    // حساب البيئة بناءً على 10 كيلو
    getCurrentEnvIndex() {
        const km = GameData.accumulatedKm || 0;
        return Math.floor(km / this.KM_PER_ENV) % this.environments.length;
    },

    getCurrentEnvInfo() {
        const idx = this.getCurrentEnvIndex();
        return this.environments[idx];
    },

    getKmRemainingInEnv() {
        const km = GameData.accumulatedKm || 0;
        const progressInCurrent = km % this.KM_PER_ENV;
        return (this.KM_PER_ENV - progressInCurrent).toFixed(2);
    },

    addKm(kmAmount) {
        if (typeof GameData.accumulatedKm !== 'number') GameData.accumulatedKm = 0;
        GameData.accumulatedKm += kmAmount;
    },

    update(width, height) {
        const currentIdx = this.getCurrentEnvIndex();

        // 🍃 0. البيئة القياسية (أوراق شجر خضراء هادئة)
        if (currentIdx === 0) {
            if (frame % 8 === 0) {
                this.particles.push({
                    type: 'green_leaf',
                    x: width + 40,
                    y: Math.random() * height,
                    size: Math.random() * 6 + 4,
                    vx: -(Math.random() * 2 + 1.5),
                    vy: Math.sin(frame * 0.05) * 0.8,
                    angle: Math.random() * Math.PI * 2
                });
            }
        }

        // 🌧️ 1. الشتاء المطري (السحب الأربعة + المطر المائل)
        else if (currentIdx === 1) {
            // توليد السحب الأربعة بتنوع
            if (this.clouds.length < 5 && Math.random() < 0.03) {
                const cloudImgIndex = Math.floor(Math.random() * imgClouds.length);
                this.clouds.push({
                    img: imgClouds[cloudImgIndex],
                    x: width + 150,
                    y: Math.random() * (height * 0.3) - 20, // الجزء العلوي
                    speed: Math.random() * 1.5 + 0.5,
                    scale: Math.random() * 0.4 + 0.6
                });
            }

            // توليد قطرات المطر
            if (frame % 2 === 0) {
                for (let i = 0; i < 3; i++) {
                    this.particles.push({
                        type: 'raindrop',
                        x: Math.random() * (width + 200) - 50,
                        y: -30,
                        vx: -(Math.random() * 3 + 2), // مائل لليسار
                        vy: Math.random() * 8 + 14,   // سقوط سريع
                        size: Math.random() * 15 + 20,
                        angle: Math.atan2(16, -3)     // اتجاه زاوية السقوط
                    });
                }
            }
        }

        // 🌙 2. الليل (حشرات مضيئة موهجة بالكامل بالكود)
        else if (currentIdx === 2) {
            if (this.particles.length < 25 && Math.random() < 0.2) {
                this.particles.push({
                    type: 'firefly',
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 3 + 2,
                    alpha: Math.random() * 0.5 + 0.4,
                    vAlpha: (Math.random() * 0.02 + 0.01) * (Math.random() < 0.5 ? 1 : -1),
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: (Math.random() - 0.5) * 1.2
                });
            }
        }

        // 🌸 3. الربيع (تأرجح بتلات الزهور)
        else if (currentIdx === 3) {
            if (frame % 6 === 0) {
                this.particles.push({
                    type: 'sakura_petal',
                    x: Math.random() * (width + 100) - 20,
                    y: -30,
                    size: Math.random() * 14 + 16,
                    angle: Math.random() * Math.PI * 2,
                    vAngle: (Math.random() - 0.5) * 0.04,
                    vx: -(Math.random() * 2 + 1),
                    vy: Math.random() * 1.8 + 1.2,
                    sway: Math.random() * Math.PI * 2
                });
            }
        }

        // --- تحديث السحب ---
        this.clouds.forEach(c => c.x -= c.speed);
        this.clouds = this.clouds.filter(c => c.x > -300);

        // --- تحديث الجسيمات ---
        this.particles.forEach(p => {
            if (p.type === 'firefly') {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha += p.vAlpha;
                if (p.alpha >= 0.95 || p.alpha <= 0.2) p.vAlpha *= -1;
            } else if (p.type === 'sakura_petal') {
                p.sway += 0.04;
                p.x += p.vx + Math.sin(p.sway) * 0.8;
                p.y += p.vy;
                p.angle += p.vAngle;
            } else {
                p.x += p.vx;
                p.y += p.vy;
            }
        });

        // تنظيف الجسيمات الخارجيّة
        this.particles = this.particles.filter(p => 
            p.x > -100 && p.x < width + 200 && p.y > -50 && p.y < height + 100
        );
    },

    drawBackgroundAndEffects(ctx, width, height, baseDayImg) {
        const currentIdx = this.getCurrentEnvIndex();

        // 1. رسم صور الخلفية المناسبة لكل بيئة
        if (currentIdx === 1) { // الشتاء
            if (imgDay.complete && imgDay.naturalWidth > 0) {
                ctx.drawImage(imgDay, -width/2, -height/2, width * 2, height * 2);
            } else if (baseDayImg.complete && baseDayImg.naturalWidth > 0) {
                ctx.drawImage(baseDayImg, -width/2, -height/2, width * 2, height * 2);
            }
        } else if (currentIdx === 2) { // الليل
            if (imgNight.complete && imgNight.naturalWidth > 0) {
                ctx.drawImage(imgNight, -width/2, -height/2, width * 2, height * 2);
            } else {
                ctx.fillStyle = "#0a0d1a"; ctx.fillRect(-width, -height, width * 3, height * 3);
            }
        } else if (currentIdx === 3) { // الربيع
            if (imgSpring.complete && imgSpring.naturalWidth > 0) {
                ctx.drawImage(imgSpring, -width/2, -height/2, width * 2, height * 2);
            } else {
                ctx.fillStyle = "#fce4ec"; ctx.fillRect(-width, -height, width * 3, height * 3);
            }
        } else { // الغابة القياسية
            if (baseDayImg.complete && baseDayImg.naturalWidth > 0) {
                ctx.drawImage(baseDayImg, -width/2, -height/2, width * 2, height * 2);
            } else {
                ctx.fillStyle = "#162447"; ctx.fillRect(-width, -height, width * 3, height * 3);
            }
        }

        // 2. رسم السحب الأربعة في حالة الشتاء المطري
        if (currentIdx === 1) {
            this.clouds.forEach(c => {
                if (c.img.complete && c.img.naturalWidth > 0) {
                    ctx.save();
                    const w = c.img.width * c.scale;
                    const h = c.img.height * c.scale;
                    ctx.globalAlpha = 0.85;
                    ctx.drawImage(c.img, c.x, c.y, w, h);
                    ctx.restore();
                }
            });
        }

        // 3. رسم الجسيمات بحسب النوع
        this.particles.forEach(p => {
            ctx.save();
            
            // 🍃 أوراق شجر خضراء
            if (p.type === 'green_leaf') {
                ctx.fillStyle = "rgba(118, 255, 3, 0.7)";
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            }

            // 🌧️ قطرات المطر (استخدام صورة raindrop.png مائلة)
            else if (p.type === 'raindrop') {
                if (imgRainDrop.complete && imgRainDrop.naturalWidth > 0) {
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.angle - Math.PI / 2);
                    ctx.globalAlpha = 0.8;
                    ctx.drawImage(imgRainDrop, -p.size/2, -p.size/2, p.size, p.size * 1.5);
                } else {
                    ctx.strokeStyle = "rgba(174, 216, 238, 0.6)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2);
                    ctx.stroke();
                }
            }

            // 🌙 حشرات مضيئة (توهج شعاعي رائع ومضيء بالكامل بالكود)
            else if (p.type === 'firefly') {
                ctx.globalCompositeOperation = 'lighter'; // لجعل الضوء يضيء اللعبة
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
                grad.addColorStop(0, `rgba(220, 255, 100, ${p.alpha})`);
                grad.addColorStop(0.3, `rgba(130, 255, 40, ${p.alpha * 0.7})`);
                grad.addColorStop(1, 'rgba(130, 255, 40, 0)');
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // 🌸 بتلات الربيع (استخدام صورة petal.png مع تدوير إنسيابي)
            else if (p.type === 'sakura_petal') {
                if (imgPetal.complete && imgPetal.naturalWidth > 0) {
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.angle);
                    ctx.globalAlpha = 0.9;
                    ctx.drawImage(imgPetal, -p.size/2, -p.size/2, p.size, p.size);
                } else {
                    ctx.translate(p.x, p.y); ctx.rotate(p.angle);
                    ctx.fillStyle = "#ffb7c5";
                    ctx.beginPath(); ctx.ellipse(0, 0, p.size/2, p.size/4, 0, 0, Math.PI * 2); ctx.fill();
                }
            }
            
            ctx.restore();
        });
    }
};