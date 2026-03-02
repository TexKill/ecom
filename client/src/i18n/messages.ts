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
  };
  products: {
    allProducts: string;
    searchTitle: string;
    loading: string;
    loadFail: string;
    noProducts: string;
  };
  product: {
    notFound: string;
    returnHome: string;
    backToProducts: string;
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
    bank: string;
    cod: string;
    couponCode: string;
    applyCoupon: string;
    placeOrder: string;
    placing: string;
    terms: string;
    needEdit: string;
    goBackToCart: string;
    couponEnter: string;
    couponNext: string;
    orderFail: string;
  };
  admin: {
    title: string;
    products: string;
    orders: string;
    loadFail: string;
    loading: string;
    editProduct: string;
    createProduct: string;
    productName: string;
    brand: string;
    category: string;
    imageUrl: string;
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
    update: string;
    create: string;
    cancel: string;
    name: string;
    price: string;
    stock: string;
    actions: string;
    edit: string;
    delete: string;
    order: string;
    user: string;
    total: string;
    paid: string;
    delivered: string;
    yes: string;
    no: string;
    deliver: string;
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
  },
  products: {
    allProducts: "All Products",
    searchTitle: "Search",
    loading: "Loading products...",
    loadFail: "Failed to load products",
    noProducts: "No products found.",
  },
  product: {
    notFound: "Product Not Found",
    returnHome: "Return to Home",
    backToProducts: "Back to Products",
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
    bank: "Bank",
    cod: "Cash on delivery",
    couponCode: "Coupon Code",
    applyCoupon: "Apply Coupon",
    placeOrder: "Place Order",
    placing: "Placing...",
    terms:
      "By placing order you agree to our terms. This checkout is fully connected to your backend order API.",
    needEdit: "Need to edit cart?",
    goBackToCart: "Go back to cart",
    couponEnter: "Enter coupon code first.",
    couponNext: "Coupon feature will be enabled in next iteration.",
    orderFail: "Failed to place order. Please check fields and try again.",
  },
  admin: {
    title: "Admin Dashboard",
    products: "Products",
    orders: "Orders",
    loadFail: "Failed to load admin data",
    loading: "Loading...",
    editProduct: "Edit Product",
    createProduct: "Create Product",
    productName: "Product Name",
    brand: "Brand",
    category: "Category",
    imageUrl: "Image URL",
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
    update: "Update",
    create: "Create",
    cancel: "Cancel",
    name: "Name",
    price: "Price",
    stock: "Stock",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    order: "Order",
    user: "User",
    total: "Total",
    paid: "Paid",
    delivered: "Delivered",
    yes: "Yes",
    no: "No",
    deliver: "Deliver",
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
  },
  products: {
    ...en.products,
    allProducts: "Усі товари",
    searchTitle: "Пошук",
    loading: "Завантаження товарів...",
    loadFail: "Не вдалося завантажити товари",
    noProducts: "Товари не знайдено.",
  },
  product: {
    ...en.product,
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
    bank: "Банк",
    cod: "Післяплата",
    couponCode: "Код купона",
    applyCoupon: "Застосувати купон",
    placeOrder: "Оформити замовлення",
    placing: "Оформлення...",
    terms:
      "Оформлюючи замовлення, ви погоджуєтеся з нашими умовами. Це оформлення повністю підключене до вашого backend API замовлень.",
    needEdit:
      "\u041f\u043e\u0442\u0440\u0456\u0431\u043d\u043e \u0437\u043c\u0456\u043d\u0438\u0442\u0438 \u043a\u043e\u0448\u0438\u043a?",
    goBackToCart: "Повернутись у кошик",
    couponEnter: "Спочатку введіть код купона.",
    couponNext: "Функцію купонів буде додано в наступній ітерації.",
    orderFail:
      "Не вдалося оформити замовлення. Перевірте поля та спробуйте ще раз.",
  },
  admin: {
    ...en.admin,
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
    delivered: "Доставлено",
    yes: "Так",
    no: "Ні",
    deliver: "Доставити",
  },
  footer: {
    ...en.footer,
    subscribe:
      "\u041f\u0456\u0434\u043f\u0438\u0448\u0456\u0442\u044c\u0441\u044f, \u0449\u043e\u0431 \u043e\u0442\u0440\u0438\u043c\u0443\u0432\u0430\u0442\u0438 \u0430\u043a\u0446\u0456\u0457 \u0442\u0430 \u043a\u0443\u043f\u043e\u043d\u0438.",
    enterEmail: "\u0412\u0432\u0435\u0434\u0456\u0442\u044c email",
    subscribeBtnAria:
      "\u041f\u0456\u0434\u043f\u0438\u0441\u0430\u0442\u0438\u0441\u044f",
    subscribeSuccess:
      "\u0414\u044f\u043a\u0443\u0454\u043c\u043e! \u0412\u0438 \u043f\u0456\u0434\u043f\u0438\u0441\u0430\u043d\u0456.",
    subscribeExists:
      "\u0426\u044f \u043f\u043e\u0448\u0442\u0430 \u0432\u0436\u0435 \u043f\u0456\u0434\u043f\u0438\u0441\u0430\u043d\u0430.",
    subscribeInvalid:
      "\u0412\u0432\u0435\u0434\u0456\u0442\u044c \u043a\u043e\u0440\u0435\u043a\u0442\u043d\u0443 email-\u0430\u0434\u0440\u0435\u0441\u0443.",
    subscribeError:
      "\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u043e\u0444\u043e\u0440\u043c\u0438\u0442\u0438 \u043f\u0456\u0434\u043f\u0438\u0441\u043a\u0443. \u0421\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0449\u0435 \u0440\u0430\u0437.",
    support: "\u041f\u0456\u0434\u0442\u0440\u0438\u043c\u043a\u0430",
    supportAddress:
      "\u0432\u0443\u043b. \u0421\u043e\u043d\u044f\u0447\u043d\u0430, 15, \u043a\u0432. 24, \u041a\u0438\u0457\u0432, 03150, \u0423\u043a\u0440\u0430\u0457\u043d\u0430",
    account: "\u0410\u043a\u0430\u0443\u043d\u0442",
    myAccount: "\u041c\u0456\u0439 \u043a\u0430\u0431\u0456\u043d\u0435\u0442",
    loginRegister:
      "\u0412\u0445\u0456\u0434 / \u0420\u0435\u0454\u0441\u0442\u0440\u0430\u0446\u0456\u044f",
    cart: "\u041a\u043e\u0448\u0438\u043a",
    favorites: "\u041e\u0431\u0440\u0430\u043d\u0435",
    shop: "\u041c\u0430\u0433\u0430\u0437\u0438\u043d",
    quickLink:
      "\u0428\u0432\u0438\u0434\u043a\u0456 \u043f\u043e\u0441\u0438\u043b\u0430\u043d\u043d\u044f",
    privacy:
      "\u041f\u043e\u043b\u0456\u0442\u0438\u043a\u0430 \u043a\u043e\u043d\u0444\u0456\u0434\u0435\u043d\u0446\u0456\u0439\u043d\u043e\u0441\u0442\u0456",
    terms:
      "\u0423\u043c\u043e\u0432\u0438 \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u043d\u043d\u044f",
    faq: "\u041f\u0438\u0442\u0430\u043d\u043d\u044f \u0442\u0430 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0456",
    contact: "\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u0438",
  },
  steps: {
    signIn: "Вхід",
    shipping: "Доставка",
    placeOrder: "Оформлення",
  },
};

export const messages: Record<Lang, Messages> = { en, uk };
