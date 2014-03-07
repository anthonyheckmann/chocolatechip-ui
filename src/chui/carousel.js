(function($) {
  'use strict';

  //////////////////////////////
  // Create a swipable carousel:
  //////////////////////////////
  /* 
  var options = {
    loop: true,
    preventPageScroll: true,
    callback: function(index, element) {}
  } 
  */
  function UICarousel(container, options) {
    var rtl = $('html').attr('dir');
    if (!container) return;
    var element = container.firstElementChild;
    var panels, currentPanel, width, length;
    var pagination;
    currentPanel = 0;
    options = options || {};
    var index = 0;
    var speed = options.speed || 300;
    var loop = (options.loop === undefined || options.loop === false) ? false : true;
    function setup() {
      panels = $(element).children();
      length = panels.length;
      if (panels.length < 2) loop = false;
      if (options.loop && panels.length < 3) {
        $(element).append($(panels[0]).clone(true));
        $(element).append($(element.children().eq(1)).clone(true));
        panels = element.children;
      }
      function setUpPagination() {
        if (!options.pagination) return;
        if ($(container).next('.pagination')[0]) return;
        if (options.pagination) {
          pagination = document.createElement('ul');
          $(pagination).addClass('pagination');
          for (var i = 0; i < length; i++) {
            $(pagination).append('<li></li>');
          }
        }
        $(container).after(pagination);
        $('.pagination').css('width', $(container).width()).find('li').eq(0).addClass('selected');
        $('.pagination').on('singletap', 'li', function() {
          var carousel = $(this).closest('.pagination').prev().data('carousel');
          carousel.transitionTo($(this).index());
          $(this).siblings('li').removeClass('selected');
          $(this).addClass('selected');
        });        
      }
      setUpPagination();
      currentPanel = [panels.length];
      width = $(container).width();
      $(element).css('width', (panels.length * width));
      var panelNumber = panels.length;
      while(panelNumber--) {
        var panel = $(panels[panelNumber]);
        panel.css('width', width);
        panel.css('left', (panelNumber * -width));
        move(panelNumber, index > panelNumber ? -width : (index < panelNumber ? width : 0), 0);
      }
      if (loop) {
        move(getModulus(index - 1), -width, 0);
        move(getModulus(index + 1), width, 0);
      }
      $(element).css('left', (index * -width));
      $(container).css('visibility','visible');
    }
    function getModulus(index) {
      return (panels.length + (index % panels.length)) % panels.length;
    }
    function transitionTo(panelPosition, transitionSpeed) {
      if (index === panelPosition) return;
      var direction = Math.abs(index - panelPosition) / (index - panelPosition);
      if (loop) {
        var natural_direction = direction;
        direction = -currentPanel[getModulus(panelPosition)] / width;
        if (direction !== natural_direction) panelPosition =  -direction * panels.length + panelPosition;
      }
      var diff = Math.abs(index - panelPosition) - 1;
      while (diff--) {
        move(getModulus((panelPosition > index ? panelPosition : index) - diff - 1), width * direction, 0);
      }
      panelPosition = getModulus(panelPosition);
      move(index, width * direction, transitionSpeed || speed);
      move(panelPosition, 0, transitionSpeed || speed);
      if (loop) {
        move(getModulus(panelPosition - direction), -(width * direction), 0);
      }
      index = panelPosition;
      options.callback && options.callback(index, panels.eq(index));
    }
    function move(index, dist, speed) {
      translate(index, dist, speed);
      currentPanel[index] = dist;
    }
    function translate(index, dist, speed) {
      var panel = panels[index];
      var style = panel && panel.style;
      if (!style) return;
      style.webkitTransitionDuration =
      style.msTransitionDuration = 
      style.transitionDuration = speed + 'ms';
      style.webkitTransform = 'translate3d(' + dist + 'px,0,0)';
      style.msTransform = 'translate3d(' + dist + 'px,0,0)';
      style.transform = 'translate3d(' + dist + 'px,0,0)';
    }

    var start = {};
    var delta = {};
    var isScrolling;      
    var events = {
      handleEvent: function(event) {
        switch (event.type) {
          case $.eventStart: this.start(event); break;
          case $.eventMove: this.move(event); break;
          case $.eventEnd: this.end(event); break;
          case 'click': event.preventDefault(); event.stopImmediatePropagation(); break;
        }
      },
      start: function(event) {
        var touches = $.isTouchEnabled ? event.touches[0] : event;
        if (!$.isTouchEnabled) event.preventDefault();
        start = {
          x: touches.pageX,
          y: touches.pageY,
          time: +new Date()
        };
        isScrolling = undefined;
        delta = {};
        element.addEventListener($.eventMove, this, false);
        element.addEventListener($.eventEnd, this, false);
      },
      move: function(event) {
        if ((event.touches && event.touches.length > 1) || event.scale && event.scale !== 1) return;
        if (options.preventPageScroll) event.preventDefault();
        var touches = $.isTouchEnabled ? event.touches[0] : event;
        delta = {
          x: touches.pageX - start.x,
          y: touches.pageY - start.y
        };
        if ( typeof isScrolling === undefined) {
          isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
        }
        if (!isScrolling) {
          event.preventDefault();
          if (loop) {
            translate(getModulus(index - 1), delta.x + currentPanel[getModulus(index - 1)], 0);
            translate(index, delta.x + currentPanel[index], 0);
            translate(getModulus(index + 1), delta.x + currentPanel[getModulus(index + 1)], 0);
          } else {
            delta.x = delta.x / ((!index && delta.x > 0 || index === panels.length - 1 && delta.x < 0 ) ? ( Math.abs(delta.x) / width + 1 ) : 1 );
            translate(index - 1, delta.x + currentPanel[index - 1], 0);
            translate(index, delta.x + currentPanel[index], 0);
            translate(index + 1, delta.x + currentPanel[index + 1], 0);
          }
        }
      },
      end: function(event) {
        var duration = +new Date() - start.time;
        var isValidPanel = Number(duration) < 250 && Math.abs(delta.x) > 20 || Math.abs(delta.x) > width / 2;
        var isPastBounds = 
          !index && delta.x > 0 || index === panels.length - 1 && delta.x < 0;
        if (loop) isPastBounds = false;
        var direction = delta.x < 0;
        if (!isScrolling) {
          if (isValidPanel && !isPastBounds) {
            if (direction) {
              if (loop) {
                move(getModulus(index - 1), -width, 0);
                move(getModulus(index + 2), width, 0);
              } else {
                move(index - 1, -width, 0);
              }
              move(index, currentPanel[index] - width, speed);
              move(getModulus(index + 1), currentPanel[getModulus(index + 1)] - width, speed);
              index = getModulus(index + 1);       
            } else {
              if (loop) {
                move(getModulus(index + 1), width, 0);
                move(getModulus(index - 2), -width, 0);
              } else {
                move(index + 1, width, 0);
              }
              move(index, currentPanel[index] + width, speed);
              move(getModulus(index - 1), currentPanel[getModulus(index - 1)] + width, speed);
              index = getModulus(index - 1);
            }
            options.callback && options.callback(index, panels[index]);
          } else {
            if (loop) {
              move(getModulus(index - 1), -width, speed);
              move(index, 0, speed);
              move(getModulus(index + 1), width, speed);
            } else {
              move(index - 1, -width, speed);
              move(index, 0, speed);
              move(index + 1, width, speed);
            }
          }
        }
        element.removeEventListener($.eventMove, events, false);
        element.removeEventListener($.eventEnd, events, false);
      }
    };
    setup();
    element.addEventListener($.eventStart, events, false);
    if (options.preventClick) element.addEventListener('click', events, false);
    return {
      setup: function() {
        setup();
      },
      transitionTo: function(panelPosition, speed) {
        transitionTo(panelPosition, speed);
      },
      setPagination: function(e, panel) {
        $(container).next('.pagination').find('li').removeClass('selected');
        $(container).next('.pagination').find('li').eq($(panel).index()).addClass('selected');
      }
    };
  }

  ////////////////////////////
  // Expose carousel method to
  // node collections:
  ////////////////////////////
  $.fn.extend({
    UICarousel : function(params) {
      return this.each(function() {
        var carousel =  new UICarousel($(this)[0], params);
        $(this).data('carousel',carousel);
      });
    }
  });


  $(function() {
    $(document).on('orientationchange', function() {
      $('.carousel').each(function(_, ctx) {
        $(ctx).data('carousel').setup();
      });
    });
  });

})(window.jQuery);