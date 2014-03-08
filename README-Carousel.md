#UICarousel

##A Carousel Widget for Swipable Content


ChocolateChip-UI provides a carousel widget to allow providing content that the user can navigate through using left and right swipes of a finger. For testing on the desktop, you can also navigate a carousel with a mouse click and drag to the left or right.

To create a carousel, you first use a div with the class "carousel". Inside this you put an unordered list. Each list item in that list will constitute a panel of the carousel. You would output the content direction into each list item. Below is an example of the structure for a carousel.

    <div id='myCarousel' class='carousel'>
      <ul>
        <li>
        <img src="../images/usa.jpg">
        </li>
        <li>
        <img src="../images/american-football.jpg">
        </li>
        <li>
        <img src="../images/apple-pie.jpg">
        </li>
        <li>
        <img src="../images/hamburger.jpg">
        </li>
      </ul>
    </div>

Once you have the correct structure in place, you can initialize it as follows:

    $(function() {
      myCarousel = $('#myCarousel').UICarousel({pagination: true, loop: false, callback: function(e, panel) {
          myCarousel.setPagination(e, panel);
        }
      }).data('carousel');
    });

Note that UICarousel can be configured with several optional values. These are:

- pagination: true/false
- loop: true/false
- preventPageScroll: true/false
- callback: function() { // your code here }

Regarding the pagination option, if you have more than say 18 panels in your carousel you would not want to implement pagination as the pagination indicator will get really cramped together. For 18 or less panels, the pagination indicators also serve as a means of navigating the carousel by tapping, although with more indicators it may be hard for the user to accurately tap them. To initialize pagination, you need to have an instance of your carousel. Because in the example above we intialized the carousl and stored its instance in the variable "myCarousel", we can initalize pagination inside the callback if the following code:

   myCarousel.setPagination(e, panel);


If the loop property is set to true, when the users tries to swipe pass the last item, it will loop back to the first item, etc. If looping is set to false, the user cannot swipe before the first or past the last panel.

When preventPageScroll is set to true, when the user swipes diagonally on a carousel, it will not scroll the page vertically. Please be aware that if you enable this feature in your app and the carousel takes up most of the vertical space on the device, the user may not be able to scroll up or down on the page to get at content above or below the carousel.

The callback allows you to fire a callback when each panel is swiped. The callback passes two parameters to your code, the event and the node for the current panel being swiped into view. If you want to do something with that panel node using jQuery, you'd need to wrap it like so: $(panel).css('background-color', red);



