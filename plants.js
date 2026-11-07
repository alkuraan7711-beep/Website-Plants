// plants.js
// بيظهّر الكروت والمنتجات بأنيميشن لما توصلها بالسكرول (IntersectionObserver)

(() => {
    // كل العناصر اللي عليها كلاس reveal في الـ HTML
    const items = document.querySelectorAll('.reveal');

    // لو المتصفح قديم ومفيهوش IntersectionObserver نظهّر كل حاجة على طول
    if (!('IntersectionObserver' in window)) {
        items.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible'); // CSS هو اللي بيعمل الحركة
                    obs.unobserve(entry.target);              // مرة واحدة بس، مش كل ما نعدّي عليه
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((el) => observer.observe(el));
})();

// ==========================================================================
// السلة: بتتحفظ في localStorage، وبتفتح في <dialog> (الكيبورد والـ Esc شغالين تلقائي)
// ==========================================================================
(() => {
    const STORAGE_KEY = 'verdant:cart';

    // رقم الواتساب لاستقبال الطلبات: كود الدولة + الرقم، أرقام بس (مثال: '201001234567').
    // لو فاضي، زرار "Order on WhatsApp" مش بيظهر.
    const WHATSAPP_NUMBER = '';

    const dialog = document.getElementById('cart-dialog');
    if (!dialog) return;

    const openButton = document.getElementById('cart-open');
    const countEl = document.getElementById('cart-count');
    const listEl = document.getElementById('cart-list');
    const emptyEl = document.getElementById('cart-empty');
    const footerEl = document.getElementById('cart-footer');
    const totalEl = document.getElementById('cart-total');
    const orderLink = document.getElementById('cart-order');
    const clearButton = document.getElementById('cart-clear');
    const statusEl = document.getElementById('cart-status');

    // ---------- التخزين ----------
    // الداتا من localStorage ممكن تتبوظ، فبنتأكد من شكل كل عنصر قبل ما نستخدمه
    function isValidItem(item) {
        return (
            item !== null &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            Number.isFinite(item.price) &&
            Number.isInteger(item.qty) &&
            item.qty >= 1
        );
    }

    function loadCart() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(saved) ? saved.filter(isValidItem) : [];
        } catch {
            return [];
        }
    }

    function saveCart() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch {
            /* التخزين ممكن يكون ممنوع (private mode): السلة هتشتغل بس مش هتتحفظ */
        }
    }

    let cart = loadCart();

    // ---------- أدوات صغيرة ----------
    const money = (value) => `$${value}`;
    const countItems = () => cart.reduce((sum, item) => sum + item.qty, 0);
    const cartTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const announce = (message) => { statusEl.textContent = message; };

    // ---------- عمليات السلة ----------
    function addItem(product) {
        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        update();
        announce(`${product.name} added to cart. ${countItems()} items in cart.`);
    }

    function changeQty(id, delta) {
        const item = cart.find((entry) => entry.id === id);
        if (!item) return;
        item.qty = Math.max(1, item.qty + delta);
        update();
    }

    function removeItem(id) {
        cart = cart.filter((item) => item.id !== id);
        update();
    }

    // ---------- العرض (textContent بدل innerHTML عشان نتجنب حقن HTML) ----------
    function createButton(label, text, onClick, className) {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', label);
        button.textContent = text;
        if (className) button.className = className;
        button.addEventListener('click', onClick);
        return button;
    }

    function renderItem(item) {
        const li = document.createElement('li');
        li.className = 'cart-item';

        const name = document.createElement('span');
        name.className = 'cart-item__name';
        name.textContent = item.name;

        const linePrice = document.createElement('span');
        linePrice.className = 'cart-item__price';
        linePrice.textContent = `${money(item.price * item.qty)} (${money(item.price)} each)`;

        const qty = document.createElement('div');
        qty.className = 'cart-qty';
        const minus = createButton(`Decrease quantity of ${item.name}`, '−', () => changeQty(item.id, -1));
        minus.disabled = item.qty === 1;
        const number = document.createElement('span');
        number.textContent = item.qty;
        const plus = createButton(`Increase quantity of ${item.name}`, '+', () => changeQty(item.id, 1));
        qty.append(minus, number, plus);

        const remove = createButton(`Remove ${item.name} from cart`, 'Remove', () => removeItem(item.id), 'cart-remove');

        li.append(name, linePrice, qty, remove);
        return li;
    }

    function buildOrderMessage() {
        const lines = cart.map((item) => `- ${item.qty} x ${item.name} (${money(item.price * item.qty)})`);
        return `Hello Verdant, I'd like to order:\n${lines.join('\n')}\nTotal: ${money(cartTotal())}`;
    }

    function render() {
        const count = countItems();
        const isEmpty = cart.length === 0;

        countEl.textContent = count;
        openButton.setAttribute('aria-label', `Open cart, ${count} ${count === 1 ? 'item' : 'items'}`);

        emptyEl.hidden = !isEmpty;
        footerEl.hidden = isEmpty;
        listEl.replaceChildren(...cart.map(renderItem));
        totalEl.textContent = money(cartTotal());

        const hasWhatsApp = /^\d{8,15}$/.test(WHATSAPP_NUMBER);
        orderLink.hidden = !hasWhatsApp;
        if (hasWhatsApp && !isEmpty) {
            orderLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderMessage())}`;
        }
    }

    function update() {
        saveCart();
        render();
    }

    // ---------- الأحداث ----------
    // event delegation: مستمع واحد لكل أزرار "Add To Cart"
    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-add-to-cart]');
        if (!button) return;

        const card = button.closest('.product');
        addItem({
            id: card.dataset.id,
            name: card.dataset.name,
            price: Number(card.dataset.price)
        });

        // تأكيد بصري سريع على الزرار نفسه
        if (!button.dataset.label) button.dataset.label = button.textContent;
        button.textContent = 'Added ✓';
        clearTimeout(button.feedbackTimer);
        button.feedbackTimer = setTimeout(() => {
            button.textContent = button.dataset.label;
        }, 1200);
    });

    openButton.addEventListener('click', () => dialog.showModal());
    dialog.querySelector('[data-cart-close]').addEventListener('click', () => dialog.close());
    // الضغط على الخلفية (برا الصندوق) بيقفل السلة
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
    });
    clearButton.addEventListener('click', () => {
        cart = [];
        update();
        announce('Cart cleared.');
    });

    render();
})();
