document.addEventListener('DOMContentLoaded', () => {
    const book = document.getElementById('book');

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
        const container = document.querySelector('.book-container');
        if (container) {
            const style = getComputedStyle(document.documentElement);
            const bookWidth = parseInt(style.getPropertyValue('--book-width'));
            const bookHeight = parseInt(style.getPropertyValue('--book-height'));

            if (isMobile) {
                // FORCE HORIZONTAL via Rotation + Scale
                // We rotate 90deg, so "width" is now vertical and "height" is horizontal
                const totalWidthRequired = bookHeight * 1.1; // Book is on its side
                const availableWidthForScaledHeight = window.innerWidth * 0.9;
                const scale = availableWidthForScaledHeight / totalWidthRequired;

                // Centering is tricky with rotation
                container.style.transform = `rotate(90deg) scale(${scale})`;
            } else {
                // Desktop Regular
                const totalWidthRequired = bookWidth * 2.2;
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
                const rect = sheet.getBoundingClientRect();
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
                    <h1>${data.title}</h1>
                    <p>${data.subtitle}</p>
                    <p>${data.footer}</p>
                </div>`;
    }

    function generateIntro(data) {
        return `<div class="product-full-page text-side">
        <h2>${data.title}</h2>
        <p>${data.text}</p>
        <p>${data.footer}</p>
        </div>`;
    }

    function generatePhotoPage(data) {
        return `<div class="product-full-page image-side"><div class="product-image-container">${data.image ? `<img src="${data.image}" class="product-image">` : ""}</div></div>`;
    }

    function generateDescPage(data) {
        return `<div class="product-full-page text-side"><div class="product-table-view"><h2>${data.product}</h2><p>${data.description}</p><ul>${data.features.map(f => `<li>${f}</li>`).join('')}</ul>${data.tableImage ? `<img src="${data.tableImage}" class="nutrition-table">` : ''}</div></div>`;
    }

    function generateMessagePage(data) {
        return `<div class="product-full-page text-side"><h2>${data.title}</h2><p>${data.text}</p><img src="${data.image}" style="max-width:60%; border-radius:10px;"></div>`;
    }

    function generateInstagramPage() {
        return `<div class="product-full-page instagram-page"><h2>Add us on Instagram!</h2></div>`;
    }

    function generateLocationsPage(data) {
        return `<div class="product-full-page text-side">
        <h2>${data.title}</h2>
        <ul style="list-style:none; padding:0;">${data.points.map(p => `<li>${p}</li>`).join('')}</ul>
        <p>${data.footer}</p>
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
