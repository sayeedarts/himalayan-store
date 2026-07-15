document.addEventListener('DOMContentLoaded', () => {
    const quickViewModal = document.getElementById('quickViewModal');
    const quickViewContent = document.getElementById('quick-view-content');

    if (quickViewModal && quickViewContent) {
        quickViewModal.addEventListener('show.bs.modal', async (event) => {
            // Button that triggered the modal
            let button = event.relatedTarget;
            // Extract info from data-bs-* attributes
            let productUrl = button.getAttribute('data-product-url');

            // Fallback: Check parent if the trigger was a child element (e.g., span inside a)
            if (!productUrl && button.closest('[data-product-url]')) {
                productUrl = button.closest('[data-product-url]').getAttribute('data-product-url');
            }

            console.log('Quick View requested for:', productUrl);

            if (!productUrl) {
                console.error('Quick View: No product URL found on trigger element.');
                return;
            }

            // Show loading state
            quickViewContent.innerHTML = `
        <div class="d-flex justify-content-center py-10">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      `;

            try {
                // Ensure the URL has the view parameter
                const url = new URL(productUrl, window.location.origin);
                url.searchParams.set('view', 'quick-view');

                // Add a timeout to the fetch
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                const response = await fetch(url.toString(), { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`Product fetch failed: ${response.status}`);
                const html = await response.text();
                console.log('Quick View HTML length:', html.length);
                console.log('Quick View HTML prefix:', html.substring(0, 100));

                // Check if HTML is valid/contains expected content (e.g., check for a known element class)
                if (!html || html.trim().length === 0) throw new Error('Empty response received');

                // Safety check: sometimes the index page is returned on 404s depending on router setup
                if (html.includes('<html') || html.includes('<!doctype')) {
                    throw new Error('Invalid response type (Full Page returned)');
                }

                quickViewContent.innerHTML = html;

                // Validate Dependencies
                if (typeof Swiper === 'undefined') {
                    console.error('Swiper is not loaded. Carousel will not function.');
                } else {
                    requestAnimationFrame(() => {
                        const thumbsContainer = quickViewContent.querySelector('.quick-view-thumbs');
                        const mainContainer = quickViewContent.querySelector('.quick-view-slider');

                        if (thumbsContainer && mainContainer) {
                            try {
                                const thumbsSwiper = new Swiper(thumbsContainer, {
                                    spaceBetween: 10,
                                    slidesPerView: 4,
                                    freeMode: true,
                                    watchSlidesProgress: true,
                                    observer: true,
                                    observeParents: true
                                });
                                new Swiper(mainContainer, {
                                    spaceBetween: 10,
                                    navigation: {
                                        nextEl: ".swiper-button-next",
                                        prevEl: ".swiper-button-prev",
                                    },
                                    thumbs: {
                                        swiper: thumbsSwiper,
                                    },
                                    observer: true,
                                    observeParents: true
                                });
                            } catch (e) {
                                console.error('Swiper initialization error:', e);
                            }
                        } else {
                            // If containers are missing, the HTML might be malformed or empty div
                            if (!quickViewContent.innerText.trim()) {
                                throw new Error('Product details could not be rendered.');
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading quick view:', error);
                const msg = error.name === 'AbortError' ? 'Request timed out.' : error.message;
                quickViewContent.innerHTML = `<div class="text-center py-5">
                    <p class="text-danger mb-2">Error loading product details.</p>
                    <p class="small text-muted">${msg}</p>
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                </div>`;
            }
        });

        // Cleanup on hidden
        quickViewModal.addEventListener('hidden.bs.modal', () => {
            quickViewContent.innerHTML = '';
        });
    }
});
