document.addEventListener('DOMContentLoaded', () => {
    // Shared function to handle cart addition
    // Shared function to handle cart addition
    // Helper to update specific details (badge, drawer)
    async function updateCartState() {
        try {
            // 1. Get accurate count
            const cartRes = await fetch('/cart.js');
            const cart = await cartRes.json();

            // Update badges
            const badges = document.querySelectorAll('.cart-count-badge');
            badges.forEach(el => {
                el.textContent = cart.item_count;
                el.classList.remove('d-none');
            });

            // 2. Refresh Drawer HTML
            const res = await fetch(window.Shopify.routes.root + '?section_id=cart-drawer');
            if (res.ok) {
                const text = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');

                const newDrawerBody = doc.querySelector('.offcanvas-body');
                const currentDrawerBody = document.querySelector('#shoppingCart .offcanvas-body');
                const newDrawerFooter = doc.querySelector('.offcanvas-footer');
                const currentDrawerFooter = document.querySelector('#shoppingCart .offcanvas-footer');

                if (newDrawerBody && currentDrawerBody) {
                    currentDrawerBody.innerHTML = newDrawerBody.innerHTML;
                }
                if (newDrawerFooter && currentDrawerFooter) {
                    currentDrawerFooter.innerHTML = newDrawerFooter.innerHTML;
                }
            }

            // 3. Refresh Main Cart Page (if applicable)
            if (document.querySelector('.shopping-cart')) {
                const resCart = await fetch(window.location.href);
                if (resCart.ok) {
                    const text = await resCart.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');
                    const newCartContent = doc.querySelector('.shopping-cart');
                    const currentCartContent = document.querySelector('.shopping-cart');
                    if (newCartContent && currentCartContent) {
                        currentCartContent.innerHTML = newCartContent.innerHTML;
                    }
                }
            }
        } catch (e) {
            console.error('Error updating cart state:', e);
        }
    }

    async function addToCart(formData, btn, originalText) {
        // Helper to show custom alert
        const showAlert = (message) => {
            const modalEl = document.getElementById('alertModal');
            const bodyEl = document.getElementById('alertModalBody');
            if (modalEl && bodyEl && window.bootstrap) {
                bodyEl.textContent = message;
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.show();
                setTimeout(() => modal.hide(), 3000);
            } else {
                alert(message);
            }
        };

        // Visual feedback
        btn.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div>';
        btn.disabled = true;

        try {
            const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                await updateCartState(); // Update badge and drawer

                // Open Drawer
                const cartDrawerEl = document.getElementById('shoppingCart');
                if (cartDrawerEl && window.bootstrap) {
                    const bsOffcanvas = bootstrap.Offcanvas.getInstance(cartDrawerEl) || new bootstrap.Offcanvas(cartDrawerEl);
                    bsOffcanvas.show();
                }

                // Close Quick View if open
                const quickViewEl = document.getElementById('quickViewModal');
                if (quickViewEl) {
                    const qvModal = bootstrap.Modal.getInstance(quickViewEl);
                    if (qvModal) qvModal.hide();
                }
            } else {
                const errorText = await response.text();
                // ... error handling ...
                let message = 'Failed to add item to cart.';
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.description) message = errorJson.description;
                    else if (errorJson.message) message = errorJson.message;
                } catch (e) {
                    message += ` (${response.status})`;
                }
                showAlert(message);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showAlert(error.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    // Change Cart Quantity
    async function changeCartQuantity(key, quantity) {
        try {
            const response = await fetch(window.Shopify.routes.root + 'cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: key, quantity: quantity })
            });
            await updateCartState();
        } catch (error) {
            console.error('Error changing cart quantity:', error);
        }
    }

    // Event Delegation for Drawer Actions
    document.body.addEventListener('click', async (e) => {
        // Add to Cart
        const addToCartBtn = e.target.closest('.add_to_cart');
        if (addToCartBtn) {
            e.preventDefault();
            const variantId = addToCartBtn.getAttribute('data-variant-id');
            if (variantId) {
                const formData = new FormData();
                formData.append('id', variantId);
                formData.append('quantity', 1);
                await addToCart(formData, addToCartBtn, addToCartBtn.innerHTML);
            }
            return;
        }

        // Cart Drawer: Increase/Decrease
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn && actionBtn.closest('#shoppingCart')) {
            e.preventDefault();
            const action = actionBtn.getAttribute('data-action');
            const input = actionBtn.parentElement.querySelector('input[name="updates[]"]');
            if (input) {
                const key = input.getAttribute('data-key'); // Ensure this is set in Liquid
                let currentQty = parseInt(input.value);
                if (action === 'increase') currentQty++;
                else if (action === 'decrease') currentQty--;

                if (currentQty >= 0) await changeCartQuantity(key, currentQty);
            }
            return;
        }

        // Cart Drawer: Remove
        const removeBtn = e.target.closest('.clear-product');
        if (removeBtn && removeBtn.closest('#shoppingCart')) {
            e.preventDefault();
            // Try to find the line index or key
            // Ideally we use a data attribute for the key, but url_to_remove has it too
            // Let's assume we can get it from the index or find a way.
            // Best is if we look for the input in the same row
            const row = removeBtn.closest('tr');
            const input = row.querySelector('input[name="updates[]"]');
            if (input) {
                const key = input.getAttribute('data-key');
                await changeCartQuantity(key, 0);
            } else {
                // Fallback to HREF if needed, but AJAX is better
                window.location.href = removeBtn.href;
            }
        }
    });

    // Handle Quick View form submission
    document.body.addEventListener('submit', async (e) => {
        if (e.target.classList.contains('quick-view-form') || e.target.classList.contains('product-form')) {
            e.preventDefault();
            const form = e.target;
            const btn = form.querySelector('button[type="submit"]');
            const formData = new FormData(form);

            // For product form, ensure we have the Quantity
            // (FormData captures standard inputs automatically)

            await addToCart(formData, btn, btn.innerHTML);
        }
    });
});
