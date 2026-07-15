document.addEventListener('DOMContentLoaded', function () {
    // Initialize Thumbnails Slider
    var swiperThumbs = new Swiper('.swiper-thumbs', {
        spaceBetween: 10,
        slidesPerView: 4,
        direction: 'vertical',
        freeMode: true,
        watchSlidesProgress: true,
        mousewheel: true,
        breakpoints: {
            0: {
                direction: 'horizontal',
                slidesPerView: 3
            },
            992: {
                direction: 'vertical',
                slidesPerView: 4
            }
        }
    });

    // Initialize Main Slider
    var swiperMain = new Swiper('.swiper-main', {
        spaceBetween: 10,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        thumbs: {
            swiper: swiperThumbs,
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        }
    });
});
