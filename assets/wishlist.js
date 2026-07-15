document.addEventListener('DOMContentLoaded', () => {
    const LOCAL_STORAGE_KEY = 'perfume_factory_wishlist';

    const getWishlist = () => {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    };

    const setWishlist = (items) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
        updateWishlistUI();
    };

    // ... existing code ...
    const updateWishlistUI = () => {
        const wishlist = getWishlist();

        document.querySelectorAll('.wishlist').forEach(btn => {
            const handle = btn.getAttribute('data-product-handle');
            if (wishlist.includes(handle)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const countBadges = document.querySelectorAll('.wishlist-count-badge');
        countBadges.forEach(el => el.textContent = wishlist.length);

        // Render Page if we are on it
        const wishlistGrid = document.getElementById('wishlist-grid');
        if (wishlistGrid) {
            renderWishlistPage(wishlist);
        }
    };

    const renderWishlistPage = async (wishlist) => {
        const grid = document.getElementById('wishlist-grid');
        const loader = document.getElementById('wishlist-loading');
        const emptyMsg = document.getElementById('wishlist-empty');

        if (!grid || !loader || !emptyMsg) return;

        if (wishlist.length === 0) {
            loader.classList.add('d-none');
            emptyMsg.classList.remove('d-none');
            // Remove existing items if any
            grid.querySelectorAll('.col-6').forEach(el => el.remove());
            return;
        }

        emptyMsg.classList.add('d-none');
        // Check if we need to re-render (optimization could be added, but simplest is full render or check)
        // For now, let's just fetch everything.

        try {
            const query = wishlist.map(handle => `handle:${handle}`).join(' OR ');
            const response = await fetch(`${window.Shopify.routes.root}search?view=card&type=product&q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const html = await response.text();
                // Clear loader and existing items (except static ones if logic changes, but here we just append or replace)
                // We keep the loader/empty divs in DOM, so we should separate the container or just append to grid

                // Let's create a temporary container to extract the divs? 
                // No, the search.card.liquid returns a list of divs.

                // Clean grid of old product cards first
                grid.querySelectorAll('.col-6, .col-md-4').forEach(el => el.remove());

                loader.classList.add('d-none');
                grid.insertAdjacentHTML('beforeend', html);

                // Re-init quick view or other plugins if needed (e.g. Swiper)
                // If product-card uses swiper, we might need to trigger it.
            } else {
                console.error('Failed to load wishlist items');
                loader.textContent = 'Error loading wishlist.';
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            loader.textContent = 'Error loading wishlist.';
        }
    };

    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.wishlist');
        if (!btn) return;

        e.preventDefault();
        const handle = btn.getAttribute('data-product-handle');
        if (!handle) return;

        let wishlist = getWishlist();
        if (wishlist.includes(handle)) {
            wishlist = wishlist.filter(item => item !== handle);
        } else {
            wishlist.push(handle);
        }

        setWishlist(wishlist);
    });

    // Initial update
    updateWishlistUI();
});
