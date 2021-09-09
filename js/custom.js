(function($) {

  "use strict";

  // Add smooth scrolling to all links in navbar
  // $(".navbar a,a.btn-appoint, .quick-info li a, .overlay-detail a").on('click', function(event) {
  //
  //   var hash = this.hash;
  //   if (hash) {
  //     event.preventDefault();
  //     $('html, body').animate({
  //       scrollTop: $(hash).offset().top
  //     }, 900, function() {
  //       window.location.hash = hash;
  //     });
  //   }
  //
  // });
  //
  // $(".navbar-collapse a").on('click', function() {
  //   $(".navbar-collapse.collapse").removeClass('in');
  // });

  //jQuery to collapse the navbar on scroll
  $(window).scroll(function() {
    if ($(".navbar-default").offset().top > 50) {
      $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
      $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
  });


  $(window).load(function(){
    $('.preloader').fadeOut(1000); // set duration in brackets
  });

  //Navigation Section
  $('.navbar-collapse a').on('click',function(){
    $(".navbar-collapse").collapse('hide');
  });

  // Owl Carousel
  $('.owl-carousel').owlCarousel({
    animateOut: 'fadeOut',
    items:1,
    loop:true,
    autoplay:true,
  })
  /* ..............................................
    Gallery
    ................................................. */

  $(document).ready(function() {
    $('.popup-gallery').magnificPopup({
      delegate: 'a',
      type: 'image',
      tLoading: 'Loading image #%curr%...',
      mainClass: 'mfp-img-mobile',
      gallery: {
        enabled: true,
        navigateByImgClick: true,
        preload: [0,1] // Will preload 0 - before current, and 1 after the current image
      },
      image: {
        tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
        titleSrc: function(item) {
          return item.el.attr('title') + '<small>by Marsel Van Oosten</small>';
        }
      }
    });
  });

  /* ..............................................
  Gallery
  ................................................. */

  $(document).ready(function() {
    $('.owl-carousel').owlCarousel({
      loop: true,
      margin: 10,
      dots: false,
      //autoplay: true,
      //autoplayTimeout: 3000,
      //autoplayHoverPause: true,
      responsiveClass: true,
      responsive: {
        0: {
          items: 1,
          nav: true
        },
        600: {
          items: 3,
          nav: false
        },
        1000: {
          items: 4,
          nav: true,
          loop: false,
          margin: 15
        }
      }
    })
  })

  // PARALLAX EFFECT
  $.stellar();
})(jQuery);
