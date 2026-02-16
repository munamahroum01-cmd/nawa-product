document.addEventListener('DOMContentLoaded', () => {
    const book = document.getElementById('book');
    const container = document.querySelector('.book-container');

    let currentPage = 0;
    let isMobile = window.innerWidth <= 768;

    // --- Image Caching ---
    function preloadAssets() {
        const imagesToPreload = [
            'assets/logo.jpeg',
            'assets/Pal.jpg',
            'assets/background_page3.jpeg',
            'assets/instagram_new.png',
            'assets/productsss.png',
            'assets/Map.jpg'
        ];
        bookData.forEach(item => {
            if (item.image) imagesToPreload.push(item.image);
            if (item.tableImage) imagesToPreload.push(item.tableImage);
        });
        imagesToPreload.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    function checkMobile() {
        isMobile = window.innerWidth <= 768; // Logic flag (keep for swipe)

        if (container) {
            const style = getComputedStyle(document.documentElement);
            const bookWidth = parseInt(style.getPropertyValue('--book-width'));
            // const bookHeight = parseInt(style.getPropertyValue('--book-height')); // Unused in new logic

            // Unify logic: Always center spine and scale to fit
            // Spread width = bookWidth * 2. Add cushion (2.2)
            const totalWidthRequired = bookWidth * 2.2;
            const availableWidth = window.innerWidth * 0.95;

            // Calculate height constraints too (important for mobile landscape)
            // const totalHeightRequired = bookHeight * 1.05;
            // const availableHeight = window.innerHeight * 0.95;
            // let scale = Math.min(availableWidth / totalWidthRequired, availableHeight / totalHeightRequired);

            // Simplified: Just width constraint for now (matches original desktop logic)
            let scale = 1;
            if (availableWidth < totalWidthRequired) {
                scale = availableWidth / totalWidthRequired;
            }

            // Apply Transform: Center Spine (translateX) + Scale
            // translateX(bookWidth/2) shifts the [-225, 225] book to [0, 450] (Spine at 0) relative to its center
            // Combined with Flexbox Center on Container, Spine is at Screen Center.
            // Note: We need to scale the translation too? 
            // Transform order: translate then scale? Or string concat?
            // "translateX(...) scale(...)" applies Translate first (in local coords) then Scale?
            // Original Desktop: `translateX(${(bookWidth * scale) / 2}px) scale(${scale})`
            // Let's stick to that pattern if it worked for Desktop.

            // Wait, if we scale, the translation amount should be logical.
            // If we want visual shift of X pixels *after* scale...
            // Let's use the exact Desktop formula which was working:

            container.style.transform = `translateX(${(bookWidth / 2)}px) scale(${scale})`;

            // Correction: Original used `(bookWidth * scale) / 2` ?
            // Line 48: `translateX(${(bookWidth * scale) / 2}px) scale(${scale})`
            // Let's inspect why.
            // If transform-origin is center.
            // Scale happens around center.
            // Translate happens... 
            // CSS Transform functions are applied from Right to Left (conceptually) or simply:
            // transform="translate(T) scale(S)" -> Matrix = Translate * Scale.
            // Point P -> P' = T * (S * P) = S*P + T? No.
            // Standard CSS: transforms applied in order.
            // `translateX(10px) scale(2)`:
            // 1. Translate X by 10. Origin shifts? 
            // 2. Scale by 2.

            // Actually, best to simplify:
            // Just Scale.
            // And use margin or simple calc?
            // But we need to unify.

            // Let's use:
            container.style.transform = `translateX(${bookWidth / 2}px) scale(${scale})`;
        }
    }

    // --- Swipe Interaction ---
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    function handleFooterButtons() {
        // Not used as per request to hide arrows
    }

    function handleSwipe() {
        const swipeThreshold = 50;

        // Since the book is rotated 90deg on mobile:
        // A vertical swipe on the screen is a horizontal flip of the book.
        // Screen Y axis becomes Book X axis.

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Determine major axis
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal Swipe
            if (Math.abs(deltaX) > swipeThreshold) {
                if (deltaX < 0) turnNext(); // Swipe Left
                else turnPrev(); // Swipe Right
            }
        } else {
            // Vertical Swipe (Optional: Keep for user convenience?)
            // Let's support Swiping Up for Next too, as users might scroll
            if (Math.abs(deltaY) > swipeThreshold) {
                if (deltaY < 0) turnNext(); // Swipe Up
                else turnPrev(); // Swipe Down
            }
        }
    }

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    window.addEventListener('resize', checkMobile);

    const flipSound = new Audio('assets/page-flip.mp3');
    flipSound.volume = 0.5;

    function createEl(tag, classNames, content = '') {
        const el = document.createElement(tag);
        if (classNames) el.className = classNames;
        el.innerHTML = content;
        return el;
    }

    function renderBook() {
        book.innerHTML = '';
        const contentPages = [];

        contentPages.push(generateCover(bookData[0]));
        contentPages.push(generateIntro(bookData[1]));
        contentPages.push(`<div class="product-full-page"><h1>Our Collection</h1><p>Natural & Organic</p></div>`);

        const products = bookData.filter(i => i.type === 'product');
        products.forEach(p => {
            contentPages.push(generatePhotoPage(p));
            contentPages.push(generateDescPage(p));
        });

        contentPages.push(generateMessagePage({
            title: "طلب خاص؟",
            text: "منتجاتنا كتيرة, بس مع هيك ما عنا مشكلة نعملكم منتج معين بناءا على طلبكم!<br>لهيك ما تترددوا تحكوا معنا اذا في طعم معين ببالكم",
            image: "assets/productsss.png"
        }));

        contentPages.push(generateLocationsPage({
            image: "assets/Map.jpg",
            title: "نقاط بيعنا في:",
            points: ["جنين", "رام الله", "نابلس", "الخليل"],
            footer: "وبنرحب بنقاط بيع جديدة!"
        }));

        contentPages.push(generateInstagramPage());

        for (let i = 0; i < contentPages.length; i += 2) {
            const frontHTML = contentPages[i];
            const backHTML = contentPages[i + 1] || `<div class="product-full-page instagram-page"><h2>Add us on Instagram!</h2></div>`;

            const sheet = createEl('div', 'page');
            let frontClass = "page-front";
            if (i === 2) frontClass += " page-3-background";
            let backClass = "page-back";

            sheet.innerHTML = `
                <div class="${frontClass}">${frontHTML}<div class="page-number">${i + 1}</div></div>
                <div class="${backClass}">${backHTML}<div class="page-number">${i + 2}</div></div>
            `;

            sheet.addEventListener('click', (e) => {
                // Only trigger if it wasn't a swipe or accidental touch move
                const allSheets = Array.from(document.querySelectorAll('.page'));
                const myIndex = allSheets.indexOf(sheet);

                if (myIndex === currentPage) {
                    turnNext();
                } else if (myIndex === currentPage - 1) {
                    turnPrev();
                }
            });
            book.appendChild(sheet);
        }
        updateZIndexes();
        checkMobile();
    }

    function generateCover(data) {
        return `<div class="cover-page"><img src="${data.image}" class="logo"><h1>${data.title}</h1><p>${data.subtitle}</p></div>`;
    }

    function generateIntro(data) {
        return `<div class="product-full-page text-side"><h2>${data.title}</h2><p>${data.text}</p></div>`;
    }

    function generatePhotoPage(data) {
        return `<div class="product-full-page image-side"><div class="product-image-container">${data.image ? `<img src="${data.image}" class="product-image">` : ""}</div></div>`;
    }

    function generateDescPage(data) {
        return `<div class="product-full-page text-side"><div class="product-table-view"><h2>${data.product}</h2><p>${data.description}</p><ul>${data.features.map(f => `<li>${f}</li>`).join('')}</ul>${data.tableImage ? `<img src="${data.tableImage}" class="nutrition-table">` : ''}</div></div>`;
    }

    function generateMessagePage(data) {
        return `<div class="product-full-page text-side"><h2>${data.title}</h2><p>${data.text}</p><img src="${data.image}" style="max-width:90%; border-radius:10px;"></div>`;
    }

    function generateInstagramPage() {
        return `<div class="product-full-page instagram-page"><h2>Add us on Instagram!</h2></div>`;
    }

    function generateLocationsPage(data) {
        return `<div class="product-full-page text-side"><h2>${data.title}</h2><ul style="list-style:none; padding:0;">${data.points.map(p => `<li>${p}</li>`).join('')}</ul></div>`;
    }

    function updateZIndexes() {
        const sheets = document.querySelectorAll('.page');
        sheets.forEach((sheet, index) => {
            sheet.style.zIndex = sheet.classList.contains('flipped') ? index + 50 : 50 - index;
        });
    }

    function turnNext() {
        const sheets = document.querySelectorAll('.page');
        if (currentPage < sheets.length) {
            sheets[currentPage].classList.add('flipped');
            currentPage++;
            updateZIndexes();
            flipSound.currentTime = 0;
            flipSound.play().catch(e => { });
        }
    }

    function turnPrev() {
        const sheets = document.querySelectorAll('.page');
        if (currentPage > 0) {
            currentPage--;
            sheets[currentPage].classList.remove('flipped');
            updateZIndexes();
            flipSound.currentTime = 0;
            flipSound.play().catch(e => { });
        }
    }

    preloadAssets();
    renderBook();
});
