class PredictiveSearch {
    constructor() {
        this.container = document.getElementById('searchDrawer');
        this.input = document.getElementById('SearchDrawerInput');
        this.resultsContainer = document.getElementById('predictive-search-results');
        this.categoryFilter = document.getElementById('searchCategoryFilter');

        if (!this.input) return;

        this.input.addEventListener('input', this.debounce((event) => {
            this.onChange(event);
        }, 300).bind(this));
    }

    onChange() {
        const searchTerm = this.input.value.trim();

        if (!searchTerm.length) {
            this.resultsContainer.innerHTML = ''; // Or restore default suggestions
            return;
        }

        this.getSearchResults(searchTerm);
    }

    getSearchResults(searchTerm) {
        const queryKey = searchTerm.replace(" ", "-").toLowerCase();

        // Shopify Predictive Search API
        // We can add filtering by resource type, limit etc.
        // Note: 'collection' filter isn't native to predictive search query param, 
        // typically we post-filter or append to query if supported (which it isn't standardly).
        // For now, we will just search products.

        fetch(`${window.routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&resources[type]=product&resources[limit]=5&section_id=predictive-search`)
            .then((response) => {
                if (!response.ok) {
                    var error = new Error(response.status);
                    this.close();
                    throw error;
                }

                return response.text();
            })
            .then((text) => {
                const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML;
                this.resultsContainer.innerHTML = resultsMarkup;
            })
            .catch((error) => {
                this.close();
                throw error;
            });
    }

    debounce(fn, wait) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    close() {
        // Optional: clear results or handle close state
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new PredictiveSearch();
});
