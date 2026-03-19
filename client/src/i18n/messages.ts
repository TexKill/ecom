export type Lang = "uk" | "en";

export type Messages = {
  header: {
    home: string;
    products: string;
    favorites: string;
    contact: string;
    searchPlaceholder: string;
    toggleMenu: string;
  };
  auth: {
    login: string;
    register: string;
    welcomeBack: string;
    loginSubtitle: string;
    createAccount: string;
    registerSubtitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    signIn: string;
    createAccountBtn: string;
    noAccount: string;
    hasAccount: string;
    registerHere: string;
    logIn: string;
    invalidCredentials: string;
    unexpectedError: string;
    passwordsMismatch: string;
    registrationFailed: string;
    emailInUse: string;
    showPassword: string;
    hidePassword: string;
    showConfirmPassword: string;
    hideConfirmPassword: string;
  };
  cart: {
    title: string;
    empty: string;
    emptySubtitle: string;
    startShopping: string;
    continueShopping: string;
    clear: string;
    orderSummary: string;
    shipping: string;
    shippingAtCheckout: string;
    total: string;
    proceed: string;
    subtotal: string;
    viewCart: string;
    items: string;
  };
  home: {
    deals: string;
    heroTitleStart: string;
    heroTitleAccent: string;
    heroSubtitle: string;
    shopNow: string;
    allProducts: string;
    searchProducts: string;
    loadFail: string;
    tryAgain: string;
    noProductsFound: string;
    seeAll: string;
  };
  products: {
    filters: string;
    allProducts: string;
    searchTitle: string;
    loading: string;
    loadFail: string;
    noProducts: string;
    categories: string;
    allCategories: string;
    brands: string;
    priceRange: string;
    clearFilters: string;
    sortBy: string;
    newest: string;
    price_asc: string;
    price_desc: string;
    rating_desc: string;
    name_asc: string;
  };
  product: {
    notFound: string;
    returnHome: string;
    backToProducts: string;
    similarTitle: string;
    similarSubtitle: string;
    noSimilar: string;
    reviewsCount: string;
    status: string;
    inStock: string;
    outOfStock: string;
    removedFromFavorites: string;
    addedToFavorites: string;
    inFavorites: string;
    addToFavorites: string;
    addToCart: string;
    reviewsTitle: string;
    noReviews: string;
    removing: string;
    delete: string;
    writeReview: string;
    please: string;
    toLeaveReview: string;
    signIn: string;
    alreadyReviewed: string;
    rating: string;
    comment: string;
    ratingExcellent: string;
    ratingGood: string;
    ratingAverage: string;
    ratingPoor: string;
    ratingBad: string;
    submitting: string;
    submitReview: string;
    submitSuccess: string;
    submitFail: string;
    removeSuccess: string;
    removeFail: string;
    aboutProduct: string;
    characteristicsLabel: string;
    reviewsAndQuestions: string;
    buyTogether: string;
    brief: string;
    brandLabel: string;
    categoryLabel: string;
    priceLabel: string;
    availabilityLabel: string;
  };
  favorites: {
    title: string;
    moveAllToCart: string;
    clearAll: string;
    guestHint: string;
    signIn: string;
    syncHint: string;
    empty: string;
    browseProducts: string;
    inStock: string;
    outOfStock: string;
    add: string;
    remove: string;
    cleared: string;
    movedToCart: string;
    removed: string;
    addAria: string;
  };
  orders: {
    title: string;
    loading: string;
    loadFail: string;
    empty: string;
    order: string;
    dateUnavailable: string;
    paid: string;
    pending: string;
    status: string;
    statusPending: string;
    statusProcessing: string;
    statusShipped: string;
    statusDelivered: string;
    statusCancelled: string;
    paymentStatus: string;
    deliveryStatus: string;
    unpaid: string;
    customer: string;
    customerName: string;
    customerEmail: string;
    customerId: string;
    payWithLiqPay: string;
    paying: string;
    paymentInitFail: string;
  };
  account: {
    title: string;
    name: string;
    email: string;
    role: string;
    admin: string;
    customer: string;
    myOrders: string;
    adminDashboard: string;
    myAccount: string;
  };
  checkout: {
    account: string;
    myAccount: string;
    product: string;
    viewCart: string;
    checkout: string;
    billingDetails: string;
    streetAddress: string;
    apartment: string;
    townCity: string;
    phoneNumber: string;
    emailAddress: string;
    postalCode: string;
    country: string;
    saveInfo: string;
    shipping: string;
    free: string;
    subtotal: string;
    total: string;
    paymentMethod: string;
    bank: string;
    cod: string;
    couponCode: string;
    applyCoupon: string;
    couponApplied: string;
    couponRemoved: string;
    couponInvalid: string;
    couponNotFound: string;
    couponInactive: string;
    couponExpired: string;
    couponMinOrder: string;
    discount: string;
    placeOrder: string;
    placing: string;
    terms: string;
    needEdit: string;
    goBackToCart: string;
    couponEnter: string;
    couponNext: string;
    orderFail: string;
    streetAddressPlaceholder: string;
    apartmentPlaceholder: string;
    townCityPlaceholder: string;
    countryPlaceholder: string;
  };
  admin: {
    title: string;
    products: string;
    orders: string;
    promos: string;
    loadFail: string;
    loading: string;
    editProduct: string;
    createProduct: string;
    productName: string;
    brand: string;
    category: string;
    imageUrl: string;
    images: string;
    uploadImageFile: string;
    uploading: string;
    uploadHint: string;
    priceUah: string;
    countInStock: string;
    description: string;
    descriptionUk: string;
    descriptionEn: string;
    saveFail: string;
    uploadFail: string;
    deleteProductFail: string;
    deliverFail: string;
    deleteOrderFail: string;
    shortDescription: string;
    saving: string;
    add: string;
    update: string;
    create: string;
    cancel: string;
    name: string;
    price: string;
    stock: string;
    actions: string;
    edit: string;
    delete: string;
    restock: string;
    restocking: string;
    order: string;
    user: string;
    total: string;
    paid: string;
    paymentTx: string;
    delivered: string;
    yes: string;
    no: string;
    deliver: string;
    confirmAction: string;
    actionFailed: string;
    confirmDeleteProductTitle: string;
    confirmDeleteProductMessage: string;
    confirmDeleteOrderTitle: string;
    confirmDeleteOrderMessage: string;
    confirmDeliverTitle: string;
    confirmDeliverMessage: string;
    confirmStatusTitle: string;
    confirmStatusMessage: string;
    confirmRestockTitle: string;
    confirmRestockMessage: string;
    productUpdated: string;
    productCreated: string;
    imageUploaded: string;
    productDeleted: string;
    orderDelivered: string;
    orderDeleted: string;
    orderStatusUpdated: string;
    productsRestocked: string;
    view: string;
    paymentsTab: string;
    statsTotalOrders: string;
    statsPaidOrders: string;
    statsPendingOrders: string;
    statsDeliveredOrders: string;
    statsTotalRevenue: string;
    statsPaidRevenue: string;
    statsUnpaidOrders: string;
    statsAvgOrderValue: string;
    paymentsStatus: string;
    paymentsDateFrom: string;
    paymentsDateTo: string;
    paymentsAll: string;
    paymentsProcessed: string;
    promoCode: string;
    promoType: string;
    promoValue: string;
    promoMinOrder: string;
    promoExpiresAt: string;
    promoActive: string;
    promoCreate: string;
    promoCreated: string;
    promoUpdated: string;
    promoDeleted: string;
    promoExists: string;
    noPromoCodes: string;
  };
  footer: {
    subscribe: string;
    enterEmail: string;
    subscribeBtnAria: string;
    subscribeSuccess: string;
    subscribeExists: string;
    subscribeInvalid: string;
    subscribeError: string;
    support: string;
    supportAddress: string;
    account: string;
    myAccount: string;
    loginRegister: string;
    cart: string;
    favorites: string;
    shop: string;
    quickLink: string;
    privacy: string;
    terms: string;
    faq: string;
    contact: string;
  };
  steps: {
    signIn: string;
    shipping: string;
    placeOrder: string;
  };
};

