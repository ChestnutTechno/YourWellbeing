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

  // PARALLAX EFFECT
  $.stellar();
})(jQuery);
