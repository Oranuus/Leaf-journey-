// --- ENVIRONMENT & SEASONS SYSTEM (10 KM ROTATION) ---

// Preload Environment Backgrounds
const imgNight = new Image(); imgNight.src = 'night.png';
const imgSpring = new Image(); imgSpring.src = 'spring.png';
const imgDay = new Image(); imgDay.src = 'day.png';

// Preload All 4 Rain Clouds
const imgClouds = [
    new Image(), new Image(), new Image(), new Image()
];
imgClouds[0].src = 'cloud1.png';
imgClouds[1].src = 'cloud2.png';
imgClouds[2].src = 'cloud3.png'; // إعادة سحابة 3 بناءً على طلبك
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
    KM_PER_ENV: 10, // التدوير كل 10 كيلو

    init() {
        if (typeof GameData.accumulatedKm !== 'number') {
            GameData.accumulatedKm = 0;
        }
        this.particles = [];
        this.clouds = [];
        this.lastEnvIndex = this.getCurrentEnvIndex();
    },

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

        // 🍃 0. البيئة القياسية (Standard Forest)
        // تم إلغاء أي دوائر خضراء تماماً للحصول على جو ناعم وصافٍ.
        if (currentIdx === 0) {
            // لا يتم ترسبن أي جسيمات
        }

        // 🌧️ 1. الشتاء المطري (Rainy Winter)
        else if (currentIdx === 1) {
            // توليد السحب (بحد أقصى 3 سحب في الشاشة وفي أي مكان راسي)
            if (this.clouds.length < 3 && Math.random() < 0.015) {
                const cloudImgIndex = Math.floor(Math.random() * imgClouds.length);
                this.clouds.push({
                    img: imgClouds[cloudImgIndex],
                    x: width + 150,
                    y: Math.random() * (height - 120), // ترسبن في أي مكان بالارتفاع
                    speed: Math.random() * 0.6 + 0.3,  // حركة بطيئة ومريحة
                    scale: Math.random() * 0.25 + 0.22 // مقاسات متنوعة (صغيرة إلى متوسطة)
                });
            }

            // قطرات مطر متفرقة وهادئة تتجه للناحية الأخرى (يمين)
            if (frame % 4 === 0) { // كثرة اقل
                this.particles.push({
                    type: 'raindrop',
                    x: Math.random() * (width + 200) - 100,
                    y: -30,
                    vx: Math.random() * 1.5 + 1.2, // اتجاه لليمين بدلاً من اليسار
                    vy: Math.random() * 3.5 + 6.5, // سقوط هادئ وغير سريع
                    size: Math.random() * 5 + 9,   // تصغير حجم القطرة
                    angle: Math.atan2(7, 1.5)     // زاوية الميلان لليمين
                });
            }
        }

        // 🌙 2. الليل (Night Realm)
        else if (currentIdx === 2) {
            // اليراعات ترسبن كمجموعات متفرقة وأحياناً لا توجد يراعات
            if (frame % 200 === 0 && Math.random() < 0.65) {
                const clusterX = width + 50;
                const clusterY = Math.random() * (height - 120) + 60;
                const countInGroup = Math.floor(Math.random() * 4) + 3; // مجموعة من 3 إلى 6 يراعات

                for (let i = 0; i < countInGroup; i++) {
                    this.particles.push({
                        type: 'firefly',
                        x: clusterX + (Math.random() - 0.5) * 100,
                        y: clusterY + (Math.random() - 0.5) * 100,
                        radius: Math.random() * 0.8 + 0.6, // تصغير الحجم للربع
                        alpha: Math.random() * 0.5 + 0.4,
                        vAlpha: (Math.random() * 0.015 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
                        vx: (Math.random() - 0.5) * 0.8 - 0.4,
                        vy: (Math.random() - 0.5) * 0.6
                    });
                }
            }
        }

        // 🌸 3. الربيع (Spring Blossom)
        else if (currentIdx === 3) {
            if (frame % 7 === 0) {
                this.particles.push({
                    type: 'sakura_petal',
                    x: Math.random() * (width + 100) - 20,
                    y: -30,
                    size: Math.random() * 12 + 15,
                    angle: Math.random() * Math.PI * 2,
                    vAngle: (Math.random() - 0.5) * 0.04,
                    vx: -(Math.random() * 1.8 + 1),
                    vy: Math.random() * 1.5 + 1,
                    sway: Math.random() * Math.PI * 2
                });
            }
        }

        // --- تحديث حركة السحب ---
        this.clouds.forEach(c => c.x -= c.speed);
        this.clouds = this.clouds.filter(c => c.x > -350);

        // --- تحديث حركة الجسيمات ---
        this.particles.forEach(p => {
            if (p.type === 'firefly') {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha += p.vAlpha;
                if (p.alpha >= 0.9 || p.alpha <= 0.25) p.vAlpha *= -1;
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

        // تنظيف الجسيمات الخارجة عن الشاشة
        this.particles = this.particles.filter(p => 
            p.x > -150 && p.x < width + 250 && p.y > -80 && p.y < height + 120
        );
    },

    drawBackgroundAndEffects(ctx, width, height, baseDayImg) {
        const currentIdx = this.getCurrentEnvIndex();

        // 1. رسم صور الخلفية لكل بيئة
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

        // 2. رسم السحب (بحد أقصى 3 سحب، وبأحجام متوسطة إلى صغيرة)
        if (currentIdx === 1) {
            this.clouds.forEach(c => {
                if (c.img.complete && c.img.naturalWidth > 0) {
                    ctx.save();
                    const w = c.img.width * c.scale;
                    const h = c.img.height * c.scale;
                    ctx.globalAlpha = 0.88;
                    ctx.drawImage(c.img, c.x, c.y, w, h);
                    ctx.restore();
                }
            });
        }

        // 3. رسم الجسيمات
        this.particles.forEach(p => {
            ctx.save();

            // 🌧️ قطرات المطر (مائلة لليمين، صغيرة وهادئة)
            if (p.type === 'raindrop') {
                if (imgRainDrop.complete && imgRainDrop.naturalWidth > 0) {
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.angle - Math.PI / 2);
                    ctx.globalAlpha = 0.75;
                    ctx.drawImage(imgRainDrop, -p.size/2, -p.size/2, p.size, p.size * 1.4);
                } else {
                    ctx.strokeStyle = "rgba(174, 216, 238, 0.5)";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2);
                    ctx.stroke();
                }
            }

            // 🌙 اليراعات (صغيرة الحجم ولون أصفر ذهبي دافئ ينبض بهدوء)
            else if (p.type === 'firefly') {
                ctx.globalCompositeOperation = 'lighter';
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
                grad.addColorStop(0, `rgba(255, 235, 120, ${p.alpha})`);
                grad.addColorStop(0.4, `rgba(255, 190, 40, ${p.alpha * 0.6})`);
                grad.addColorStop(1, 'rgba(255, 190, 40, 0)');
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // 🌸 بتلات الربيع
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