const en: Messages = {
  header: {
    home: "Home",
    products: "Products",
    favorites: "Favorites",
    contact: "Contact",
    searchPlaceholder: "What are you looking for?",
    toggleMenu: "Toggle menu",
  },
  auth: {
    login: "Login",
    register: "Register",
    welcomeBack: "Welcome Back",
    loginSubtitle: "Log in to your account to continue",
    createAccount: "Create Account",
    registerSubtitle: "Join us to start shopping",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    firstName: "First Name",
    lastName: "Last Name",
    signIn: "Sign In",
    createAccountBtn: "Create Account",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    registerHere: "Register here",
    logIn: "Log in",
    invalidCredentials: "Invalid email or password",
    unexpectedError: "An unexpected error occurred",
    passwordsMismatch: "Passwords do not match",
    registrationFailed: "Registration failed",
    emailInUse: "This email is already in use",
    showPassword: "Show password",
    hidePassword: "Hide password",
    showConfirmPassword: "Show confirm password",
    hideConfirmPassword: "Hide confirm password",
  },
  cart: {
    title: "Shopping Cart",
    empty: "Your cart is empty",
    emptySubtitle: "Looks like you haven't added anything yet.",
    startShopping: "Start Shopping",
    continueShopping: "Continue Shopping",
    clear: "Clear Cart",
    orderSummary: "Order Summary",
    shipping: "Shipping",
    shippingAtCheckout: "Calculated at checkout",
    total: "Total",
    proceed: "Proceed to Checkout",
    subtotal: "Subtotal",
    viewCart: "View Cart",
    items: "items",
  },
  home: {
    deals: "Today's Best Deals",
    heroTitleStart: "Shop the Latest",
    heroTitleAccent: "Products",
    heroSubtitle: "Discover thousands of products at unbeatable prices.",
    shopNow: "Shop Now",
    allProducts: "All Products",
    searchProducts: "Search products...",
    loadFail: "Failed to load products. Is the backend running?",
    tryAgain: "Try again",
    noProductsFound: "No products found",
    seeAll: "See All",
  },
  products: {
    filters: "Filters",
    allProducts: "All Products",
    searchTitle: "Search",
    loading: "Loading products...",
    loadFail: "Failed to load products",
    noProducts: "No products found.",
    categories: "Categories",
    allCategories: "All Categories",
    brands: "Brands",
    priceRange: "Price Range",
    clearFilters: "Clear Filters",
    sortBy: "Sort By",
    newest: "Newest",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
    rating_desc: "Top Rated",
    name_asc: "Name: A-Z",
  },
  product: {
    notFound: "Product Not Found",
    returnHome: "Return to Home",
    backToProducts: "Back to Products",
    similarTitle: "Similar Products",
    similarSubtitle: "You may also like these items from the same category or brand.",
    noSimilar: "No similar products found yet.",
    reviewsCount: "reviews",
    status: "Status",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    removedFromFavorites: "Removed from favorites",
    addedToFavorites: "Added to favorites",
    inFavorites: "In Favorites",
    addToFavorites: "Add to Favorites",
    addToCart: "Add to Cart",
    reviewsTitle: "Reviews",
    noReviews: "No reviews yet.",
    removing: "Removing...",
    delete: "Delete",
    writeReview: "Write a Review",
    please: "Please",
    toLeaveReview: "to leave a review.",
    signIn: "sign in",
    alreadyReviewed: "You have already submitted a review for this product.",
    rating: "Rating",
    comment: "Comment",
    ratingExcellent: "5 - Excellent",
    ratingGood: "4 - Good",
    ratingAverage: "3 - Average",
    ratingPoor: "2 - Poor",
    ratingBad: "1 - Bad",
    submitting: "Submitting...",
    submitReview: "Submit Review",
    submitSuccess: "Review submitted",
    submitFail: "Failed to submit review",
    removeSuccess: "Review removed",
    removeFail: "Failed to remove review",
    aboutProduct: "About Product",
    characteristicsLabel: "Characteristics",
    reviewsAndQuestions: "Reviews & Questions",
    buyTogether: "Buy Together",
    brief: "In Brief",
    brandLabel: "Brand",
    categoryLabel: "Category",
    priceLabel: "Price",
    availabilityLabel: "Availability",
  },
  favorites: {
    title: "Favorites",
    moveAllToCart: "Move all to cart",
    clearAll: "Clear all",
    guestHint: "You can use favorites as a guest.",
    signIn: "Sign in",
    syncHint: "to sync them to your account.",
    empty: "No favorites yet.",
    browseProducts: "Browse products",
    inStock: "In stock",
    outOfStock: "Out of stock",
    add: "Add",
    remove: "Remove",
    cleared: "Favorites cleared",
    movedToCart: "All favorites moved to cart",
    removed: "Removed from favorites",
    addAria: "Add favorite item to cart",
  },
  orders: {
    title: "My Orders",
    loading: "Loading orders...",
    loadFail: "Failed to load your orders",
    empty: "You have no orders yet.",
    order: "Order",
    dateUnavailable: "Date unavailable",
    paid: "Paid",
    pending: "Pending",
    status: "Status",
    statusPending: "Pending",
    statusProcessing: "Processing",
    statusShipped: "Shipped",
    statusDelivered: "Delivered",
    statusCancelled: "Cancelled",
    paymentStatus: "Payment",
    deliveryStatus: "Delivery",
    unpaid: "Unpaid",
    customer: "Customer",
    customerName: "Name",
    customerEmail: "Email",
    customerId: "User ID",
    payWithLiqPay: "Pay with LiqPay",
    paying: "Redirecting to LiqPay...",
    paymentInitFail: "Failed to initialize payment. Please try again.",
  },
  account: {
    title: "My Account",
    name: "Name",
    email: "Email",
    role: "Role",
    admin: "Admin",
    customer: "Customer",
    myOrders: "My Orders",
    adminDashboard: "Admin Dashboard",
    myAccount: "My Account",
  },
  checkout: {
    account: "Account",
    myAccount: "My Account",
    product: "Product",
    viewCart: "View Cart",
    checkout: "Checkout",
    billingDetails: "Billing Details",
    streetAddress: "Street Address",
    apartment: "Apartment, floor, etc. (optional)",
    townCity: "Town/City",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    postalCode: "Postal Code",
    country: "Country",
    saveInfo: "Save this information for faster check-out next time",
    shipping: "Shipping",
    free: "Free",
    subtotal: "Subtotal",
    total: "Total",
    paymentMethod: "Payment method",
    bank: "Bank",
    cod: "Cash on delivery",
    couponCode: "Coupon Code",
    applyCoupon: "Apply Coupon",
    couponApplied: "Promo code applied",
    couponRemoved: "Promo code removed",
    couponInvalid: "Failed to apply promo code",
    couponNotFound: "Promo code not found",
    couponInactive: "Promo code is inactive",
    couponExpired: "Promo code has expired",
    couponMinOrder: "Order amount is too low for this promo code",
    discount: "Discount",
    placeOrder: "Place Order",
    placing: "Placing...",
    terms:
      "By placing order you agree to our terms. This checkout is fully connected to your backend order API.",
    needEdit: "Need to edit cart?",
    goBackToCart: "Go back to cart",
    couponEnter: "Enter coupon code first.",
    couponNext: "Coming soon...",
    orderFail: "Failed to place order. Please check fields and try again.",
    streetAddressPlaceholder: "15 Soniachna St",
    apartmentPlaceholder: "Apt. 24",
    townCityPlaceholder: "Kyiv",
    countryPlaceholder: "Ukraine",
  },
  admin: {
    title: "Admin Dashboard",
    products: "Products",
    orders: "Orders",
    promos: "Promos",
    loadFail: "Failed to load admin data",
    loading: "Loading...",
    editProduct: "Edit Product",
    createProduct: "Create Product",
    productName: "Product Name",
    brand: "Brand",
    category: "Category",
    imageUrl: "Image URL",
    images: "Images",
    uploadImageFile: "Upload Image File",
    uploading: "Uploading...",
    uploadHint: "PNG, JPG, JPEG, WEBP up to 5MB",
    priceUah: "Price (UAH)",
    countInStock: "Count In Stock",
    description: "Description",
    descriptionUk: "Description (UA)",
    descriptionEn: "Description (EN)",
    saveFail: "Failed to save product",
    uploadFail: "Failed to upload image",
    deleteProductFail: "Failed to delete product",
    deliverFail: "Failed to mark order as delivered",
    deleteOrderFail: "Failed to delete order",
    shortDescription: "Short product description",
    saving: "Saving...",
    add: "Add",
    update: "Update",
    create: "Create",
    cancel: "Cancel",
    name: "Name",
    price: "Price",
    stock: "Stock",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    restock: "Restock 1-100",
    restocking: "Restock...",
    order: "Order",
    user: "User",
    total: "Total",
    paid: "Paid",
    paymentTx: "Payment TX",
    delivered: "Delivered",
    yes: "Yes",
    no: "No",
    deliver: "Deliver",
    confirmAction: "Confirm",
    actionFailed: "Action failed. Please try again.",
    confirmDeleteProductTitle: "Delete product",
    confirmDeleteProductMessage:
      'Delete "{name}"? This action cannot be undone.',
    confirmDeleteOrderTitle: "Delete order",
    confirmDeleteOrderMessage:
      "Delete this order? This action cannot be undone.",
    confirmDeliverTitle: "Mark as delivered",
    confirmDeliverMessage: "Mark this order as delivered now?",
    confirmStatusTitle: "Change status",
    confirmStatusMessage: 'Update order status to "{status}"?',
    confirmRestockTitle: "Random restock",
    confirmRestockMessage: "Restock all products with random stock (1-100)?",
    productUpdated: "Product updated",
    productCreated: "Product created",
    imageUploaded: "Image uploaded",
    productDeleted: "Product deleted",
    orderDelivered: "Order marked as delivered",
    orderDeleted: "Order deleted",
    orderStatusUpdated: "Order status updated",
    productsRestocked: "Products restocked",
    view: "View",
    paymentsTab: "Payments",
    statsTotalOrders: "Total orders",
    statsPaidOrders: "Paid orders",
    statsPendingOrders: "Pending orders",
    statsDeliveredOrders: "Delivered orders",
    statsTotalRevenue: "Total revenue",
    statsPaidRevenue: "Paid revenue",
    statsUnpaidOrders: "Unpaid orders",
    statsAvgOrderValue: "Avg order value",
    paymentsStatus: "Status",
    paymentsDateFrom: "Date from",
    paymentsDateTo: "Date to",
    paymentsAll: "All",
    paymentsProcessed: "Processed",
    promoCode: "Promo Code",
    promoType: "Type",
    promoValue: "Value",
    promoMinOrder: "Min Order",
    promoExpiresAt: "Expires At",
    promoActive: "Active",
    promoCreate: "Create Promo Code",
    promoCreated: "Promo code created",
    promoUpdated: "Promo code updated",
    promoDeleted: "Promo code deleted",
    promoExists: "Promo code already exists",
    noPromoCodes: "No promo codes yet.",
  },
  footer: {
    subscribe: "Subscribe to get updates on promotions and coupons.",
    enterEmail: "Enter your email",
    subscribeBtnAria: "Subscribe",
    subscribeSuccess: "Thanks! You are subscribed.",
    subscribeExists: "This email is already subscribed.",
    subscribeInvalid: "Please enter a valid email address.",
    subscribeError: "Subscription failed. Please try again.",
    support: "Support",
    supportAddress: "15 Soniachna St, Apt. 24, Kyiv, 03150, Ukraine",
    account: "Account",
    myAccount: "My Account",
    loginRegister: "Login / Register",
    cart: "Cart",
    favorites: "Favorites",
    shop: "Shop",
    quickLink: "Quick Link",
    privacy: "Privacy Policy",
    terms: "Terms Of Use",
    faq: "FAQ",
    contact: "Contact",
  },
  steps: {
    signIn: "Sign In",
    shipping: "Shipping",
    placeOrder: "Place Order",
  },
};

