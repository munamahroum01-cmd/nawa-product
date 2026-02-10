document.addEventListener('DOMContentLoaded', () => {
    const book = document.getElementById('book');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let currentPage = 0; // The index of the sheet that is currently "on top" flipped

    // Page Flip Sound
    const flipSound = new Audio('assets/page-flip.mp3');
    flipSound.volume = 0.5; // Adjustable volume

    // Helper to create a DOM element

    // Helper to create a DOM element
    function createEl(tag, classNames, content = '') {
        const el = document.createElement(tag);
        if (classNames) el.className = classNames;
        el.innerHTML = content;
        return el;
    }

    function renderBook() {
        book.innerHTML = '';

        let zCounter = 50; // High Z-index start
        let pageIndex = 1;

        // --- SHEET 1: Cover (Front) / Intro (Back - Right Page of Spread 1) ---
        // In RTL, "Front" covers are usually the Right-most element.
        // When you flip Sheet 1 (Cover), it goes to the Left.
        // The Back of Sheet 1 becomes the LEFT page of the spread? 
        // LTR: Cover (Front, Right). Flip -> Cover Back (Left). Next Page Front (Right).
        // RTL: Cover (Front, Left? No, Arabic books open from Right). 
        // Let's stick to the visual:
        // A page sits on the right. You grab the left edge and pull it right? No, RTL you grab right edge and pull left.
        // My CSS `transform-origin: left center` suggests LTR flipping (hinge on left).
        // FOR RTL FLIPBOOK: transform-origin should be RIGHT center.
        // I will stick to LTR mechanics but place RTL content, or user might find it backward.
        // User asked for "Interactive book".
        // Let's assume standard CSS LTR flip mechanics (spine on left) for simplicity unless requested specific RTL interaction physics.
        // IF Spine on LEFT:
        // Sheet 1 Front: Visible initially (Right side).
        // Flip Sheet 1 -> It goes Left.
        // Now Visible: Sheet 1 Back (Left Side) | Sheet 2 Front (Right Side).

        // MAPPING for "Description (Table) + Photo (Opposite)":
        // I will place Description on Sheet N Back (Left) and Photo on Sheet N+1 Front (Right).
        // OR Description on Right, Photo on Left.
        // Let's do: Right (Sheet N Front) = Description. Left (Sheet N-1 Back) = Photo?

        // Let's start building sheets:

        const sheets = [];

        // Sheet 0: Cover
        sheets.push({
            front: generateCover(bookData[0]),
            back: generateIntro(bookData[1])
        });

        // Products
        // For each product, we want a Spread.
        // Since a Spread is [Back of Previous] + [Front of Current], 
        // AND we just burned "Back of Sheet 0" for Intro.
        // The next view (Open 1) shows: Sheet 0 Back (Intro) | Sheet 1 Front (Start of Products?).

        // Let's put Product 1 Description on Sheet 1 Front (Right).
        // And Product 1 Photo on Sheet 1 Back (Left).
        // Wait, if Desc is on Front (Right) and Photo is on Back (Left of SAME sheet) -> You can never see them together.
        // You see Front. You flip. You see Back (Left) and Next Front (Right).

        // REVISED PAIRING STRATEGY:
        // Spread 1: [Intro (Left/Back 0)] - [Product 1 Desc (Right/Front 1)]
        // Spread 2: [Product 1 Photo (Left/Back 1)] - [Product 2 Desc (Right/Front 2)]
        // Spread 3: [Product 2 Photo (Left/Back 2)] - [Product 3 Desc (Right/Front 3)]
        // ...
        // This links (Photo 1 + Desc 2) -> BAD. User wants Product + Its Photo together.

        // CORRECT PAIRING vs SHEETS:
        // Spread X: [Product N Photo (Left)] - [Product N Desc (Right)]. (Or vice versa).
        // To achieve [Photo Left] | [Desc Right]:
        // Left Page = Back of Sheet N. Right Page = Front of Sheet N+1.
        // So: Sheet N Back = Photo. Sheet N+1 Front = Desc.

        // Let's map it:
        // Sheet 0 Front: Cover.
        // Sheet 0 Back: Intro. (Visible on Left).
        // Sheet 1 Front: Product 1 Description. (Visible on Right).
        // -> This forms Open 1: [Intro] [P1 Desc]. (Mixed spread).

        // User wants "Description... one page, Photo... opposite".
        // Let's try to group them on the SAME VISUAL SPREAD.
        // We need padding/blank pages if needed to align them.

        // Layout A: [Photo (Left)] [Desc (Right)]
        // Sheet 0 Front: Cover.
        // Sheet 0 Back: BLANK or Intro.
        // Sheet 1 Front: BLANK or Intro.

        // Let's do:
        // View 0: Cover.
        // Flip -> View 1: [Intro (Left/Back0)] [Product 1 Desc (Right/Front1)]. -> Photo 1 needs to be on Left?
        // If we want P1 Desc + P1 Photo together:
        // Sheet 1 Front (Right): P1 Desc.
        // Sheet 1 Back (Left): P1 Photo. (Visible when flipped).
        // Sheet 2 Front (Right): P2 Desc. (Visible when flipped, next to P1 Photo).
        // -> Result: [P1 Photo] [P2 Desc]. -> Bad mixing.

        // We need:
        // Sheet 1 Front: P1 Desc.
        // Sheet 1 Back: P1 Photo.
        // Sheet 2 Front: P1 Photo?? No.

        // We need the visual spread to be consistent.
        // Spread = Left Page (Back of S_i) + Right Page (Front of S_i+1).
        // We want Back (S_i) = P_X Photo. Front (S_i+1) = P_X Desc.
        // Then Back (S_i+1) = P_Y Photo. Front (S_i+2) = P_Y Desc.

        // So:
        // Sheet 0 Back: Intro.
        // Sheet 1 Front: Product 1 Description.
        // Sheet 1 Back: Product 1 Photo.
        // Sheet 2 Front: Product 2 Description. -> [P1 Photo | P2 Desc] -> MIXED!

        // TO FIX MIXING: We need "dead" sides or double sheets.
        // Or simply:
        // Layout B: [Desc (Left)] [Photo (Right)]
        // Left Page (Back of S_i) = Desc. Right Page (Front of S_i+1) = Photo.
        // Sheet 0 Back: Intro.
        // Sheet 1 Front: Product 1 Description? No, that would make [Intro | P1 Desc].
        // Let's force alignment:
        // Sheet 0 Back: Intro.
        // Sheet 1 Front: Product 1 Photo. -> [Intro | P1 Photo]. (OK start).
        // Sheet 1 Back: Product 1 Desc.
        // Sheet 2 Front: Product 2 Photo. -> [P1 Desc | P2 Photo]. MIXED!

        // The only way to have ISOLATED spreads per product is:
        // [P1 Desc | P1 Photo]
        // [P2 Desc | P2 Photo]
        // This implies turning a page changes BOTH sides to the new product.
        // That is NOT how a book works. A book changes one leaf.
        // Unless... we treat "One Product" as "One Leaf" (Front/Back)?
        // No, user said "Opposite page".

        // Okay, usually in such catalogs:
        // Spread 1: P1 Left, P1 Right.
        // Spread 2: P2 Left, P2 Right.
        // This requires:
        // Sheet 0 Back: P1 Left. Sheet 1 Front: P1 Right.
        // Sheet 1 Back: P2 Left. Sheet 2 Front: P2 Right.
        // This works perfectly!

        // So:
        // Sheet 0 Back: Intro.
        // Sheet 1 Front: "Nawa Philosophy" or P1 Start?
        // If we simply list products:
        // Sheet 0 Back: Intro.
        // Sheet 1 Front: P1 Photo. -> Spread: [Intro | P1 Photo]. (Maybe OK).
        // Sheet 1 Back: P1 Desc.
        // Sheet 2 Front: P2 Photo. -> Spread: [P1 Desc | P2 Photo]. (This is the mixing issue).

        // SOLUTION: Blank pages / Filler.
        // Spread: [P1 Desc | P1 Photo].
        // Next Spread: [P2 Desc | P2 Photo].
        // Requires:
        // Sheet K Back: P1 Desc.
        // Sheet K+1 Front: P1 Photo.
        // Sheet K+1 Back: BLANK/Filler.
        // Sheet K+2 Front: BLANK/Filler. -> To hide the transition? No.

        // Let's re-read: "re-orgenize the pages".
        // Maybe he accepts [P1 Desc | P1 Photo] then flip -> [P2 Desc | P2 Photo].
        // If I put P1 Desc on Back of Sheet 1, and P1 Photo on Front of Sheet 2.
        // Then Back of Sheet 2 MUST be P2 Desc. Front of Sheet 3 MUST be P2 Photo.
        // This creates a perfect chain:
        // S1 Back (P1 Desc) | S2 Front (P1 Photo).
        // S2 Back (P2 Desc) | S3 Front (P2 Photo).
        // S3 Back (P3 Desc) | S4 Front (P3 Photo).
        // This works!
        // The valid pairs are Back_N + Front_N+1.

        // Start:
        // Sheet 0 Front: Cover.
        // Sheet 0 Back: Intro.
        // Sheet 1 Front: ...? 
        // We need pair [Intro | ?].
        // Let's put P1 Photo on Right (Sheet 1 Front)?
        // Then [Intro | P1 Photo].
        // Flip -> [Sheet 1 Back | Sheet 2 Front].
        // We want this to be [P1 Desc | ?]. No, we want P1 to be together.

        // How about:
        // Open 1: [Intro | P1 Table(Desc)].
        // Flip ->
        // Open 2: [P1 Photo | P2 Table(Desc)].
        // This is the efficient catalog style (Continuous).

        // User said: "each product should be with its table... and photo on the opposite page."
        // And "re-organize".
        // I will implement the Continuous Chain (Desc Left / Photo Right? Or vice versa).
        // User photo: Spoon into jar.
        // Let's do:
        // Left Page: Description/Table.
        // Right Page: Photo/Visual.
        // So Spread = [Desc | Photo].
        // Left = Back of Sheet N. Right = Front of Sheet N+1.

        // Content Config:
        // Sheet 0 Front: Cover.
        // Sheet 0 Back: Intro.

        // Sheet 1 Front: P1 Photo. (Spread 1: Intro | P1 Photo).
        // Sheet 1 Back: P1 Desc.
        // Sheet 2 Front: P2 Photo. (Spread 2: P1 Desc | P2 Photo). -> MIXING P1 and P2.

        // If user hates mixing, we need:
        // Spread 1: [P1 Desc | P1 Photo].
        // Spread 2: [P2 Desc | P2 Photo].
        // This requires an empty spread in between? No, just consistent sides.
        // Actually, if we stick to strict [Left=Desc, Right=Photo], we ALWAYS mix (Previous Desc + Next Photo).
        // UNLESS we define "Product" as taking 2 Sheets (4 pages)?
        // P1: Spread 1. P2: Spread 2.
        // Impossible in a physical book without blank pages between.
        // OR:
        // Left Page: P1 Photo. Right Page: P1 Desc.
        // Flip.
        // Left Page: P2 Photo. Right Page: P2 Desc.
        // This works!
        // Back of Sheet N = P1 Photo. Front of Sheet N+1 = P1 Desc.
        // Back of Sheet N+1 = P2 Photo. Front of Sheet N+2 = P2 Desc.

        // Let's implement THIS strict pairing: [Photo | Desc].
        // Sheet 0 Front: Cover.
        // Sheet 0 Back: Intro (Left).
        // Sheet 1 Front: "Our Products" / Title? (Right). -> Spread: [Intro | Title].
        // Sheet 1 Back: P1 Photo.
        // Sheet 2 Front: P1 Desc. -> Spread: [P1 Photo | P1 Desc].
        // Sheet 2 Back: P2 Photo.
        // Sheet 3 Front: P2 Desc. -> Spread: [P2 Photo | P2 Desc].
        // Perfect.

        bookData.slice(2).forEach((item, index) => { // Skip cover/intro logic placeholders logic
            if (item.type === 'product') { // Filter real products
                // We need to push 1 sheet per product? No.
                // We are mapping Back/Front slots.
                // We populate the 'pages' logic abstractly then build sheets.
            }
        });

        // Let's abstract "Pages" array first (0=Cover, 1=Empty/Intro, etc).
        // Page 0: Cover (Front Sheet 0)
        // Page 1: Intro (Back Sheet 0)
        // Page 2: Collection Title (Front Sheet 1)
        // Page 3: P1 Photo (Back Sheet 1)
        // Page 4: P1 Desc (Front Sheet 2)
        // ...

        const contentPages = [];
        // 0: Cover
        contentPages.push(generateCover(bookData[0]));
        // 1: Intro
        contentPages.push(generateIntro(bookData[1]));
        // 2: Spacer/Title
        contentPages.push(`<div class="product-full-page"><h1>Our Collection</h1><p>Natural & Organic</p></div>`);

        const products = bookData.filter(i => i.type === 'product');
        products.forEach(p => {
            // Photo Page (Left)
            contentPages.push(generatePhotoPage(p));
            // Desc Page (Right)
            contentPages.push(generateDescPage(p));
        });

        // Custom Request Message Page (Page 24 - Switched back)
        const productsImg = "assets/productsss.png";
        contentPages.push(generateMessagePage({
            title: "طلب خاص؟",
            text: "منتجاتنا كتيرة, بس مع هيك ما عنا مشكلة نعملكم منتج معين بناءا على طلبكم!<br>لهيك ما تترددوا تحكوا معنا اذا في طعم معين ببالكم",
            image: productsImg
        }));

        // Locations / Map Page (Page 25 - Switched back)
        contentPages.push(generateLocationsPage({
            image: "assets/Map.jpg",
            title: "نقاط بيعنا في:",
            points: ["جنين", "رام الله", "نابلس", "الخليل"],
            footer: "وبنرحب بنقاط بيع جديدة!"
        }));

        // Instagram Page (The End - Page 26)
        contentPages.push(generateInstagramPage());

        // Loop and bind to Sheets
        // Sheet 0: Pages[0] (F), Pages[1] (B)
        // Sheet 1: Pages[2] (F - PAGE 3), Pages[3] (B)
        // ...
        for (let i = 0; i < contentPages.length; i += 2) {
            const frontHTML = contentPages[i];
            const backHTML = contentPages[i + 1] || `
                <div class="product-full-page instagram-page">
                    <img src="assets/instagram_new.png" class="insta-code" alt="Instagram">
                    <h2>Add us on Instagram!</h2>
                </div>`;

            const sheet = createEl('div', 'page');

            // Check for Page 3 (System Index 2, which is Front of Sheet 1)
            // i=0 -> Page 1(F), Page 2(B).
            // i=2 -> Page 3(F), Page 4(B).
            // Front Classes
            let frontClass = "page-front";
            // if (i === 0) frontClass += " no-texture"; // REMOVED to restore Pal.jpg
            if (i === 2) frontClass += " page-3-background"; // Collection Title
            // if (frontHTML.includes('instagram-page')) frontClass += " no-texture"; // REMOVED Pal.jpg requested back
            if (frontHTML.includes('products-page')) frontClass += " no-texture"; // Products (Legacy check)

            // Back Classes
            let backClass = "page-back";
            // if (backHTML.includes('instagram-page')) backClass += " no-texture"; // REMOVED Pal.jpg requested back
            if (backHTML.includes('products-page')) backClass += " no-texture"; // Products
            // Determine if this is the Cover (First page) or End (Last page)
            // i=0 is Cover. i=contentPages.length-2 is likely the last sheet??
            // Actually, we can check based on loops.

            // Add ID to specific page sides for CSS targeting (to remove backgrounds)
            const frontId = (i === 0) ? 'id="cover-front-bg"' : '';
            const backId = (i >= contentPages.length - 2) ? 'id="end-back-bg"' : '';

            // Removed explicit 'frontStyle' that forced no-background.
            // Default CSS (.page-front, .page-back) has Pal.jpg.

            sheet.innerHTML = `
                <div class="${frontClass}" ${frontId}>${frontHTML}<div class="page-number">${i + 1}</div></div>
                <div class="${backClass}" ${backId}>${backHTML}<div class="page-number">${i + 2}</div></div>
            `;
            // Z-index calculation
            sheet.style.zIndex = zCounter--;
            sheets.push(sheet);
            book.appendChild(sheet);

            // Interaction Logic: Click to flip
            // Closure capture of specific sheet index when created is risky because indices shift? 
            // No, sheets array matches DOM order.

            // The sheet element itself represents the "Leaf".
            // If leaf is NOT flipped, it shows FRONT (Right side). Click -> Flip Next.
            // If leaf IS flipped, it shows BACK (Left side). Click -> Flip Prev.

            // BUT: Z-indexing makes them stack.
            // On Right: Top-most non-flipped sheet is valid to click.
            // On Left: Top-most flipped sheet is valid to click.

            sheet.addEventListener('click', (e) => {
                // Find actual current index of this sheet in the sheets list
                // We can't rely on 'i/2' because sheets is local to render function?
                // Actually we can, but let's be dynamic.
                const allSheets = Array.from(document.querySelectorAll('.page'));
                const myIndex = allSheets.indexOf(sheet);

                if (myIndex === currentPage) {
                    // This is the top-most Right page. Flip it.
                    turnNext();
                } else if (myIndex === currentPage - 1) {
                    // This is the top-most Left page. Flip it back.
                    turnPrev();
                }
            });
        }

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
        // Special class for Page 3 (First product)
        const isSpoon = data.image && data.image.includes('spoon');

        // If no image, render empty container (or placeholder)
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

    function generatePhotoOnlyPage(imgSrc) {
        return `
            <div class="product-full-page products-page" style="padding:0;">
                <img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover;" alt="Products">
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
            // Play Sound
            flipSound.currentTime = 0;
            flipSound.play().catch(e => console.log("Audio play failed (maybe needs interaction):", e));
        }
    }

    function turnPrev() {
        const sheets = document.querySelectorAll('.page');
        if (currentPage > 0) {
            currentPage--;
            sheets[currentPage].classList.remove('flipped');
            updateZIndexes();
            // Play Sound
            flipSound.currentTime = 0;
            flipSound.play().catch(e => console.log("Audio play failed (maybe needs interaction):", e));
        }
    }

    // function updateButtons() { ... } // Removed

    // nextBtn.addEventListener('click', turnNext); // Removed
    // prevBtn.addEventListener('click', turnPrev); // Removed

    renderBook();
    // updateButtons();
});
