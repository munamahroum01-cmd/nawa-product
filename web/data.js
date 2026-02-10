const bookData = [
    {
        type: "cover",
        title: "نوى - NAWA",
        subtitle: "طعم صحي.. ومذاق أصلي",
        image: "assets/logo.jpeg",
        footer: "طبيعية 100%<br>بدون سكر<br>بدون زيوت مهدرجة"
    },
    {
        type: "intro",
        title: "عن نوى",
        text: "نوى هو براند فلسطيني محلي، مصنوع لحتى يهتم بأدق التفاصيل من الانتاج للتغليف والتقديم. هدفه يعطيكم تجربة رائعة بالتذوق، لحتى يحكيلكم انه الطعم الصحي لذيذ كمان! وبتقدر تستغني عن أي منتج باضافات صناعية من خلاله.",
        footer: "منتجاتنا مثالية للرياضيين, للأطفال, لمرضى السكري, وللجميع!"
    },
    {
        type: "product",
        product: "زبدة الفول السوداني",
        description: "زبدة الفول السوداني هي واحدة من أكثر المصادر الطبيعية توازنًا بين الطاقة والتغذية. غنية بالبروتين النباتي والدهون الصحية، بتساعد الجسم على بناء العضلات والحفاظ على الشعور بالشبع لفترات أطول. تحتوي على فيتامين E و B3 ومعادن كالمغنيسيوم والبوتاسيوم.",
        features: [
            "بدون سكر",
            "بدون اضافات وألوان صناعية",
            "نباتي وطبيعي 100%"
        ],
        image: "assets/peanut_ingredients.jpeg",
        imageStyle: "contain",
        tableImage: "assets/peanut_table.png"
    },
    {
        type: "product",
        product: "زبدة جوز الهند",
        description: "زبدة جوز الهند غنية بالدهون متوسطة السلسلة (MCT) اللي بيمتصها الجسم بسرعة وبيحوّلها لطاقة مباشرة، وهاد بخليها خيار مثالي لدعم التركيز وصحة الدماغ. قوامها الكريمي وطعمها الطبيعي بيدخل بسهولة بالحلويات الصحية والقهوة.",
        features: ["طاقة نظيفة", "مناسبة للكيتو", "بدون اضافات"],
        image: "assets/coconut_ingredients.png",
        tableImage: "assets/coconut_table.png"
    },
    {
        type: "product",
        product: "زبدة Prime",
        description: "مزيج ذكي من بذور القرع مع جذور الموكا، القرفة السيلانية، والكاكاو الخام. هاد الخليط بيوفر طاقة وتركيز بطريقة طبيعية، وبدعم الجسم بمضادات أكسدة ومعادن أساسية مثل المغنيسيوم والزنك. بديل صحي للمشروبات المحلاة.",
        features: ["طاقة وتركيز", "مضادات أكسدة", "بدون سكر"],
        image: "assets/prime_ingredients.jpeg",
        tableImage: "assets/prime_table.png" // Placeholder, check specific image
    },
    {
        type: "product",
        product: "زبدة السوبر",
        description: "وجبة غذائية متكاملة بحد ذاتها. خليط غني من الفول السوداني، بذور القرع، الكتان، السمسم، الجوز، واللوز، محلاة بدبس التمر الطبيعي. بتحتوي على أوميغا 3، ألياف، بروتين نباتي، ومعادن متعددة.",
        features: ["أوميغا 3", "محلى بدبس التمر", "بروتين عالي"],
        image: "assets/super_new.jpeg",
        tableImage: "assets/peanut_table.png" // Fallback or missing in extracted list
    },
    {
        type: "product",
        product: "الطحينة بالسمسم",
        description: "منتج أساسي غني بالكالسيوم والحديد والدهون الصحية، بيدعم صحة العظام والقلب. قوامها الناعم وطعمها الأصيل بخليها مناسبة للأطباق المالحة والحلوة. بتقدر من خلاله تستبدل الطحينة التجارية بسهولة.",
        features: ["كالسيوم عالي", "دهون صحية", "سمسم صافي"],
        image: "assets/tahini_new.jpeg",
        tableImage: "assets/tahini_table.png"
    },
    {
        type: "product",
        product: "زبدة البستاشيو",
        description: "طعم فاخر وغني بمضادات الأكسدة والفيتامينات، خصوصًا فيتامين B6 المهم لصحة الدماغ والمناعة. بتدعم صحة القلب والبصر. خيار ممتاز للأطفال والكبار الباحثين عن تغذية صحية بطعم مميز.",
        features: ["فيتامين B6", "طعم فاخر", "صحة القلب"],
        image: "assets/pistachio_ingredients.jpeg",
        tableImage: "assets/pistachio_table.png"
    },
    {
        type: "product",
        product: "زبدة المكاديميا",
        description: "من أفخم وأغنى الزبدات. تحتوي على نسبة عالية من الدهون الأحادية غير المشبعة اللي بتدعم صحة القلب. طعمها ناعم ومخملي، وسهلة الهضم. مناسبة للكيتو والأنظمة منخفضة الكربوهيدرات.",
        features: ["دهون أحادية غير مشبعة", "نباتي", "مناسب للكيتو"],
        image: "assets/macadamia_new.jpeg",
        tableImage: "assets/macadamia_table.png"
    },
    {
        type: "product",
        product: "سمسم وعسل",
        description: "مزيج بسيط وطبيعي: السمسم يعطي الجسم كالسيوم ودهون صحية، والعسل يضيف حلاوة طبيعية. طعمه دافئ وكريمي، مناسب للفطور أو مع الفواكه.",
        features: ["محلى بالعسل", "كالسيوم", "طاقة طبيعية"],
        image: "assets/sesame_honey_new.jpeg", /* Reverted to Smsm asal.jpeg by request */
        tableImage: "assets/sesame_honey_table.png"
    },
    {
        type: "product",
        product: "بذور القرع",
        description: "مصدر ممتاز للزنك والمغنيسيوم، العناصر اللي بتقوي المناعة وتدعم صحة الهرمونات. فيها بروتين نباتي عالي ودهون صحية. خيار مثالي للرياضيين.",
        features: ["زنك ومغنيسيوم", "بروتين نباتي", "دعم المناعة"],
        image: null, /* Photo removed by request */
        tableImage: "assets/pumpkin_table.png"
    },
    {
        type: "product",
        product: "زبدة اللوز",
        description: "فيها فيتامين E ودهون صحية مفيدة للقلب، وكمان مغنيسيوم وكالسيوم. طعمها متوازن وقوامها كريمي. مناسبة للي بيديروا السكر بالدم ومتبعي الدايت.",
        features: ["فيتامين E", "صحة العظام", "قليل الكربوهيدرات"],
        image: null, /* Photo removed by request */
        tableImage: "assets/coconut_table.png"
    }
];
