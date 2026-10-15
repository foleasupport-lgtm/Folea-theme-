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

  // Fetch Cart Details from Shopify AJAX API
  function fetchCartData() {
    fetch('/cart.js')
      .then(res => {
        if (!res.ok) throw new Error('Not Shopify runtime');
        return res.json();
      })
      .then(cart => {
        updateCartUI(cart);
      })
      .catch(() => {
        // Fallback for local preview environment
      });
  }

  function updateCartUI(cart) {
    if (cartCountBadge) cartCountBadge.textContent = cart.item_count;
    if (drawerCartCount) drawerCartCount.textContent = cart.item_count;
    
    // Format currency
    const formattedTotal = (cart.total_price / 100).toLocaleString('en-PK', {
      style: 'currency',
      currency: cart.currency || 'PKR'
    });
    if (drawerCartTotal) drawerCartTotal.textContent = formattedTotal;

    if (cart.item_count === 0) {
      if (cartDrawerBody) {
        cartDrawerBody.innerHTML = `
          <div class="cart-empty-state">
            <p>Your bag is empty.</p>
            <a href="#productSection" class="btn-primary-small" onclick="document.getElementById('cartDrawer').classList.remove('open'); document.body.style.overflow='';">Order Folea Serum</a>
          </div>
        `;
      }
    } else {
      if (cartDrawerBody) {
        let itemsHTML = '<div class="cart-items-list">';
        cart.items.forEach(item => {
          const itemPrice = (item.final_line_price / 100).toLocaleString('en-PK', {
            style: 'currency',
            currency: cart.currency || 'PKR'
          });
          itemsHTML += `
            <div class="drawer-cart-item">
              <img src="${item.featured_image ? item.featured_image.url : ''}" alt="${item.title}">
              <div class="item-details">
                <h4>${item.product_title}</h4>
                <div class="item-price">${itemPrice}</div>
                <div class="item-qty">Qty: ${item.quantity}</div>
              </div>
            </div>
          `;
        });
        itemsHTML += '</div>';
        cartDrawerBody.innerHTML = itemsHTML;
      }
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
  // 4. Real Shopify "Add To Bag" Action
  // ----------------------------------------------------
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async () => {
      addToCartBtn.disabled = true;
      const originalText = addToCartBtn.innerHTML;
      addToCartBtn.innerHTML = `<span>ADDING...</span>`;

      const variantId = await resolveVariantId();
      const qty = currentQuantity || 1;

      if (!variantId) {
        const form = document.getElementById('foleaProductForm');
        if (form) form.submit();
        addToCartBtn.disabled = false;
        addToCartBtn.innerHTML = originalText;
        return;
      }

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
      .then(res => {
        if (!res.ok) throw new Error('Add to cart failed');
        return res.json();
      })
      .then(() => {
        addToCartBtn.disabled = false;
        addToCartBtn.innerHTML = originalText;
        showToast("Added to Bag!", `${qty}x Folea Serum added.`);
        fetchCartData();
        openCartDrawer();
      })
      .catch((err) => {
        console.error('Cart add error:', err);
        addToCartBtn.disabled = false;
        addToCartBtn.innerHTML = originalText;
        const form = document.getElementById('foleaProductForm');
        if (form) form.submit();
      });
    });
  }

  // ----------------------------------------------------
  // 5. Real Shopify "ORDER VIA CASH ON DELIVERY" (Checkout Redirect)
  // ----------------------------------------------------
  async function executeOrderViaCheckout() {
    if (orderNowBtn) {
      orderNowBtn.disabled = true;
      const label = document.getElementById('btnTextLabel');
      if (label) label.textContent = 'PROCEEDING TO CHECKOUT...';
    }

    const variantId = await resolveVariantId();
    const qty = currentQuantity || 1;

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
  if (stickyOrderBtn) stickyOrderBtn.addEventListener('click', executeOrderViaCheckout);

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

  // Load initial cart count
  fetchCartData();
});