const uk: Messages = {
  ...en,
  header: {
    home: "Головна",
    products: "Товари",
    favorites: "Обране",
    contact: "Контакти",
    searchPlaceholder: "Що ви шукаєте?",
    toggleMenu: "Перемкнути меню",
  },
  auth: {
    ...en.auth,
    login: "Вхід",
    register: "Реєстрація",
    welcomeBack: "З поверненням",
    loginSubtitle: "Увійдіть у свій акаунт, щоб продовжити",
    createAccount: "Створити акаунт",
    registerSubtitle: "Приєднуйтесь, щоб почати покупки",
    email: "Email адреса",
    password: "Пароль",
    confirmPassword: "Підтвердіть пароль",
    firstName: "Ім'я",
    lastName: "Прізвище",
    signIn: "Увійти",
    createAccountBtn: "Створити акаунт",
    noAccount: "Ще не маєте акаунта?",
    hasAccount: "Вже маєте акаунт?",
    registerHere: "Зареєструватися",
    logIn: "Увійти",
    invalidCredentials: "Невірний email або пароль",
    unexpectedError: "Сталася неочікувана помилка",
    passwordsMismatch: "Паролі не співпадають",
    registrationFailed: "Помилка реєстрації",
    emailInUse: "Ця пошта вже використовується",
    showPassword: "Показати пароль",
    hidePassword: "Сховати пароль",
    showConfirmPassword: "Показати підтвердження пароля",
    hideConfirmPassword: "Сховати підтвердження пароля",
  },
  cart: {
    ...en.cart,
    title: "Кошик",
    empty: "Ваш кошик порожній",
    emptySubtitle: "Схоже, ви ще нічого не додали.",
    startShopping: "Почати покупки",
    continueShopping: "Продовжити покупки",
    clear: "Очистити кошик",
    orderSummary: "Підсумок замовлення",
    shipping: "Доставка",
    shippingAtCheckout: "Буде розраховано на оформленні",
    total: "Разом",
    proceed: "Оформити замовлення",
    subtotal: "Проміжна сума",
    viewCart: "Кошик",
    items: "тов.",
  },
  home: {
    ...en.home,
    deals: "Найкращі пропозиції дня",
    heroTitleStart: "Купуйте нові",
    heroTitleAccent: "товари",
    heroSubtitle: "Тисячі товарів за вигідними цінами.",
    shopNow: "Купити зараз",
    allProducts: "Усі товари",
    searchProducts: "Пошук товарів...",
    loadFail: "Не вдалося завантажити товари. Перевір, чи запущений бекенд.",
    tryAgain: "Спробувати ще раз",
    noProductsFound: "Товари не знайдено",
    seeAll: "Переглянути всі",
  },
  products: {
    ...en.products,
    filters: "Фільтри",
    allProducts: "Усі товари",
    searchTitle: "Пошук",
    loading: "Завантаження товарів...",
    loadFail: "Не вдалося завантажити товари",
    noProducts: "Товари не знайдено.",
    categories: "Категорії",
    allCategories: "Всі категорії",
    brands: "Бренди",
    priceRange: "Ціновий діапазон",
    clearFilters: "Очистити фільтри",
    sortBy: "Сортувати за",
    newest: "Новітні",
    price_asc: "Ціна: від низької до високої",
    price_desc: "Ціна: від високої до низької",
    rating_desc: "Найкращі за рейтингом",
    name_asc: "Назва: від А до Я",
  },
  product: {
    ...en.product,
    similarTitle: "Схожі товари",
    similarSubtitle:
      "Можливо, вам сподобаються ці товари з тієї ж категорії або бренду.",
    noSimilar: "Схожих товарів поки не знайдено.",
    notFound: "Товар не знайдено",
    returnHome: "Повернутись на головну",
    backToProducts: "Назад до товарів",
    reviewsCount: "відгуків",
    status: "Статус",
    inStock: "В наявності",
    outOfStock: "Немає в наявності",
    removedFromFavorites: "Видалено з обраного",
    addedToFavorites: "Додано в обране",
    inFavorites: "В обраному",
    addToFavorites: "Додати в обране",
    addToCart: "Додати в кошик",
    reviewsTitle: "Відгуки",
    noReviews: "Поки немає відгуків.",
    removing: "Видалення...",
    delete: "Видалити",
    writeReview: "Залишити відгук",
    please: "Будь ласка",
    toLeaveReview: "щоб залишити відгук.",
    signIn: "увійдіть",
    alreadyReviewed: "Ви вже залишили відгук для цього товару.",
    rating: "Оцінка",
    comment: "Коментар",
    ratingExcellent: "5 - Відмінно",
    ratingGood: "4 - Добре",
    ratingAverage: "3 - Нормально",
    ratingPoor: "2 - Погано",
    ratingBad: "1 - Дуже погано",
    submitting: "Надсилання...",
    submitReview: "Надіслати відгук",
    submitSuccess: "Відгук надіслано",
    submitFail: "Не вдалося надіслати відгук",
    removeSuccess: "Відгук видалено",
    removeFail: "Не вдалося видалити відгук",
    aboutProduct: "Про товар",
    characteristicsLabel: "Характеристики",
    reviewsAndQuestions: "Відгуки та питання",
    buyTogether: "Купують разом",
    brief: "Коротко",
    brandLabel: "Бренд",
    categoryLabel: "Категорія",
    priceLabel: "Ціна",
    availabilityLabel: "Наявність",
  },
  favorites: {
    ...en.favorites,
    title: "Обране",
    moveAllToCart: "Додати все в кошик",
    clearAll: "Очистити все",
    guestHint: "Можна користуватись обраним як гість.",
    signIn: "Увійти",
    syncHint: "щоб синхронізувати з акаунтом.",
    empty: "Поки немає обраних товарів.",
    browseProducts: "Переглянути товари",
    inStock: "В наявності",
    outOfStock: "Немає в наявності",
    add: "Додати",
    remove: "Видалити",
    cleared: "Обране очищено",
    movedToCart: "Усі товари з обраного додано в кошик",
    removed: "Видалено з обраного",
    addAria: "Додати товар з обраного в кошик",
  },
  orders: {
    ...en.orders,
    title: "Мої замовлення",
    loading: "Завантаження замовлень...",
    loadFail: "Не вдалося завантажити замовлення",
    empty: "У вас поки немає замовлень.",
    order: "Замовлення",
    dateUnavailable: "Дата недоступна",
    paid: "Оплачено",
    pending: "В очікуванні",
    status: "Статус",
    statusPending: "В очікуванні",
    statusProcessing: "В обробці",
    statusShipped: "Відправлено",
    statusDelivered: "Доставлено",
    statusCancelled: "Скасовано",
    paymentStatus: "Статус оплати",
    deliveryStatus: "Статус доставки",
    unpaid: "Не оплачено",
    customer: "Клієнт",
    customerName: "Ім'я",
    customerEmail: "Email",
    customerId: "ID користувача",
    payWithLiqPay:
      "Оплатити через LiqPay",
    paying:
      "Перенаправлення на LiqPay...",
    paymentInitFail:
      "Не вдалося ініціалізувати оплату. Спробуйте ще раз.",
  },
  account: {
    ...en.account,
    title: "Мій кабінет",
    name: "Ім'я",
    role: "Роль",
    admin: "Адмін",
    customer: "Клієнт",
    myOrders: "Мої замовлення",
    adminDashboard: "Адмін панель",
    myAccount: "Мій кабінет",
  },
  checkout: {
    ...en.checkout,
    couponApplied: "Промокод застосовано",
    couponRemoved: "Промокод видалено",
    couponInvalid: "Не вдалося застосувати промокод",
    couponNotFound: "Промокод не знайдено",
    couponInactive: "Цей промокод неактивний",
    couponExpired: "Термін дії промокоду завершився",
    couponMinOrder: "Сума замовлення замала для цього промокоду",
    discount: "Знижка",
    account: "Акаунт",
    myAccount: "Мій кабінет",
    product: "Товар",
    viewCart: "Кошик",
    checkout: "Оформлення",
    billingDetails: "Дані для оплати",
    streetAddress: "Адреса",
    apartment: "Квартира, поверх, тощо (необов'язково)",
    townCity: "Місто",
    phoneNumber: "Телефон",
    emailAddress: "Email адреса",
    postalCode: "Поштовий індекс",
    country: "Країна",
    saveInfo: "Зберегти ці дані для швидшого оформлення надалі",
    shipping: "Доставка",
    free: "Безкоштовно",
    subtotal: "Проміжна сума",
    total: "Разом",
    paymentMethod:
      "Спосіб оплати",
    bank: "Банк",
    cod: "Післяплата",
    couponCode: "Код купона",
    applyCoupon: "Застосувати купон",
    placeOrder: "Оформити замовлення",
    placing: "Оформлення...",
    terms:
      "Оформлюючи замовлення, ви погоджуєтеся з нашими умовами. Це оформлення повністю підключене до вашого backend API замовлень.",
    needEdit:
      "Потрібно змінити кошик?",
    goBackToCart: "Повернутись у кошик",
    couponEnter: "Спочатку введіть код купона.",
    couponNext: "В розробці...",
    orderFail:
      "Не вдалося оформити замовлення. Перевірте поля та спробуйте ще раз.",
    streetAddressPlaceholder: "вул. Сонячна, 15",
    apartmentPlaceholder: "Кв. 24",
    townCityPlaceholder: "Київ",
    countryPlaceholder: "Україна",
  },
  admin: {
    ...en.admin,
    promos: "Промокоди",
    promoCode: "Промокод",
    promoType: "Тип",
    promoValue: "Значення",
    promoMinOrder: "Мін. сума",
    promoExpiresAt: "Діє до",
    promoActive: "Активний",
    promoCreate: "Створити промокод",
    promoCreated: "Промокод створено",
    promoUpdated: "Промокод оновлено",
    promoDeleted: "Промокод видалено",
    promoExists: "Такий промокод вже існує",
    noPromoCodes: "Поки немає промокодів.",
    title: "Адмін панель",
    products: "Товари",
    orders: "Замовлення",
    loadFail: "Не вдалося завантажити дані адмінки",
    loading: "Завантаження...",
    editProduct: "Редагувати товар",
    createProduct: "Створити товар",
    productName: "Назва товару",
    brand: "Бренд",
    category: "Категорія",
    imageUrl: "URL зображення",
    images: "Зображення",
    uploadImageFile: "Завантажити файл зображення",
    uploading: "Завантаження...",
    uploadHint: "PNG, JPG, JPEG, WEBP до 5MB",
    priceUah: "Ціна (₴)",
    countInStock: "Кількість в наявності",
    description: "Опис",
    descriptionUk: "Опис (UA)",
    saveFail: "Не вдалося зберегти товар",
    uploadFail: "Не вдалося завантажити зображення",
    deleteProductFail: "Не вдалося видалити товар",
    deliverFail: "Не вдалося позначити замовлення як доставлене",
    deleteOrderFail: "Не вдалося видалити замовлення",
    shortDescription: "Короткий опис товару",
    add: "Додати",
    saving: "Збереження...",
    update: "Оновити",
    create: "Створити",
    cancel: "Скасувати",
    name: "Назва",
    price: "Ціна",
    stock: "Склад",
    actions: "Дії",
    edit: "Редагувати",
    delete: "Видалити",
    order: "Замовлення",
    user: "Користувач",
    total: "Сума",
    paid: "Оплачено",
    paymentTx: "Платіж TX",
    delivered: "Доставлено",
    yes: "Так",
    no: "Ні",
    deliver: "Доставити",
    restock: "Ресток 1-100",
    restocking: "Ресток...",
    confirmAction:
      "Підтвердити",
    actionFailed:
      "Дію не вдалося виконати. Спробуйте ще раз.",
    confirmDeleteProductTitle:
      "Видалення товару",
    confirmDeleteProductMessage:
      'Видалити "{name}"? Цю дію неможливо скасувати.',
    confirmDeleteOrderTitle:
      "Видалення замовлення",
    confirmDeleteOrderMessage:
      "Видалити це замовлення? Цю дію неможливо скасувати.",
    confirmDeliverTitle:
      "Позначити як доставлене",
    confirmDeliverMessage:
      "Позначити це замовлення як доставлене?",
    confirmStatusTitle:
      "Зміна статусу",
    confirmStatusMessage:
      'Оновити статус замовлення на "{status}"?',
    confirmRestockTitle:
      "Випадковий ресток",
    confirmRestockMessage:
      "Виставити всім товарам випадкову кількість (1-100)?",
    productUpdated:
      "Товар оновлено",
    productCreated:
      "Товар створено",
    imageUploaded:
      "Зображення завантажено",
    productDeleted:
      "Товар видалено",
    orderDelivered:
      "Замовлення позначено як доставлене",
    orderDeleted:
      "Замовлення видалено",
    orderStatusUpdated:
      "Статус замовлення оновлено",
    productsRestocked:
      "Товари рестокнуто",
    view: "Перегляд",
    paymentsTab: "Платежі",
    statsTotalOrders:
      "Всього замовлень",
    statsPaidOrders:
      "Оплачені замовлення",
    statsPendingOrders:
      "Замовлення в очікуванні",
    statsDeliveredOrders:
      "Доставлені замовлення",
    statsTotalRevenue:
      "Загальна виручка",
    statsPaidRevenue:
      "Оплачена виручка",
    statsUnpaidOrders:
      "Неоплачені замовлення",
    statsAvgOrderValue:
      "Середній чек",
    paymentsStatus: "Статус",
    paymentsDateFrom: "Дата від",
    paymentsDateTo: "Дата до",
    paymentsAll: "Всі",
    paymentsProcessed: "Оброблено",
  },
  footer: {
    ...en.footer,
    subscribe:
      "Підпишіться, щоб отримувати акції та купони.",
    enterEmail: "Введіть email",
    subscribeBtnAria:
      "Підписатися",
    subscribeSuccess:
      "Дякуємо! Ви підписані.",
    subscribeExists:
      "Ця пошта вже підписана.",
    subscribeInvalid:
      "Введіть коректну email-адресу.",
    subscribeError:
      "Не вдалося оформити підписку. Спробуйте ще раз.",
    support: "Підтримка",
    supportAddress:
      "вул. Сонячна, 15, кв. 24, Київ, 03150, Україна",
    account: "Акаунт",
    myAccount: "Мій кабінет",
    loginRegister:
      "Вхід / Реєстрація",
    cart: "Кошик",
    favorites: "Обране",
    shop: "Магазин",
    quickLink:
      "Швидкі посилання",
    privacy:
      "Політика конфіденційності",
    terms:
      "Умови користування",
    faq: "Питання та відповіді",
    contact: "Контакти",
  },
  steps: {
    signIn: "Вхід",
    shipping: "Доставка",
    placeOrder: "Оформлення",
  },
};

export const messages: Record<Lang, Messages> = { en, uk };
