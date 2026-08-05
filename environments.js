// --- ENVIRONMENT & SEASONS SYSTEM WITH ADVANCED EFFECTS ---

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
    stars: [],
    shootingStars: [],
    distantBirds: [],
    butterflies: [],
    lastEnvIndex: 0,
    KM_PER_ENV: 10,

    // متغيرات البرق (كل 30 إلى 60 ثانية)
    lightningTimer: 0,
    lightningFlash: 0,

    init() {
        if (typeof GameData.accumulatedKm !== 'number') {
            GameData.accumulatedKm = 0;
        }
        this.particles = [];
        this.clouds = [];
        this.shootingStars = [];
        this.distantBirds = [];
        this.butterflies = [];
        this.lastEnvIndex = this.getCurrentEnvIndex();

        // إنشاء سماء نجوم ثابتة لليل
        this.stars = [];
        for (let i = 0; i < 40; i++) {
            this.stars.push({
                x: Math.random(),
                y: Math.random() * 0.7, // النجوم في الثلثين الأوليين من السماء
                radius: Math.random() * 1.5 + 0.8,
                phase: Math.random() * Math.PI * 2
            });
        }

        // إعداد مؤقت البرق (1800 إلى 3600 فريم = 30 إلى 60 ثانية)
        this.resetLightningTimer();
    },

    resetLightningTimer() {
        this.lightningTimer = Math.floor(Math.random() * 1800) + 1800;
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

    // دالة مساعدة لتوليد اليراعات المضيئة (مستعملة في الليل والربيع)
    spawnFireflyCluster(width, height) {
        const clusterX = width + 50;
        const clusterY = Math.random() * (height - 120) + 60;
        const countInGroup = Math.floor(Math.random() * 4) + 3;

        for (let i = 0; i < countInGroup; i++) {
            this.particles.push({
                type: 'firefly',
                x: clusterX + (Math.random() - 0.5) * 100,
                y: clusterY + (Math.random() - 0.5) * 100,
                radius: Math.random() * 0.8 + 0.6,
                alpha: Math.random() * 0.5 + 0.4,
                vAlpha: (Math.random() * 0.015 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
                vx: (Math.random() - 0.5) * 0.8 - 0.4,
                vy: (Math.random() - 0.5) * 0.6
            });
        }
    },

    update(width, height) {
        const currentIdx = this.getCurrentEnvIndex();

        // 🍃 0. البيئة القياسية (Standard Forest) - سرب طيور بعيدة
        if (currentIdx === 0) {
            if (this.distantBirds.length === 0 && Math.random() < 0.008) {
                const birdY = Math.random() * (height * 0.4) + 30;
                const groupSize = Math.floor(Math.random() * 3) + 3; // سرب من 3 لـ 5 طيور
                for (let i = 0; i < groupSize; i++) {
                    this.distantBirds.push({
                        x: width + 100 + (i * 25),
                        y: birdY + (Math.random() - 0.5) * 30,
                        vx: -(Math.random() * 0.6 + 1.2),
                        wingState: Math.random() * Math.PI
                    });
                }
            }
        }

        // 🌧️ 1. الشتاء المطري (Rainy Winter) - مطر + سحب + برق كل 30-60 ثانية
        else if (currentIdx === 1) {
            // مؤقت وميض البرق
            this.lightningTimer--;
            if (this.lightningTimer <= 0) {
                this.lightningFlash = 5; // يدوم الوميض 5 فريمات (ناعم وخاطف)
                this.resetLightningTimer();
            }
            if (this.lightningFlash > 0) this.lightningFlash--;

            // السحب (بحد أقصى 3)
            if (this.clouds.length < 3 && Math.random() < 0.015) {
                const cloudImgIndex = Math.floor(Math.random() * imgClouds.length);
                this.clouds.push({
                    img: imgClouds[cloudImgIndex],
                    x: width + 150,
                    y: Math.random() * (height - 120),
                    speed: Math.random() * 0.6 + 0.3,
                    scale: Math.random() * 0.25 + 0.22
                });
            }

            // قطرات المطر (مائلة لليمين وتتجه بهدوء)
            if (frame % 4 === 0) {
                this.particles.push({
                    type: 'raindrop',
                    x: Math.random() * (width + 200) - 100,
                    y: -30,
                    vx: Math.random() * 1.5 + 1.2,
                    vy: Math.random() * 3.5 + 6.5,
                    size: Math.random() * 5 + 9,
                    angle: Math.atan2(7, 1.5)
                });
            }
        }

        // 🌙 2. الليل (Night Realm) - نجوم + شهاب خاطف + يراعات
        else if (currentIdx === 2) {
            // ترسبن شهاب خاطف كل ~20 ثانية
            if (frame % 1200 === 0 || (this.shootingStars.length === 0 && Math.random() < 0.003)) {
                this.shootingStars.push({
                    x: Math.random() * width + width * 0.3,
                    y: Math.random() * (height * 0.3),
                    len: Math.random() * 80 + 60,
                    speed: Math.random() * 10 + 12,
                    alpha: 1.0
                });
            }

            // ترسبن مجموعات يراعات متفرقة
            if (frame % 200 === 0 && Math.random() < 0.65) {
                this.spawnFireflyCluster(width, height);
            }
        }

        // 🌸 3. الربيع (Spring Blossom) - بتلات + فراشات + يراعات
        else if (currentIdx === 3) {
            // بتلات الزهور
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

            // فراشات ربيعية
            if (this.butterflies.length < 3 && Math.random() < 0.008) {
                this.butterflies.push({
                    x: width + 50,
                    y: Math.random() * (height - 150) + 50,
                    vx: -(Math.random() * 1.2 + 0.8),
                    vy: (Math.random() - 0.5) * 0.8,
                    wingSpeed: Math.random() * 0.2 + 0.2,
                    wingPhase: 0,
                    color: Math.random() < 0.5 ? '#ffcc00' : '#ff99c2' // فراشات صفراء ووردية
                });
            }

            // ترسبن يراعات في الربيع أيضاً بناءً على طلبك
            if (frame % 220 === 0 && Math.random() < 0.5) {
                this.spawnFireflyCluster(width, height);
            }
        }

        // --- تحديث السحب ---
        this.clouds.forEach(c => c.x -= c.speed);
        this.clouds = this.clouds.filter(c => c.x > -350);

        // --- تحديث الطيور البعيدة ---
        this.distantBirds.forEach(b => {
            b.x += b.vx;
            b.wingState += 0.15;
        });
        this.distantBirds = this.distantBirds.filter(b => b.x > -100);

        // --- تحديث الشهاب الناري ---
        this.shootingStars.forEach(s => {
            s.x -= s.speed;
            s.y += s.speed * 0.4;
            s.alpha -= 0.03;
        });
        this.shootingStars = this.shootingStars.filter(s => s.alpha > 0);

        // --- تحديث الفراشات ---
        this.butterflies.forEach(bf => {
            bf.x += bf.vx;
            bf.y += bf.vy + Math.sin(frame * 0.05) * 0.5;
            bf.wingPhase += bf.wingSpeed;
        });
        this.butterflies = this.butterflies.filter(bf => bf.x > -100);

        // --- تحديث الجسيمات ---
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

        this.particles = this.particles.filter(p => 
            p.x > -150 && p.x < width + 250 && p.y > -80 && p.y < height + 120
        );
    },

    drawBackgroundAndEffects(ctx, width, height, baseDayImg) {
        const currentIdx = this.getCurrentEnvIndex();

        // 1. رسم صور الخلفية
        if (currentIdx === 1) { // الشتاء
            if (imgDay.complete && imgDay.naturalWidth > 0) {
                ctx.drawImage(imgDay, -width/2, -height/2, width * 2, height * 2);
            } else if (baseDayImg.complete && baseDayImg.naturalWidth > 0) {
                ctx.drawImage(baseDayImg, -width/2, -height/2, width * 2, height * 2);
            }

            // وميض برق هادئ كإضاءة خلفية
            if (this.lightningFlash > 0) {
                ctx.save();
                ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
                ctx.fillRect(-width, -height, width * 3, height * 3);
                ctx.restore();
            }
        } else if (currentIdx === 2) { // الليل
            if (imgNight.complete && imgNight.naturalWidth > 0) {
                ctx.drawImage(imgNight, -width/2, -height/2, width * 2, height * 2);
            } else {
                ctx.fillStyle = "#0a0d1a"; ctx.fillRect(-width, -height, width * 3, height * 3);
            }

            // رسم النجوم المتلألئة
            this.stars.forEach(s => {
                const starX = s.x * width;
                const starY = s.y * height;
                const tw = Math.sin(frame * 0.05 + s.phase) * 0.4 + 0.6;
                ctx.save();
                ctx.fillStyle = `rgba(255, 255, 255, ${tw * 0.8})`;
                ctx.beginPath();
                ctx.arc(starX, starY, s.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // رسم الشهاب الناري
            this.shootingStars.forEach(s => {
                ctx.save();
                ctx.globalAlpha = Math.max(0, s.alpha);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x + s.len, s.y - s.len * 0.4);
                ctx.stroke();
                ctx.restore();
            });
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

        // 2. رسم طيور بعيدة (في البيئة القياسية)
        if (currentIdx === 0) {
            this.distantBirds.forEach(b => {
                ctx.save();
                ctx.strokeStyle = "rgba(40, 50, 70, 0.6)";
                ctx.lineWidth = 1.5;
                const wingY = Math.sin(b.wingState) * 4;
                ctx.beginPath();
                ctx.moveTo(b.x - 6, b.y + wingY);
                ctx.lineTo(b.x, b.y);
                ctx.lineTo(b.x + 6, b.y + wingY);
                ctx.stroke();
                ctx.restore();
            });
        }

        // 3. رسم السحب (الشتاء)
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

        // 4. رسم الفراشات (الربيع)
        if (currentIdx === 3) {
            this.butterflies.forEach(bf => {
                ctx.save();
                ctx.translate(bf.x, bf.y);
                const wingScale = Math.sin(bf.wingPhase);
                ctx.fillStyle = bf.color;
                
                // الجناح الأيسر واليمين
                ctx.beginPath();
                ctx.ellipse(-4 * wingScale, 0, 6 * Math.abs(wingScale), 4, 0, 0, Math.PI * 2);
                ctx.ellipse(4 * wingScale, 0, 6 * Math.abs(wingScale), 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }

        // 5. رسم الجسيمات (المطر، اليراعات، البتلات)
        this.particles.forEach(p => {
            ctx.save();

            // 🌧️ قطرات المطر
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

            // 🌙 🌸 اليراعات
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
