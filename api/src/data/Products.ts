const products = [
  {
    name: "Without Bug DDR5 RAM 32GB Kit",
    image: "/images/withoutbg-RAM.jpg",
    images: ["/images/withoutbg-RAM.jpg"],
    description:
      "High-speed DDR5 memory kit for gaming PCs and workstation builds with stable performance and low-latency operation.",
    descriptionUk:
      "Shvidkisnyi nabir operatyvnoi pamiati DDR5 dlia ihrovykh PK ta robochykh stantsii zi stabilnoiu robotou ta nyzkoiu zatrymkoiu.",
    descriptionEn:
      "High-speed DDR5 memory kit for gaming PCs and workstation builds with stable performance and low-latency operation.",
    brand: "Without Bug",
    category: "Components",
    price: 149.99,
    countInStock: 14,
    rating: 4.8,
    numReviews: 11,
  },
  {
    name: "Odyssey G7 Curved Gaming Monitor 32\"",
    image: "/images/monitor-823tgyifwo7fblfwe.png",
    images: ["/images/monitor-823tgyifwo7fblfwe.png"],
    description:
      "Immersive curved gaming monitor with a fast refresh rate, vivid color reproduction, and deep contrast for competitive play.",
    descriptionUk:
      "Velykyi vyhnutyi ihrovyi monitor z vysokoiu chastotoiu onovlennia, yaskravoiu peredacheiu koloriv i hlybokym kontrastom.",
    descriptionEn:
      "Immersive curved gaming monitor with a fast refresh rate, vivid color reproduction, and deep contrast for competitive play.",
    brand: "Samsung",
    category: "Monitors",
    price: 699.99,
    countInStock: 6,
    rating: 4.7,
    numReviews: 18,
  },
  {
    name: "RGB Mechanical Keyboard Pro",
    image: "/images/keyboard-7834b33v783gdfbjws86cwakjhqd8f.png",
    images: ["/images/keyboard-7834b33v783gdfbjws86cwakjhqd8f.png"],
    description:
      "Compact mechanical keyboard with RGB backlighting, responsive switches, and a durable frame for daily work and gaming.",
    descriptionUk:
      "Kompaktna mekhanichna klaviatura z RGB-pidsvitkoiu, chutlyvymy peremykachamy ta mitsnym korpusom dlia roboty i ihor.",
    descriptionEn:
      "Compact mechanical keyboard with RGB backlighting, responsive switches, and a durable frame for daily work and gaming.",
    brand: "HyperX",
    category: "Accessories",
    price: 119.99,
    countInStock: 22,
    rating: 4.6,
    numReviews: 25,
  },
  {
    name: "Bose QuietComfort Ultra Headphones",
    image: "/images/navushniki-bose-quietcomfort-ultra-headphones-black_f021a462-3.png",
    images: ["/images/navushniki-bose-quietcomfort-ultra-headphones-black_f021a462-3.png"],
    description:
      "Premium over-ear headphones with strong active noise cancellation, rich sound, and excellent comfort for long sessions.",
    descriptionUk:
      "Premium-navushnyky z aktyvnym shumo-pohlynanniam, nasichenym zvukom ta vysokym komfortom dlia tryvaloho vykorystannia.",
    descriptionEn:
      "Premium over-ear headphones with strong active noise cancellation, rich sound, and excellent comfort for long sessions.",
    brand: "Bose",
    category: "Audio",
    price: 429.99,
    countInStock: 9,
    rating: 4.9,
    numReviews: 31,
  },
  {
    name: "Xiaomi Pad 6 11\" Tablet",
    image: "/images/tablet-68rtyguh3w6823fy4f7t2gu.png",
    images: ["/images/tablet-68rtyguh3w6823fy4f7t2gu.png"],
    description:
      "Slim Android tablet with a bright display, smooth multitasking, and long battery life for study, browsing, and streaming.",
    descriptionUk:
      "Tonkyi Android-planshet z yaskravym ekranom, plavnoiu robotou ta tryvaloju avtonomnistiu dlia navchannia i rozvah.",
    descriptionEn:
      "Slim Android tablet with a bright display, smooth multitasking, and long battery life for study, browsing, and streaming.",
    brand: "Xiaomi",
    category: "Tablets",
    price: 349.99,
    countInStock: 12,
    rating: 4.5,
    numReviews: 14,
  },
  {
    name: "iPhone 15 Pro 256GB Green Titanium",
    image: "/images/57tug327tfgf49782tf932f.png",
    images: ["/images/57tug327tfgf49782tf932f.png"],
    description:
      "Flagship smartphone with a powerful chip, advanced camera system, premium titanium body, and impressive battery efficiency.",
    descriptionUk:
      "Flagmanskyi smartfon iz potuzhnym chypom, prosunutoiu kamerou, premium-korpusom ta vysokoiu enerhoefektyvnistiu.",
    descriptionEn:
      "Flagship smartphone with a powerful chip, advanced camera system, premium titanium body, and impressive battery efficiency.",
    brand: "Apple",
    category: "Smartphones",
    price: 1199.99,
    countInStock: 8,
    rating: 4.8,
    numReviews: 29,
  },
  {
    name: "Galaxy Watch 6 Classic",
    image: "/images/watches-678tdwgbv2348g23ifb23.png",
    images: ["/images/watches-678tdwgbv2348g23ifb23.png"],
    description:
      "Smartwatch with fitness tracking, health sensors, bright AMOLED display, and elegant everyday design.",
    descriptionUk:
      "Rozumnyi hodynnyk iz fitnes-trakinham, datchykamy zdorovia, yaskravym AMOLED-dyspleiem ta elegantnym dyzainom.",
    descriptionEn:
      "Smartwatch with fitness tracking, health sensors, bright AMOLED display, and elegant everyday design.",
    brand: "Samsung",
    category: "Wearables",
    price: 329.99,
    countInStock: 15,
    rating: 4.4,
    numReviews: 17,
  },
  {
    name: "UltraBook Vision 15",
    image: "/images/laptop-8v7egbvr876tygi234bf2.png",
    images: ["/images/laptop-8v7egbvr876tygi234bf2.png"],
    description:
      "Lightweight productivity laptop with a sharp display, fast SSD storage, and balanced performance for work and travel.",
    descriptionUk:
      "Lehkyi noutbuk dlia roboty ta podorozhei z yakisnym ekranom, shvydkym SSD ta zbalansovanoiu produktyvnistiu.",
    descriptionEn:
      "Lightweight productivity laptop with a sharp display, fast SSD storage, and balanced performance for work and travel.",
    brand: "Huawei",
    category: "Laptops",
    price: 899.99,
    countInStock: 7,
    rating: 4.5,
    numReviews: 12,
  },
  {
    name: "TravelBook Air 14",
    image: "/images/laptop-v87evgrygv78eb3131c2c2.png",
    images: ["/images/laptop-v87evgrygv78eb3131c2c2.png"],
    description:
      "Portable everyday laptop with modern design, solid battery life, and comfortable keyboard for mobile productivity.",
    descriptionUk:
      "Portatyvnyi noutbuk dlia shchodennoi roboty z suchasnym dyzainom, dobroiu avtonomnistiu ta zruchnoiu klaviaturoiu.",
    descriptionEn:
      "Portable everyday laptop with modern design, solid battery life, and comfortable keyboard for mobile productivity.",
    brand: "Honor",
    category: "Laptops",
    price: 799.99,
    countInStock: 10,
    rating: 4.3,
    numReviews: 9,
  },
  {
    name: "Dell Inspiron Notebook 14",
    image: "/images/dell-notebook-v76tsvbehwuf67wefw.png",
    images: ["/images/dell-notebook-v76tsvbehwuf67wefw.png"],
    description:
      "Reliable notebook for study and office use with practical ports, efficient cooling, and dependable performance.",
    descriptionUk:
      "Nadiinyi noutbuk dlia navchannia ta ofisnoi roboty z praktychnymy portamy, efektyvnym okholodzhenniam ta stabilnoiu robotou.",
    descriptionEn:
      "Reliable notebook for study and office use with practical ports, efficient cooling, and dependable performance.",
    brand: "Dell",
    category: "Laptops",
    price: 749.99,
    countInStock: 11,
    rating: 4.2,
    numReviews: 16,
  },
  {
    name: "RedView Tablet 12.4\"",
    image: "/images/tablet-dfs7tyfggbfewfuwtyfvw.png",
    images: ["/images/tablet-dfs7tyfggbfewfuwtyfvw.png"],
    description:
      "Large-screen tablet for multimedia, note-taking, and online meetings with a vibrant display and responsive interface.",
    descriptionUk:
      "Planshet z velykym ekranom dlia multymedia, notatok ta onlain-zustrich ei z yaskravym dyspleiem i shvydkoiu robotou.",
    descriptionEn:
      "Large-screen tablet for multimedia, note-taking, and online meetings with a vibrant display and responsive interface.",
    brand: "Lenovo",
    category: "Tablets",
    price: 419.99,
    countInStock: 9,
    rating: 4.4,
    numReviews: 10,
  },
  {
    name: "BluePad Air Tablet",
    image: "/images/tablet-aytddaiduagcy.png",
    images: ["/images/tablet-aytddaiduagcy.png"],
    description:
      "Versatile tablet with a clean design, strong everyday performance, and optimized entertainment experience.",
    descriptionUk:
      "Universalnyi planshet iz straktym dyzainom, dobroiu produktyvnistiu na shchoden ta zruchnym dosvidom dlia rozvah.",
    descriptionEn:
      "Versatile tablet with a clean design, strong everyday performance, and optimized entertainment experience.",
    brand: "Honor",
    category: "Tablets",
    price: 379.99,
    countInStock: 13,
    rating: 4.3,
    numReviews: 8,
  },
  {
    name: "Samsung Galaxy Fit Smart Band",
    image: "/images/smart-sam-uhvf87wfgewfbewf8ww.png",
    images: ["/images/smart-sam-uhvf87wfgewfbewf8ww.png"],
    description:
      "Compact smart fitness band with step tracking, workout monitoring, and excellent all-day wearing comfort.",
    descriptionUk:
      "Kompaktnyi smart-braslet iz pidrakhunkom krokiv, treningiv ta vysokym komfortom pid chas shchodennoho nosinnia.",
    descriptionEn:
      "Compact smart fitness band with step tracking, workout monitoring, and excellent all-day wearing comfort.",
    brand: "Samsung",
    category: "Wearables",
    price: 89.99,
    countInStock: 20,
    rating: 4.1,
    numReviews: 22,
  },
  {
    name: "Apple Watch Series GPS + Cellular 45mm",
    image: "/images/Apple-Watch-Series-9-GPS-Cellular-45mm-Graphite-S-Steel-Case-.png",
    images: ["/images/Apple-Watch-Series-9-GPS-Cellular-45mm-Graphite-S-Steel-Case-.png"],
    description:
      "Premium Apple Watch with cellular support, advanced health metrics, fast performance, and premium stainless steel finish.",
    descriptionUk:
      "Premium-hodynnyk Apple z pidtrymkoiu cellular, rozshyrenymy funktsiiamy zdorovia ta stalnym korpusom.",
    descriptionEn:
      "Premium Apple Watch with cellular support, advanced health metrics, fast performance, and premium stainless steel finish.",
    brand: "Apple",
    category: "Wearables",
    price: 649.99,
    countInStock: 5,
    rating: 4.9,
    numReviews: 13,
  },
  {
    name: "PlayStation 5 Slim Digital Edition",
    image: "/images/igrova-pristavka-sony-playstation-5-slim-digital-edition-1tb_7caf.png",
    images: ["/images/igrova-pristavka-sony-playstation-5-slim-digital-edition-1tb_7caf.png"],
    description:
      "Next-generation game console with fast load times, powerful graphics, and a compact refreshed slim design.",
    descriptionUk:
      "Ihrova konsol novoho pokolinnia z shvydkym zavantazhenniam, potuzhnoiu hrafikoiu ta kompaktnym slim-dyzainom.",
    descriptionEn:
      "Next-generation game console with fast load times, powerful graphics, and a compact refreshed slim design.",
    brand: "Sony",
    category: "Gaming",
    price: 549.99,
    countInStock: 7,
    rating: 4.9,
    numReviews: 27,
  },
  {
    name: "AirPods Pro 2",
    image: "/images/air-pods-pro-2-1.png.webp",
    images: ["/images/air-pods-pro-2-1.png.webp"],
    description:
      "True wireless earbuds with active noise cancellation, spatial audio, and seamless pairing across Apple devices.",
    descriptionUk:
      "Bezdrotovi navushnyky z aktyvnym shumo-pohlynanniam, prostrovym zvukom i zruchnym pidkliuchenniam do prystroiv Apple.",
    descriptionEn:
      "True wireless earbuds with active noise cancellation, spatial audio, and seamless pairing across Apple devices.",
    brand: "Apple",
    category: "Audio",
    price: 249.99,
    countInStock: 18,
    rating: 4.8,
    numReviews: 34,
  },
  {
    name: "Lenovo ThinkBook 16 Gen 6",
    image: "/images/thinkbook-876vftgwi87twe87gfwefwef7tg8v9.png",
    images: ["/images/thinkbook-876vftgwi87twe87gfwefwef7tg8v9.png"],
    description:
      "Business-class laptop with a modern chassis, high productivity, and practical connectivity for office workflows.",
    descriptionUk:
      "Biznes-noutbuk iz suchasnym korpusom, vysokoju produktyvnistiu ta zruchnymy mozhlyvostiamy pidkliuchennia dlia roboty.",
    descriptionEn:
      "Business-class laptop with a modern chassis, high productivity, and practical connectivity for office workflows.",
    brand: "Lenovo",
    category: "Laptops",
    price: 1049.99,
    countInStock: 6,
    rating: 4.6,
    numReviews: 15,
  },
  {
    name: "ROG Strix G16 Gaming Laptop",
    image: "/images/65D421F6-2A1E-49B7-881E-48777524A0.png",
    images: ["/images/65D421F6-2A1E-49B7-881E-48777524A0.png"],
    description:
      "Gaming laptop with aggressive styling, high-refresh display, and enough graphics power for modern AAA titles.",
    descriptionUk:
      "Ihrovyi noutbuk z agresyvnym dyzainom, ekranom iz vysokoiu chastotoiu onovlennia ta potuzhnoiu hrafikoiu.",
    descriptionEn:
      "Gaming laptop with aggressive styling, high-refresh display, and enough graphics power for modern AAA titles.",
    brand: "ASUS",
    category: "Gaming",
    price: 1599.99,
    countInStock: 4,
    rating: 4.7,
    numReviews: 19,
  },
  {
    name: "iPhone 8 Procelain Edition",
    image: "/images/8-pro-procelian.png",
    images: ["/images/8-pro-procelian.png"],
    description:
      "Elegant smartphone with premium finish, capable cameras, and smooth everyday performance in a compact body.",
    descriptionUk:
      "Elegantnyi smartfon z premium-ozdoblenniam, yakisnymy kameramy ta plavnoiu robotou v kompaktnomu korpusi.",
    descriptionEn:
      "Elegant smartphone with premium finish, capable cameras, and smooth everyday performance in a compact body.",
    brand: "Apple",
    category: "Smartphones",
    price: 699.99,
    countInStock: 9,
    rating: 4.2,
    numReviews: 7,
  },
  {
    name: "Galaxy S24 Plus Gray",
    image: "/images/s-24-plus-gray-2.png",
    images: ["/images/s-24-plus-gray-2.png"],
    description:
      "High-end Android smartphone with bright display, powerful cameras, and flagship-class performance for everyday use.",
    descriptionUk:
      "Topovyi Android-smartfon z yaskravym ekranom, potuzhnymy kameramy ta flagmanskoiu produktyvnistiu.",
    descriptionEn:
      "High-end Android smartphone with bright display, powerful cameras, and flagship-class performance for everyday use.",
    brand: "Samsung",
    category: "Smartphones",
    price: 999.99,
    countInStock: 10,
    rating: 4.7,
    numReviews: 21,
  },
  {
    name: "Sony WH-1000XM5 Silver",
    image: "/images/navushniki-sony-wh-1000xm5-silv-wh-1000xm5s.png",
    images: ["/images/navushniki-sony-wh-1000xm5-silv-wh-1000xm5s.png"],
    description:
      "Wireless premium headphones with excellent ANC, warm detailed sound, and premium materials in a light design.",
    descriptionUk:
      "Bezdrotovi premium-navushnyky z vidminnym ANC, detalnym zvukom ta lehkym komfortnym dyzainom.",
    descriptionEn:
      "Wireless premium headphones with excellent ANC, warm detailed sound, and premium materials in a light design.",
    brand: "Sony",
    category: "Audio",
    price: 399.99,
    countInStock: 8,
    rating: 4.8,
    numReviews: 26,
  },
  {
    name: "MacBook Air 13 M3 2024",
    image: "/images/mba_13_m3_2024_hero.png",
    images: ["/images/mba_13_m3_2024_hero.png"],
    description:
      "Ultra-thin Apple laptop with M3 chip, silent operation, long battery life, and premium display quality.",
    descriptionUk:
      "Nadtonkyi noutbuk Apple z chypom M3, bezshumnoiu robotoiu, tryvaloju avtonomnistiu ta yakisnym ekranom.",
    descriptionEn:
      "Ultra-thin Apple laptop with M3 chip, silent operation, long battery life, and premium display quality.",
    brand: "Apple",
    category: "Laptops",
    price: 1299.99,
    countInStock: 7,
    rating: 4.9,
    numReviews: 24,
  },
  {
    name: "iPhone 15 Pro Max Titanium",
    image: "/images/6hgfv7dfbfcv0wsje73.png",
    images: ["/images/6hgfv7dfbfcv0wsje73.png"],
    description:
      "Premium flagship iPhone with titanium body, excellent cameras, strong battery life, and top-tier performance.",
    descriptionUk:
      "Premium-flagman iPhone z tytanovym korpusom, vidminnymy kameramy, tryvaloju avtonomnistiu ta potuzhnoiu robotou.",
    descriptionEn:
      "Premium flagship iPhone with titanium body, excellent cameras, strong battery life, and top-tier performance.",
    brand: "Apple",
    category: "Smartphones",
    price: 1249.99,
    countInStock: 6,
    rating: 4.8,
    numReviews: 20,
  },
  {
    name: "Xbox Series X",
    image: "/images/xbox-vf6vryh4b28v6t32ib32.png",
    images: ["/images/xbox-vf6vryh4b28v6t32ib32.png"],
    description:
      "Powerful home console for 4K gaming with fast SSD storage, quick resume, and excellent ecosystem support.",
    descriptionUk:
      "Potuzhna domashnia konsol dlia 4K-ihor z shvydkym SSD, funktsiieiu quick resume ta sylnoiu ekosystemoiu.",
    descriptionEn:
      "Powerful home console for 4K gaming with fast SSD storage, quick resume, and excellent ecosystem support.",
    brand: "Microsoft",
    category: "Gaming",
    price: 599.99,
    countInStock: 8,
    rating: 4.7,
    numReviews: 23,
  },
];

export default products;
