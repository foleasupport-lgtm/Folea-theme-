// Folea Shopify Theme 2.0 - Core Storefront & Cart Engine
// Full Shopify API Integration, Drawer Management & Dynamic Quantity Sync

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const menuBtn = document.getElementById('menuBtn');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  
  const cartBtn = document.getElementById('cartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartDrawerBackdrop = document.getElementById('cartDrawerBackdrop');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const drawerCartCount = document.getElementById('drawerCartCount');
  const drawerCartTotal = document.getElementById('drawerCartTotal');
  const cartDrawerBody = document.getElementById('cartDrawerBody');
  
  const bundleCards = document.querySelectorAll('.bundle-card');
  const qtyInput = document.getElementById('qtyInput');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const foleaRealQuantity = document.getElementById('foleaRealQuantity');
  const foleaVariantId = document.getElementById('foleaVariantId');
  
  const orderNowBtn = document.getElementById('orderNowBtn');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const stickyOrderBtn = document.getElementById('stickyOrderBtn');
  const cartSuccessToast = document.getElementById('cartSuccessToast');
  
  const thumbBtns = document.querySelectorAll('.thumb-btn');
  const mainProductImg = document.getElementById('mainProductImg');
  const faqItems = document.querySelectorAll('.faq-item');

  let currentQuantity = 1;

  // ----------------------------------------------------
  // 1. Mobile Navigation Drawer (2-Lines Menu)
  // ----------------------------------------------------
  function openMobileNav() {
    if (mobileNavDrawer) {
      mobileNavDrawer.classList.add('open');
      mobileNavDrawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileNav() {
    if (mobileNavDrawer) {
      mobileNavDrawer.classList.remove('open');
      mobileNavDrawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (menuBtn) menuBtn.addEventListener('click', openMobileNav);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileNav);
  if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', closeMobileNav);

  const drawerNavLinks = document.querySelectorAll('.drawer-nav a');
  drawerNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // ----------------------------------------------------
  // 2. Slide-Out Mini Cart Drawer
  // ----------------------------------------------------
  function openCartDrawer() {
    if (cartDrawer) {
      cartDrawer.classList.add('open');
      cartDrawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      fetchCartData();
    }
  }

  function closeCartDrawer() {
    if (cartDrawer) {
      cartDrawer.classList.remove('open');
      cartDrawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (cartDrawerBackdrop) cartDrawerBackdrop.addEventListener('click', closeCartDrawer);

  const shopNowCartBtn = document.getElementById('shopNowCartBtn');
  if (shopNowCartBtn) {
    shopNowCartBtn.addEventListener('click', closeCartDrawer);
  }

  // ----------------------------------------------------
  // Persistent Hybrid Cart Store (Shopify API + Local Client Resilience)
  // ----------------------------------------------------
  function getLocalCart() {
    try {
      const data = localStorage.getItem('folea_cart_storage');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return { items: [], item_count: 0, total_price: 0, currency: 'PKR' };
  }

  function saveLocalCart(cart) {
    try {
      localStorage.setItem('folea_cart_storage', JSON.stringify(cart));
    } catch (e) {}
  }

  function calculateCartTotals(cart) {
    let count = 0;
    let total = 0;
    if (Array.isArray(cart.items)) {
      cart.items.forEach(item => {
        const q = item.quantity || 1;
        count += q;
        total += (item.price || 295000) * q;
      });
    }
    cart.item_count = count;
    cart.total_price = total;
    return cart;
  }

  function fetchCartData() {
    fetch('/cart.js')
      .then(res => {
        if (!res.ok) throw new Error('Not Shopify runtime');
        return res.json();
      })
      .then(shopifyCart => {
        if (shopifyCart && shopifyCart.item_count > 0) {
          saveLocalCart(shopifyCart);
          updateCartUI(shopifyCart);
        } else {
          const localCart = getLocalCart();
          if (localCart.item_count > 0) {
            updateCartUI(localCart);
          } else {
            updateCartUI(shopifyCart);
          }
        }
      })
      .catch(() => {
        const localCart = getLocalCart();
        updateCartUI(localCart);
      });
  }

  function updateCartUI(cart) {
    if (!cart) cart = getLocalCart();
    calculateCartTotals(cart);

    if (cartCountBadge) cartCountBadge.textContent = cart.item_count;
    if (drawerCartCount) drawerCartCount.textContent = cart.item_count;

    const formattedTotal = 'Rs. ' + Math.round(cart.total_price / 100).toLocaleString('en-US');
    if (drawerCartTotal) drawerCartTotal.textContent = formattedTotal;

    if (!cartDrawerBody) return;

    if (cart.item_count === 0) {
      cartDrawerBody.innerHTML = `
        <div class="cart-empty-state">
          <p>Your bag is empty.</p>
          <a href="#productSection" class="btn-primary-small" onclick="document.getElementById('cartDrawer').classList.remove('open'); document.body.style.overflow='';">Order Folea Serum</a>
        </div>
      `;
    } else {
      let itemsHTML = '<div class="cart-items-list">';
      cart.items.forEach((item, index) => {
        const itemLinePrice = 'Rs. ' + Math.round(((item.price || 295000) * item.quantity) / 100).toLocaleString('en-US');
        const itemUnitPrice = 'Rs. ' + Math.round((item.price || 295000) / 100).toLocaleString('en-US');
        const imgSrc = (item.featured_image && item.featured_image.url) ? item.featured_image.url : (item.image || 'https://via.placeholder.com/100?text=Folea');

        itemsHTML += `
          <div class="drawer-cart-item" data-index="${index}">
            <img src="${imgSrc}" alt="${item.title || 'Folea Serum'}">
            <div class="item-details" style="flex:1;">
              <h4>${item.product_title || item.title || 'Folea Anti-Frizz Hair Serum'}</h4>
              <div class="item-price">${itemLinePrice} <span style="font-size:11px; font-weight:400; color:#888;">(${itemUnitPrice} each)</span></div>
              <div class="drawer-qty-control" style="display:inline-flex; align-items:center; gap:8px; margin-top:6px; background:#f4f0eb; padding:2px 8px; border-radius:14px;">
                <button type="button" class="cart-qty-btn cart-qty-minus" data-index="${index}" style="border:none; background:none; font-size:16px; font-weight:bold; cursor:pointer; line-height:1; padding:2px 4px;">−</button>
                <span class="cart-qty-val" style="font-size:13px; font-weight:700;">${item.quantity}</span>
                <button type="button" class="cart-qty-btn cart-qty-plus" data-index="${index}" style="border:none; background:none; font-size:16px; font-weight:bold; cursor:pointer; line-height:1; padding:2px 4px;">+</button>
              </div>
            </div>
            <button type="button" class="cart-remove-item" data-index="${index}" title="Remove item" style="border:none; background:none; color:#a19b94; font-size:20px; cursor:pointer; padding:4px;">&times;</button>
          </div>
        `;
      });
      itemsHTML += '</div>';
      cartDrawerBody.innerHTML = itemsHTML;

      // Drawer item quantity listeners
      cartDrawerBody.querySelectorAll('.cart-qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-index'), 10);
          adjustLocalCartQty(idx, -1);
        });
      });

      cartDrawerBody.querySelectorAll('.cart-qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-index'), 10);
          adjustLocalCartQty(idx, 1);
        });
      });

      cartDrawerBody.querySelectorAll('.cart-remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-index'), 10);
          removeLocalCartItem(idx);
        });
      });
    }
  }

  function adjustLocalCartQty(index, change) {
    const cart = getLocalCart();
    if (cart.items && cart.items[index]) {
      cart.items[index].quantity += change;
      if (cart.items[index].quantity <= 0) {
        cart.items.splice(index, 1);
      }
      calculateCartTotals(cart);
      saveLocalCart(cart);
      updateCartUI(cart);
    }
  }

  function removeLocalCartItem(index) {
    const cart = getLocalCart();
    if (cart.items && cart.items[index]) {
      cart.items.splice(index, 1);
      calculateCartTotals(cart);
      saveLocalCart(cart);
      updateCartUI(cart);
    }
  }

  // ----------------------------------------------------
  // 3. Dynamic Bundle Selection & Quantity Sync
  // ----------------------------------------------------
  bundleCards.forEach(card => {
    card.addEventListener('click', () => {
      bundleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const qty = parseInt(card.getAttribute('data-qty')) || 1;
      const price = card.getAttribute('data-price');
      const compare = card.getAttribute('data-compare');
      const savings = card.getAttribute('data-savings');

      currentQuantity = qty;
      syncQuantity(qty);

      const displayPrice = document.getElementById('displayPrice');
      const displayComparePrice = document.getElementById('displayComparePrice');
      const displayDiscount = document.getElementById('displayDiscount');
      const stickyPrice = document.getElementById('stickyPrice');

      if (displayPrice && price) displayPrice.textContent = price;
      if (displayComparePrice && compare) displayComparePrice.textContent = compare;
      if (displayDiscount && savings) displayDiscount.textContent = savings.toUpperCase();
      if (stickyPrice && price) stickyPrice.textContent = price;
    });
  });

  function syncQuantity(qty) {
    currentQuantity = Math.max(1, qty);
    if (qtyInput) qtyInput.value = currentQuantity;
    if (foleaRealQuantity) foleaRealQuantity.value = currentQuantity;
  }

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      if (currentQuantity > 1) {
        syncQuantity(currentQuantity - 1);
      }
    });

    qtyPlus.addEventListener('click', () => {
      syncQuantity(currentQuantity + 1);
    });

    qtyInput.addEventListener('change', () => {
      const val = parseInt(qtyInput.value) || 1;
      syncQuantity(val);
    });
  }

  // Helper: Auto-detect available product variant ID from Shopify catalog
  async function resolveVariantId() {
    let vid = foleaVariantId ? foleaVariantId.value : null;
    if (vid && vid.trim() !== '' && vid !== '1') return vid;
    try {
      const res = await fetch('/products.json?limit=5');
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        for (const p of data.products) {
          if (p.variants && p.variants.length > 0) {
            vid = p.variants[0].id;
            if (foleaVariantId) foleaVariantId.value = vid;
            return vid;
          }
        }
      }
    } catch (e) {
      console.warn('Could not auto-resolve variant ID:', e);
    }
    return vid;
  }

  // ----------------------------------------------------
  // 4. Enhanced "Add To Bag" Action (Shopify API + Persistent Local Fallback)
  // ----------------------------------------------------
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async () => {
      addToCartBtn.disabled = true;
      const originalText = addToCartBtn.innerHTML;
      addToCartBtn.innerHTML = `<span>ADDING...</span>`;

      const variantId = await resolveVariantId();
      const qty = currentQuantity || 1;

      // Parse unit price in cents
      let unitPriceInCents = 295000;
      const displayPriceEl = document.getElementById('displayPrice') || document.getElementById('stickyPrice');
      if (displayPriceEl) {
        const rawNum = parseInt(displayPriceEl.textContent.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(rawNum) && rawNum > 0) {
          unitPriceInCents = Math.round((rawNum / qty) * 100);
        }
      }

      // Add to persistent client cart
      const cart = getLocalCart();
      const existingItem = cart.items.find(i => i.id === (variantId || 'folea-serum'));
      const productImg = (mainProductImg && mainProductImg.src) ? mainProductImg.src : '';

      if (existingItem) {
        existingItem.quantity += qty;
        existingItem.price = unitPriceInCents;
      } else {
        cart.items.push({
          id: variantId || 'folea-serum',
          variant_id: variantId,
          title: 'Folea Anti-Frizz Hair Serum',
          product_title: 'Folea Anti-Frizz Hair Serum',
          price: unitPriceInCents,
          quantity: qty,
          featured_image: { url: productImg }
        });
      }

      calculateCartTotals(cart);
      saveLocalCart(cart);
      updateCartUI(cart);

      // Background Shopify Sync
      if (variantId) {
        try {
          await fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ items: [{ id: Number(variantId), quantity: Number(qty) }] })
          });
        } catch (e) {
          // Handled silently
        }
      }

      addToCartBtn.disabled = false;
      addToCartBtn.innerHTML = originalText;
      showToast("Added to Bag!", `${qty}x Folea Serum added.`);
      openCartDrawer();
    });
  }

  // ----------------------------------------------------
  // 5. Checkout & Order Handlers (COD & Sticky Bar Linking)
  // ----------------------------------------------------
  async function executeOrderViaCheckout() {
    if (orderNowBtn) {
      orderNowBtn.disabled = true;
      const label = document.getElementById('btnTextLabel');
      if (label) label.textContent = 'PROCEEDING TO CHECKOUT...';
    }

    if (stickyOrderBtn) {
      stickyOrderBtn.disabled = true;
      const stickySpan = stickyOrderBtn.querySelector('span');
      if (stickySpan) stickySpan.textContent = 'CHECKOUT...';
    }

    const variantId = await resolveVariantId();
    const qty = currentQuantity || 1;

    let unitPriceInCents = 295000;
    const displayPriceEl = document.getElementById('displayPrice') || document.getElementById('stickyPrice');
    if (displayPriceEl) {
      const rawNum = parseInt(displayPriceEl.textContent.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(rawNum) && rawNum > 0) {
        unitPriceInCents = Math.round((rawNum / qty) * 100);
      }
    }

    const cart = getLocalCart();
    const existing = cart.items.find(i => i.id === (variantId || 'folea-serum'));
    if (existing) {
      existing.quantity = Math.max(existing.quantity, qty);
    } else {
      cart.items.push({
        id: variantId || 'folea-serum',
        variant_id: variantId,
        title: 'Folea Anti-Frizz Hair Serum',
        product_title: 'Folea Anti-Frizz Hair Serum',
        price: unitPriceInCents,
        quantity: qty,
        featured_image: { url: (mainProductImg && mainProductImg.src) ? mainProductImg.src : '' }
      });
    }
    calculateCartTotals(cart);
    saveLocalCart(cart);
    updateCartUI(cart);

    if (variantId) {
      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          items: [{
            id: Number(variantId),
            quantity: Number(qty)
          }]
        })
      })
      .then(() => {
        window.location.href = '/checkout';
      })
      .catch(() => {
        window.location.href = `/cart/${variantId}:${qty}?checkout`;
      });
    } else {
      const form = document.getElementById('foleaProductForm');
      if (form) {
        form.action = '/cart/add';
        form.submit();
      } else {
        window.location.href = '/checkout';
      }
    }
  }

  if (orderNowBtn) orderNowBtn.addEventListener('click', executeOrderViaCheckout);

  if (stickyOrderBtn) {
    stickyOrderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      executeOrderViaCheckout();
    });
  }

  const stickyThumbInfo = document.querySelector('.sticky-thumb-info');
  if (stickyThumbInfo) {
    stickyThumbInfo.addEventListener('click', (e) => {
      e.stopPropagation();
      executeOrderViaCheckout();
    });
  }

  const stickyMobileBar = document.getElementById('stickyMobileBar');
  if (stickyMobileBar) {
    stickyMobileBar.addEventListener('click', () => {
      executeOrderViaCheckout();
    });
  }

  // Handle drawer checkout buttons
  const drawerCheckoutBtns = document.querySelectorAll('.btn-checkout');
  drawerCheckoutBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const variantId = await resolveVariantId();
      const localCart = getLocalCart();
      const totalQty = localCart.item_count || currentQuantity || 1;
      if (variantId) {
        e.preventDefault();
        try {
          await fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ items: [{ id: Number(variantId), quantity: Number(totalQty) }] })
          });
          window.location.href = '/checkout';
        } catch (err) {
          window.location.href = `/cart/${variantId}:${totalQty}?checkout`;
        }
      }
    });
  });

  // ----------------------------------------------------
  // 6. UI Helpers (Toast, Gallery, FAQ)
  // ----------------------------------------------------
  function showToast(title, message) {
    if (cartSuccessToast) {
      const toastTitle = document.getElementById('toastTitle');
      const toastMessage = document.getElementById('toastMessage');
      if (toastTitle && title) toastTitle.textContent = title;
      if (toastMessage && message) toastMessage.textContent = message;

      cartSuccessToast.classList.add('show');
      setTimeout(() => {
        cartSuccessToast.classList.remove('show');
      }, 4000);
    }
  }

  // Thumbnails
  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      thumbBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const newSrc = btn.getAttribute('data-src');
      if (mainProductImg && newSrc) {
        mainProductImg.style.opacity = '0.4';
        setTimeout(() => {
          mainProductImg.src = newSrc;
          mainProductImg.style.opacity = '1';
        }, 150);
      }
    });
  });

  // FAQs
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });

  // ----------------------------------------------------
  // 7. Interactive Before & After Slider
  // ----------------------------------------------------
  const baSlider = document.getElementById('baSliderContainer');
  const baRangeInput = document.getElementById('baRangeInput');
  const baDivider = document.getElementById('baDivider');

  if (baSlider && baRangeInput) {
    const updateSlider = (val) => {
      baSlider.style.setProperty('--ba-pos', `${val}%`);
      if (baDivider) baDivider.style.left = `${val}%`;
    };

    baRangeInput.addEventListener('input', (e) => {
      updateSlider(e.target.value);
    });

    baRangeInput.addEventListener('change', (e) => {
      updateSlider(e.target.value);
    });
  }

  // Smooth anchor navigation without polluting URL hash (prevents jumping on reload)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.length > 1 && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Load initial cart count
  fetchCartData();
});
