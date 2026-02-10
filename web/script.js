document.addEventListener('DOMContentLoaded', () => {
    const book = document.getElementById('book');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let currentPage = 0; // The index of the sheet
    let isMobile = window.innerWidth <= 768;

    function checkMobile() {
        isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('is-mobile', isMobile);

        // Dynamic Scaling to fit 3D spread on any screen
        const container = document.querySelector('.book-container');
        if (container) {
            const bookWidth = 500; // Expected base width
            const totalWidthRequired = bookWidth * 2.2; // 2 pages + margin/shadows
            const availableWidth = window.innerWidth * 0.95;

            if (availableWidth < totalWidthRequired) {
                const scale = availableWidth / totalWidthRequired;
                container.style.transform = `translateX(${(bookWidth * scale) / 2}px) scale(${scale})`;
            } else {
                container.style.transform = `translateX(${bookWidth / 2}px) scale(1)`;
            }
        }
    }

    window.addEventListener('resize', checkMobile);
    document.body.classList.toggle('is-mobile', isMobile);

    // Page Flip Sound
    const flipSound = new Audio('assets/page-flip.mp3');
    flipSound.volume = 0.5;

    // Helper to create a DOM element
    function createEl(tag, classNames, content = '') {
        const el = document.createElement(tag);
        if (classNames) el.className = classNames;
        el.innerHTML = content;
        return el;
    }

    function renderBook() {
        book.innerHTML = '';
        const contentPages = [];

        // Page 0: Cover
        contentPages.push(generateCover(bookData[0]));
        // Page 1: Intro
        contentPages.push(generateIntro(bookData[1]));
        // Page 2: Spacer/Title
        contentPages.push(`<div class="product-full-page"><h1>Our Collection</h1><p>Natural & Organic</p></div>`);

        const products = bookData.filter(i => i.type === 'product');
        products.forEach(p => {
            // Photo Page (Left)
            contentPages.push(generatePhotoPage(p));
            // Desc Page (Right)
            contentPages.push(generateDescPage(p));
        });

        // Custom Request Message Page
        const productsImg = "assets/productsss.png";
        contentPages.push(generateMessagePage({
            title: "طلب خاص؟",
            text: "منتجاتنا كتيرة, بس مع هيك ما عنا مشكلة نعملكم منتج معين بناءا على طلبكم!<br>لهيك ما تترددوا تحكوا معنا اذا في طعم معين ببالكم",
            image: productsImg
        }));

        // Locations / Map Page
        contentPages.push(generateLocationsPage({
            image: "assets/Map.jpg",
            title: "نقاط بيعنا في:",
            points: ["جنين", "رام الله", "نابلس", "الخليل"],
            footer: "وبنرحب بنقاط بيع جديدة!"
        }));

        // Instagram Page
        contentPages.push(generateInstagramPage());

        // Loop and bind to Sheets
        for (let i = 0; i < contentPages.length; i += 2) {
            const frontHTML = contentPages[i];
            const backHTML = contentPages[i + 1] || `
                <div class="product-full-page instagram-page">
                    <img src="assets/instagram_new.png" class="insta-code" alt="Instagram">
                    <h2>Add us on Instagram!</h2>
                </div>`;

            const sheet = createEl('div', 'page');

            // Front Classes
            let frontClass = "page-front";
            if (i === 2) frontClass += " page-3-background";
            if (frontHTML.includes('products-page')) frontClass += " no-texture";

            // Back Classes
            let backClass = "page-back";
            if (backHTML.includes('products-page')) backClass += " no-texture";

            const frontId = (i === 0) ? 'id="cover-front-bg"' : '';
            const backId = (i >= contentPages.length - 2) ? 'id="end-back-bg"' : '';

            sheet.innerHTML = `
                <div class="${frontClass}" ${frontId}>${frontHTML}<div class="page-number">${i + 1}</div></div>
                <div class="${backClass}" ${backId}>${backHTML}<div class="page-number">${i + 2}</div></div>
            `;

            sheet.addEventListener('click', (e) => {
                const rect = sheet.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const isRightSide = clickX > rect.width / 2;
                const allSheets = Array.from(document.querySelectorAll('.page'));
                const myIndex = allSheets.indexOf(sheet);

                if (isMobile) {
                    // On mobile, tap right to go forward, left to go back
                    if (isRightSide) {
                        turnNext();
                    } else {
                        turnPrev();
                    }
                } else {
                    if (myIndex === currentPage) {
                        turnNext();
                    } else if (myIndex === currentPage - 1) {
                        turnPrev();
                    }
                }
            });
            book.appendChild(sheet);
        }
        updateZIndexes();
        checkMobile();
    }

    // Generators
    function generateCover(data) {
        return `
            <div class="cover-page">
                <img src="${data.image}" class="logo" alt="Logo">
                <h1>${data.title}</h1>
                <p>${data.subtitle}</p>
                ${data.footer ? `<p style="position:absolute; bottom:80px; font-weight:normal; font-size:1.0rem; font-family:'Amiri', serif; line-height:1.6; width:80%; left:50%; transform:translateX(-50%);">${data.footer}</p>` : ''}
            </div>
        `;
    }

    function generateIntro(data) {
        return `
            <div class="product-full-page text-side">
                <div class="intro-content">
                    <h2>${data.title}</h2>
                    <p>${data.text}</p>
                </div>
                ${data.footer ? `<div class="intro-footer">${data.footer}</div>` : ''}
            </div>
        `;
    }

    function generatePhotoPage(data) {
        const isSpoon = data.image && data.image.includes('spoon');
        const imgHTML = data.image
            ? `<img src="${data.image}" class="product-image ${isSpoon ? 'spoon-highlight' : ''}" alt="${data.product}">`
            : '';
        return `
            <div class="product-full-page image-side">
                <div class="product-image-container">
                    ${imgHTML}
                </div>
            </div>
        `;
    }

    function generateDescPage(data) {
        return `
            <div class="product-full-page text-side">
                <div class="product-table-view">
                    <h2>${data.product}</h2>
                    <p>${data.description}</p>
                    <ul>
                        ${data.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                    ${data.tableImage ? `<div class="table-container"><img src="${data.tableImage}" class="nutrition-table" alt="Nutritional Values"></div>` : ''}
                </div>
            </div>
        `;
    }

    function generateMessagePage(data) {
        return `
            <div class="product-full-page text-side">
                <div class="intro-content">
                    <h2>${data.title}</h2>
                    <p>${data.text}</p>
                    ${data.image ? `<img src="${data.image}" style="max-width:95%; max-height:60%; margin-top:20px; border-radius:10px;" alt="Product">` : ''}
                </div>
            </div>
        `;
    }

    function generateInstagramPage() {
        return `
            <div class="product-full-page instagram-page">
                <img src="assets/instagram_new.png" class="insta-code" alt="Instagram">
                <h2>Add us on Instagram!</h2>
            </div>
        `;
    }

    function generateLocationsPage(data) {
        return `
            <div class="product-full-page text-side">
                <div class="intro-content">
                    <h2 style="margin-bottom:15px;">${data.title}</h2>
                    ${data.image ? `<img src="${data.image}" style="max-width:85%; max-height:300px; margin-bottom:15px; border-radius:10px;" alt="Rest of Palestine">` : ''}
                    <ul style="list-style:none; padding:0; font-size:1.4rem; font-family:'Amiri', serif; color:var(--primary-color);">
                        ${data.points.map(p => `<li style="margin:5px 0;">${p}</li>`).join('')}
                    </ul>
                    <p style="margin-top:20px; font-weight:normal; font-family:'Amiri', serif; font-size:1.2rem;">${data.footer}</p>
                </div>
            </div>
        `;
    }

    // Logic
    function updateZIndexes() {
        const sheets = document.querySelectorAll('.page');
        sheets.forEach((sheet, index) => {
            if (sheet.classList.contains('flipped')) {
                sheet.style.zIndex = index + 50;
            } else {
                sheet.style.zIndex = 50 - index;
            }
        });
    }

    function turnNext() {
        const sheets = document.querySelectorAll('.page');
        if (currentPage < sheets.length) {
            sheets[currentPage].classList.add('flipped');
            currentPage++;
            updateZIndexes();
            flipSound.currentTime = 0;
            flipSound.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    function turnPrev() {
        const sheets = document.querySelectorAll('.page');
        if (currentPage > 0) {
            currentPage--;
            sheets[currentPage].classList.remove('flipped');
            updateZIndexes();
            flipSound.currentTime = 0;
            flipSound.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    renderBook();
});
