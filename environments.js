// --- ENVIRONMENT & SEASONS SYSTEM ---
const imgNight = new Image(); imgNight.src = 'night.png';

const EnvironmentSystem = {
    environments: [
        { id: 'standard', name: 'Standard Forest', icon: '🍃' },
        { id: 'summer', name: 'Sunny Summer', icon: '☀️' },
        { id: 'autumn', name: 'Autumn Sunset', icon: '🍁' },
        { id: 'sakura', name: 'Sakura Dawn', icon: '🌸' }
    ],
    particles: [],
    lastEnvIndex: 0,

    init() {
        if (typeof GameData.accumulatedKm !== 'number') {
            GameData.accumulatedKm = 0;
        }
        this.particles = [];
        this.lastEnvIndex = this.getCurrentEnvIndex();
    },

    // الاعتماد المطلق على المسافة التراكمية المحفوظة
    getCurrentEnvIndex() {
        const km = GameData.accumulatedKm || 0;
        return Math.floor(km / 15) % this.environments.length;
    },

    getCurrentEnvInfo() {
        const idx = this.getCurrentEnvIndex();
        return this.environments[idx];
    },

    getKmRemainingInEnv() {
        const km = GameData.accumulatedKm || 0;
        const progressInCurrent = km % 15;
        return (15 - progressInCurrent).toFixed(2);
    },

    addKm(kmAmount) {
        if (typeof GameData.accumulatedKm !== 'number') GameData.accumulatedKm = 0;
        GameData.accumulatedKm += kmAmount;
    },

    update(width, height) {
        const currentIdx = this.getCurrentEnvIndex();

        // إطلاق جزيئات الطقس المميزة لكل بيئة
        if (frame % 5 === 0) {
            if (currentIdx === 0) { // 🍃 الغابة العادية
                this.particles.push({
                    type: 'green_leaf',
                    x: width + 30,
                    y: Math.random() * height,
                    size: Math.random() * 5 + 4,
                    vx: -(Math.random() * 2 + 1.5),
                    vy: Math.sin(frame * 0.05) * 0.8
                });
            } else if (currentIdx === 1) { // ☀️ الصيف المشرق
                this.particles.push({
                    type: 'dandelion',
                    x: width + 50,
                    y: Math.random() * height,
                    size: Math.random() * 6 + 4,
                    vx: -(Math.random() * 2.5 + 1),
                    vy: Math.sin(frame * 0.08) * 1.2
                });
            } else if (currentIdx === 2) { // 🍁 الغروب الخريفي
                this.particles.push({
                    type: 'autumn_leaf',
                    x: Math.random() * width + width * 0.2,
                    y: -20,
                    size: Math.random() * 12 + 10,
                    angle: Math.random() * Math.PI * 2,
                    vAngle: (Math.random() - 0.5) * 0.05,
                    vx: -(Math.random() * 3 + 2),
                    vy: Math.random() * 2 + 1.5
                });
            } else if (currentIdx === 3) { // 🌸 فجر الربيع
                if (Math.random() < 0.6) {
                    this.particles.push({
                        type: 'sakura_petal',
                        x: Math.random() * width + width * 0.3,
                        y: -20,
                        size: Math.random() * 10 + 8,
                        angle: Math.random() * Math.PI,
                        vAngle: 0.02,
                        vx: -(Math.random() * 2 + 1),
                        vy: Math.random() * 1.5 + 1
                    });
                } else {
                    this.particles.push({
                        type: 'firefly',
                        x: Math.random() * width,
                        y: Math.random() * height,
                        size: Math.random() * 5 + 4,
                        alpha: 1.0,
                        vAlpha: -0.02,
                        vx: (Math.random() - 0.5) * 1.5,
                        vy: (Math.random() - 0.5) * 1.5
                    });
                }
            }
        }

        // تحديث مواقع الجسيمات
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.angle !== undefined) p.angle += (p.vAngle || 0);
            if (p.alpha !== undefined) {
                p.alpha += p.vAlpha;
                if (p.alpha <= 0.2 || p.alpha >= 1) p.vAlpha *= -1;
            }
        });

        // تنظيف الجسيمات الخارجة عن الشاشة
        this.particles = this.particles.filter(p => p.x > -50 && p.x < width + 100 && p.y > -50 && p.y < height + 100);
    },

    drawBackgroundAndEffects(ctx, width, height, baseDayImg) {
        const currentIdx = this.getCurrentEnvIndex();

        // 1. رسم صورة الخلفية الأساسية
        if (currentIdx === 3) { // فجر الربيع (خلفية الليل)
            if (imgNight.complete && imgNight.naturalWidth > 0) {
                ctx.drawImage(imgNight, -width/2, -height/2, width * 2, height * 2);
            } else {
                ctx.fillStyle = "#0c102b"; ctx.fillRect(-width, -height, width * 3, height * 3);
            }
        } else { // باقي البيئات (خلفية النهار)
            if (baseDayImg.complete && baseDayImg.naturalWidth > 0) {
                ctx.drawImage(baseDayImg, -width/2, -height/2, width * 2, height * 2);
            } else {
                ctx.fillStyle = "#162447"; ctx.fillRect(-width, -height, width * 3, height * 3);
            }
        }

        // 2. طبقات الألوان البصرية البارزة جداً لكل بيئة
        if (currentIdx === 1) { // الصيف المشرق: وهج أصفر شمس دافئ
            ctx.fillStyle = "rgba(255, 215, 0, 0.25)";
            ctx.fillRect(-width, -height, width * 3, height * 3);
        } else if (currentIdx === 2) { // الغروب الخريفي: أفق برتقالي أحمر داكن
            ctx.fillStyle = "rgba(255, 80, 0, 0.35)";
            ctx.fillRect(-width, -height, width * 3, height * 3);
        } else if (currentIdx === 3) { // فجر الربيع: إشراقة وردية بنفسجية
            ctx.fillStyle = "rgba(255, 105, 180, 0.30)";
            ctx.fillRect(-width, -height, width * 3, height * 3);
        }

        // 3. رسم الجسيمات التفاعلية
        this.particles.forEach(p => {
            ctx.save();
            if (p.type === 'green_leaf') {
                ctx.fillStyle = "rgba(118, 255, 3, 0.8)";
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            } else if (p.type === 'dandelion') {
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = "#ffeb3b"; ctx.shadowBlur = 8;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            } else if (p.type === 'autumn_leaf') {
                ctx.translate(p.x, p.y); ctx.rotate(p.angle);
                ctx.fillStyle = "#ff3d00";
                ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2); ctx.fill();
            } else if (p.type === 'sakura_petal') {
                ctx.translate(p.x, p.y); ctx.rotate(p.angle);
                ctx.fillStyle = "#ffb7c5";
                ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2); ctx.fill();
            } else if (p.type === 'firefly') {
                ctx.globalAlpha = Math.max(0.2, p.alpha);
                ctx.fillStyle = "#76ff03";
                ctx.shadowColor = "#76ff03"; ctx.shadowBlur = 12;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        });
    }
};