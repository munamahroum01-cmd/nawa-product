document.addEventListener('DOMContentLoaded', () => {
    console.log("Nawa Interactive Book Initializing...");
    const book = document.getElementById('book');
    const container = document.querySelector('.book-container');

    if (!book || !container) {
        console.error("Book or Container not found!");
        return;
    }

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
        if (typeof bookData !== 'undefined') {
            bookData.forEach(item => {
                if (item.image) imagesToPreload.push(item.image);
                if (item.tableImage) imagesToPreload.push(item.tableImage);
            });
        }
        imagesToPreload.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    function checkMobile() {
        isMobile = window.innerWidth <= 768;
        const style = getComputedStyle(document.documentElement);
        const bookWidth = parseInt(style.getPropertyValue('--book-width')) || 450;
        const bookHeight = parseInt(style.getPropertyValue('--book-height')) || 700;

        if (isMobile) {
            const scale = (window.innerWidth * 0.94) / bookHeight;
            book.style.transform = `rotate(90deg) scale(${scale})`;
            container.style.transform = 'none';
        } else {
            const totalWidthRequired = bookWidth * 2.1;
            const availableWidth = window.innerWidth * 0.95;
            if (availableWidth < totalWidthRequired) {
                const scale = availableWidth / totalWidthRequired;
                container.style.transform = `translateX(${(bookWidth * scale) / 2}px) scale(${scale})`;
            } else {
                container.style.transform = `translateX(${bookWidth / 2}px) scale(1)`;
            }
            book.style.transform = 'none';
        }
    }

    function createEl(tag, classNames, content = '') {
        const el = document.createElement(tag);
        if (classNames) el.className = classNames;
        el.innerHTML = content;
        return el;
    }

    // --- Interaction ---
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    function handleSwipe() {
        const swipeThreshold = 50;
        if (isMobile) {
            const deltaY = touchEndY - touchStartY;
            if (Math.abs(deltaY) > swipeThreshold) {
                if (deltaY < 0) turnNext();
                else turnPrev();
            }
        } else {
            const deltaX = touchEndX - touchStartX;
            if (Math.abs(deltaX) > swipeThreshold) {
                if (deltaX < 0) turnNext();
                else turnPrev();
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

    function renderBook() {
        if (typeof bookData === 'undefined') {
            console.error("bookData is missing! Check data.js");
            return;
        }
        book.innerHTML = '';
        const contentPages = [];

        contentPages.push(generateCover(bookData[0])); // Page 1
        contentPages.push(generateIntro(bookData[1]));        // P3: Collection Header
        contentPages.push(`<div class="product-full-page" style="justify-content: center; height: 100%;">
            <h1 style="font-family: 'Amiri', serif; font-size: 2.5rem; margin-bottom: 10px;">Our Products</h1>
            <p style="font-size: 1.1rem; letter-spacing: 1px;">Natural & Organic</p>
        </div>`);
        // Page 3

        const products = bookData.filter(i => i.type === 'product');
        products.forEach(p => {
            contentPages.push(generatePhotoPage(p));
            contentPages.push(generateDescPage(p));
        });

        // P24: Message Page (Special Request)
        contentPages.push(generateMessagePage({
            title: "طلب خاص؟",
            text: "منتجاتنا كتيرة, بس مع هيك ما عنا مشكلة نعملكم منتج معين بناءا على طلبكم!<br>لهيك ما تترددوا تحكوا معنا اذا في طعم معين ببالكم",
            image: "assets/productsss.png"
        }));

        // P25: Locations Page
        const locationsData = bookData.find(i => i.type === 'locations');
        if (locationsData) contentPages.push(generateLocationsPage(locationsData));

        // P26: Instagram Page (Last Page)
        contentPages.push(generateInstagramPage());

        for (let i = 0; i < contentPages.length; i += 2) {
            const frontHTML = contentPages[i];
            const backHTML = contentPages[i + 1] || ''; // Removed the P27 push (fallback Instagram page)

            const sheet = createEl('div', 'page');

            // P3 Background (Sheet 1 front)
            let frontClass = "page-front";
            if (i === 2) frontClass += " page-3-background"; // Removed no-texture

            // P2 Background (Back of cover)
            let backClass = "page-back";

            sheet.innerHTML = `
                <div class="${frontClass}">${frontHTML}<div class="page-number">${i + 1}</div></div>
                <div class="${backClass}">${backHTML}<div class="page-number">${i + 2}</div></div>
            `;

            sheet.addEventListener('click', () => {
                const sheets = Array.from(document.querySelectorAll('.page'));
                const myIndex = sheets.indexOf(sheet);
                if (myIndex === currentPage) turnNext();
                else if (myIndex === currentPage - 1) turnPrev();
            });
            book.appendChild(sheet);
        }
        updateZIndexes();
        checkMobile();
        console.log("Book Rendered with " + contentPages.length + " pages.");
    }

    function generateCover(data) {
        return `<div class="cover-page">
                    <img src="${data.image}" class="logo">
                    <h1 style="font-size: ${isMobile ? '2.2rem' : '3.2rem'}; margin-top: 20px;">${data.title}</h1>
                    <p style="font-size: 1.2rem; opacity: 0.9;">${data.subtitle}</p>
                </div>`;
    }

    function generateIntro(data) {
        return `<div class="product-full-page text-side" style="padding-top: 50px;">
                    <h2 style="margin-top: 0; font-family: 'Amiri', serif; font-size: 2.2rem; color: var(--primary-color) !important;">${data.title}</h2>
                    <p style="margin-top: 5px; font-size: 1rem; line-height: 1.6; color: var(--text-color) !important;">${data.text}</p>
                    <div style="margin-top: auto; padding-bottom: 30px;">
                        <p style="font-size: 0.82rem; font-weight: 400; color: var(--primary-color) !important; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 15px;">
                            مناسبة للأطفال, للرياضيين, لمرضى السكري, وللجميع!
                        </p>
                    </div>
                </div>`;
    }

    function generatePhotoPage(data) {
        return `<div class="product-full-page image-side">
                    <h2 style="font-family: 'Amiri', serif;">${data.product}</h2>
                    <div class="product-image-container">
                        ${data.image ? `<img src="${data.image}" class="product-image">` : ""}
                    </div>
                    <p style="margin-top: 15px; font-size: 0.85rem; line-height: 1.5; padding: 0 10px;">${data.description}</p>
                </div>`;
    }

    function generateDescPage(data) {
        return `<div class="product-full-page text-side">
                    <div class="product-table-view" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
                        <ul style="list-style: none; padding: 0; margin: 0 auto 15px; text-align: center; font-size: 1.2rem; font-weight: bold; line-height: 1.8;">
                            ${data.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                        ${data.tableImage ? `<div style="width: 100%; display: flex; justify-content: center;"><img src="${data.tableImage}" class="nutrition-table" style="margin: 0 auto;"></div>` : ''}
                    </div>
                </div>`;
    }

    function generateMessagePage(data) {
        return `<div class="product-full-page text-side" style="justify-content: center;">
        <h2 style="font-family: 'Amiri', serif;">${data.title}</h2>
        <p style="padding: 0 15px; font-size: 0.95rem;">${data.text}</p>
        <div style="padding: 15px; display: flex; justify-content: center; width: 100%;">
            <img src="${data.image}" style="max-width: 85%; max-height: 280px; object-fit: contain; border-radius: 12px; box-shadow: none;">
        </div>
        </div>`;
    }

    function generateInstagramPage() {
        return `<div class="product-full-page instagram-page" style="justify-content: center; align-items: center; background-image: none !important; background-color: var(--page-bg) !important;">
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 20px;">
                        <img src="assets/instagram.jpeg" style="max-width: 90%; max-height: 80%; object-fit: contain; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
                    </div>
                </div>`;
    }

    function generateLocationsPage(data) {
        return `<div class="product-full-page text-side" style="padding-top: 10px; padding-bottom: 20px; justify-content: flex-start;">
                    <img src="${data.image}" style="max-width: 80%; max-height: 180px; object-fit: contain; border-radius: 8px; margin-top: 10px;">
                    <h2 style="font-family: 'Amiri', serif; font-size: 2rem; margin-top: 15px;">${data.title}</h2>
                    <ul style="list-style: disc; padding-inline-start: 25px; margin: 10px auto; width: fit-content; text-align: start; font-size: 0.95rem; line-height: 1.5;">
                        ${data.points.map(p => `<li style="margin-bottom: 3px;">${p}</li>`).join('')}
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
            sheets[currentPage].style.zIndex = 100; // Force to top during transition
            sheets[currentPage].classList.remove('flipped');
            setTimeout(updateZIndexes, 300); // Wait for transition start
            flipSound.currentTime = 0;
            flipSound.play().catch(e => { });
        }
    }

    preloadAssets();
    renderBook();
});
