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
        isMobile = window.innerWidth <= 768;
        if (container) {
            const style = getComputedStyle(document.documentElement);
            const bookWidth = parseInt(style.getPropertyValue('--book-width'));
            const bookHeight = parseInt(style.getPropertyValue('--book-height'));

            if (isMobile) {
                // More stable scaling to prevent crashes
                const totalWidthRequired = bookHeight * 1.05;
                const availableWidthForScaledHeight = window.innerWidth * 0.98;
                const scale = Math.min(availableWidthForScaledHeight / totalWidthRequired, 1.3);

                container.style.transform = `rotate(90deg) scale(${scale})`;
            } else {
                // Desktop Regular
                const totalWidthRequired = bookWidth * 2.1;
                const availableWidth = window.innerWidth * 0.95;
                if (availableWidth < totalWidthRequired) {
                    const scale = availableWidth / totalWidthRequired;
                    container.style.transform = `translateX(${(bookWidth * scale) / 2}px) scale(${scale})`;
                } else {
                    container.style.transform = `translateX(${bookWidth / 2}px) scale(1)`;
                }
            }
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

        if (isMobile) {
            const deltaY = touchEndY - touchStartY;
            if (Math.abs(deltaY) > swipeThreshold) {
                if (deltaY < 0) { // Swiped Up on Screen -> Flip Next
                    turnNext();
                } else { // Swiped Down on Screen -> Flip Prev
                    turnPrev();
                }
            }
        } else {
            const deltaX = touchEndX - touchStartX;
            if (Math.abs(deltaX) > swipeThreshold) {
                if (deltaX < 0) { // Swiped Left -> Flip Next
                    turnNext();
                } else { // Swiped Right -> Flip Prev
                    turnPrev();
                }
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

    function addBackgroundDecorations() {
        const nutImages = [
            'assets/almond_ingredients.png',
            'assets/cashew_table.png',
            'assets/macadamia_ingredients.png',
            'assets/peanut_ingredients.jpeg'
        ];

        for (let i = 0; i < 12; i++) {
            const nut = document.createElement('img');
            nut.className = 'nut-decoration';
            nut.src = nutImages[Math.floor(Math.random() * nutImages.length)];

            // Random position
            nut.style.left = Math.random() * 100 + 'vw';
            nut.style.top = Math.random() * 100 + 'vh';

            // Random size
            const size = Math.random() * 40 + 30;
            nut.style.width = size + 'px';

            // Random rotation
            nut.style.transform = `rotate(${Math.random() * 360}deg)`;

            document.body.appendChild(nut);
        }
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

        // Optimization: Pre-generate these to ensure they are ready
        const messagePage = generateMessagePage({
            title: "طلب خاص؟",
            text: "منتجاتنا كتيرة, بس مع هيك ما عنا مشكلة نعملكم منتج معين بناءا على طلبكم!<br>لهيك ما تترددوا تحكوا معنا اذا في طعم معين ببالكم",
            image: "assets/productsss.png"
        });
        contentPages.push(messagePage);

        const locationsData = bookData.find(i => i.type === 'locations') || {
            image: "assets/Map.jpg",
            title: "نقاط بيعنا في:",
            points: ["جنين", "رام الله", "نابلس", "الخليل"]
        };
        contentPages.push(generateLocationsPage(locationsData));

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
        return `<div class="cover-page">
                    <img src="${data.image}" class="logo">
                    <h1 style="font-size: ${isMobile ? '2.2rem' : '3.2rem'}; margin-top: 20px;">${data.title}</h1>
                    <p style="font-size: 1.2rem; opacity: 0.9;">${data.subtitle}</p>
                </div>`;
    }

    function generateIntro(data) {
        return `<div class="product-full-page text-side">
                    <h2 style="margin-top: 0;">${data.title}</h2>
                    <p style="margin-top: -10px;">${data.text}</p>
                    <div style="margin-top: auto; padding-top: 40px;">
                        <p style="font-size: 0.8rem; color: var(--primary-color);">مناسبة للأطفال, للرياضيين, لمرضى السكري, وللجميع!</p>
                    </div>
                </div>`;
    }

    function generatePhotoPage(data) {
        return `<div class="product-full-page image-side">
                    <h2>${data.product}</h2>
                    <div class="product-image-container">
                        ${data.image ? `<img src="${data.image}" class="product-image">` : ""}
                    </div>
                    <p style="margin-top: 15px; font-size: 0.85rem; line-height: 1.5; padding: 0 10px;">${data.description}</p>
                </div>`;
    }

    function generateDescPage(data) {
        return `<div class="product-full-page text-side">
                    <div class="product-table-view">
                        <ul style="list-style: none; padding: 0; margin: 0 auto 15px; text-align: center; font-size: 1.2rem; font-weight: bold; line-height: 1.8;">
                            ${data.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                        ${data.tableImage ? `<img src="${data.tableImage}" class="nutrition-table" style="margin-top: 10px;">` : ''}
                    </div>
                </div>`;
    }

    function generateMessagePage(data) {
        return `<div class="product-full-page text-side">
        <h2>${data.title}</h2>
        <p style="padding: 0 15px; font-size: 0.95rem;">${data.text}</p>
        <div style="padding: 35px; display: flex; justify-content: center; width: 100%;">
            <img src="${data.image}" style="max-width: 65%; max-height: 220px; object-fit: contain; border-radius: 12px; box-shadow: none;">
        </div>
        </div>`;
    }

    function generateInstagramPage() {
        return `<div class="product-full-page instagram-page" style="justify-content: center; align-items: center; padding: 0 !important; background-image: url('assets/photo.jpeg') !important; background-size: cover !important;">
                    <div style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; justify-content: center;">
                        <img src="assets/instagram_new.png" style="width: 220px; border-radius: 15px; background: transparent; opacity: 0.7; transition: transform 0.3s; filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));">
                        <h2 style="color: white; margin-top: 15px; text-shadow: 0 2px 10px rgba(0,0,0,1); font-size: 1.6rem; font-weight: bold;">Add us on Instagram!</h2>
                    </div>
                </div>`;
    }

    function generateLocationsPage(data) {
        return `<div class="product-full-page text-side">
                    <img src="${data.image}" style="max-width: 95%;">
                    <h2>${data.title}</h2>
                    <ul style="list-style: disc; padding-inline-start: 25px; margin: 15px auto; width: fit-content; text-align: start; font-size: 1.2rem; line-height: 1.8;">
                        ${data.points.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>`;
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
