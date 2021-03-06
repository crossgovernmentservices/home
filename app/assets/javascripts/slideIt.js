;(function($) {
  'use strict';

  var pluginName = 'SlideIt',
      pluginVersion = '0.1';

  var defaults = {
    downKey: 40,
    upKey: 38,
    current_class: "slide--current",
    slide_class: "slide",
    transition_time: 600,
    default_display_time: 5000, // for when it isn't a data attr
    offset: 0,
    auto_scroll: false,
    infinite_loop: true
  };

  var next_scroll_timeout;

  $.slideIt = function(options) {
    var settings = $.extend(defaults, options);
    // set the class selectors
    settings = $.extend(settings, {
      current_selector: "." + settings.current_class,
      slide_selector: "." + settings.slide_class
    });

    var $slides = $(settings.slide_selector);

    var init = function() {
      //make sure first visible slide is the active one
      setInitialSlide();

      // watch out for keypress
      $(window).on('keydown', function(e) {
        keyNavigation(e);
      });

    };

    var setInitialSlide = function() {
      // does one exist?
      var $currentSlide = $(settings.current_selector);
      // is there one set in the URL
      if(window.location.hash !== "") {
        $currentSlide = $(window.location.hash);
      }
      if($currentSlide == undefined || $currentSlide > 1) {
        // no? just go for the first slide
        $currentSlide = $slides[0];
      }
      updateActiveSlide($currentSlide);

      // check if auto scroll is enabled
      if(settings.auto_scroll) {
        setUpNextScroll();
      }
    };

    var setUpNextScroll = function() {
      var $currentSlide = $(settings.current_selector);

      var display_time = ( $currentSlide.data("display-time") != undefined ) ? $currentSlide.data("display-time"): settings.default_display_time;

      // only have one scroll timeout active
      window.clearTimeout(next_scroll_timeout);
      next_scroll_timeout = window.setTimeout(moveDown, display_time);
    };

    var updateActiveSlide = function(el) {
      $(el)
        .addClass(settings.current_class)
        .siblings()
          .removeClass(settings.current_class);
      updateHash($(el).attr("id"));
    };

    var updateHash = function(id) {
      window.location.hash = id;
    };

    //sets up keyboard navigation behavior
    var keyNavigation = function (e) {
      var key = e.which;

      // QUESTION: does this check whether currently animating?
      if($('html,body').is(':animated') && (key == settings.upKey || key == settings.downKey)) {
        console.log("already scrolling");
        return false;
      }
      e.preventDefault();
      if(key == settings.upKey) {
        moveUp();
        return false;
      } else if(key == settings.downKey) {
        moveDown();
        return false;
      }
      return true;
    };

    var doScroll = function(el, cb) {
      performMovement(el, cb);
      //element.addClass(ACTIVE).siblings().removeClass(ACTIVE);
    };

    var performMovement = function(el, cb){
      // animate with css3 ??

      // animate with jquery
      var targetTop = $(el).offset().top + settings.offset;
      $('html,body').animate({
        scrollTop: targetTop,
        easing: settings.easing
      }, settings.transition_time)
        .promise().done(
          function () { //only one single callback in case of animating  `html, body`
            //afterSectionLoads(v);
            updateActiveSlide(el);
            if(settings.auto_scroll) {
              setUpNextScroll();
            }
            if(cb) {
              cb();
            }
          });
    };

    var moveUp = function() {
      var prev = $(settings.current_selector).prev(settings.slide_selector);

      // looping to the bottom if there's no more sections above
      if(!prev.length) {
        doScroll($slides[$slides.length - 1]);
      }

      if(prev.length) {
        doScroll(prev);
      }
    };

    var moveDown = function() {
      var next = $(settings.current_selector).next(settings.slide_selector);

      // looping to the top if there's no more sections below
      if(!next.length) {
        // maybe move slides not visible below this one instead...
        doScroll($slides[0]);
      }

      var cb = function() {
        // make sure working with latest slide collection
        $slides = $(settings.slide_selector);
        if($slides.length - $slides.index(next) < 3) {
          var $me = $(settings.slide_selector).first();
          $me.parent().append($me);
        }
      };

      if(next.length) {
        doScroll(next, cb);
      }
    };

    init();

  };

}(jQuery));
