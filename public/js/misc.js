// (function($) {
//   'use strict';
//   $(function() {
//     var body = $('body');
//     var contentWrapper = $('.content-wrapper');
//     var scroller = $('.container-scroller');
//     var footer = $('.footer');
//     var sidebar = $('.sidebar');

//     //Add active class to nav-link based on url dynamically
//     //Active class can be hard coded directly in html file also as required
//     var current = location.pathname.split("/").slice(-1)[0].replace(/^\/|\/$/g, '');
//     $('.nav li a', sidebar).each(function() {
//       var $this = $(this);
//       if (current === "") {
//         //for root url
//         if ($this.attr('href').indexOf("index.html") !== -1) {
//           $(this).parents('.nav-item').last().addClass('active');
//           if ($(this).parents('.sub-menu').length) {
//             $(this).closest('.collapse').addClass('show');
//             $(this).addClass('active');
//           }
//         }
//       } else {
//         //for other url
//         if ($this.attr('href').indexOf(current) !== -1) {
//           $(this).parents('.nav-item').last().addClass('active');
//           if ($(this).parents('.sub-menu').length) {
//             $(this).closest('.collapse').addClass('show');
//             $(this).addClass('active');
//           }
//         }
//       }
//     })

//     //Close other submenu in sidebar on opening any

//     sidebar.on('show.bs.collapse', '.collapse', function() {
//       sidebar.find('.collapse.show').collapse('hide');
//     });


//     //Change sidebar and content-wrapper height
//     applyStyles();

//     function applyStyles() {
//       //Applying perfect scrollbar
//       if (!body.hasClass("rtl")) {
//         if ($('.tab-content .tab-pane.scroll-wrapper').length) {
//           const settingsPanelScroll = new PerfectScrollbar('.settings-panel .tab-content .tab-pane.scroll-wrapper');
//         }
//         if ($('.chats').length) {
//           const chatsScroll = new PerfectScrollbar('.chats');
//         }
//       }
//     }

//     //checkbox and radios
//     $(".form-check label,.form-radio label").append('<i class="input-helper"></i>');

//     //fullscreen
//     $("#fullscreen-button").on("click", function toggleFullScreen() {
//       if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
//         if (document.documentElement.requestFullScreen) {
//           document.documentElement.requestFullScreen();
//         } else if (document.documentElement.mozRequestFullScreen) {
//           document.documentElement.mozRequestFullScreen();
//         } else if (document.documentElement.webkitRequestFullScreen) {
//           document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
//         } else if (document.documentElement.msRequestFullscreen) {
//           document.documentElement.msRequestFullscreen();
//         }
//       } else {
//         if (document.cancelFullScreen) {
//           document.cancelFullScreen();
//         } else if (document.mozCancelFullScreen) {
//           document.mozCancelFullScreen();
//         } else if (document.webkitCancelFullScreen) {
//           document.webkitCancelFullScreen();
//         } else if (document.msExitFullscreen) {
//           document.msExitFullscreen();
//         }
//       }
//     })
//   });



// })(jQuery);

(function($) {
    $(".repeater").createRepeater({
        showFirstItemToDefault: false
    });

    // Function for managing Featured IMAGE functionality for update
    window.removeFeaturedImg = function(element, event, name){
        $(element).parents('.featured-image').append('<img src="https://via.placeholder.com/400x150?text=No+Image" class="img-fluid" id="hotel_featured_image" /><input class="form-control" name="'+name+'" type="file" onchange="readURL(this)">')
        $(element).parents('.featured-image-field').remove();
        event.preventDefault();
        return false;
    };

    // Function for managing Multiple IMAGE functionality for update
    window.removeMultipleImg = function(element, event){
        $(element).parents('.col-4').remove();
        event.preventDefault();
        return false;
    };

    // FILE Upload preview for hotel featured Image
    window.readURL = function(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#hotel_featured_image')
                    .attr('src', e.target.result);
            };

            reader.readAsDataURL(input.files[0]);
        }
    }

    tinymce.init({
        selector: 'textarea',
        height: 300,
        theme: 'modern',
        plugins: 'print preview fullpage powerpaste searchreplace autolink directionality advcode visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount tinymcespellchecker a11ychecker imagetools mediaembed  linkchecker contextmenu colorpicker textpattern help',
        toolbar1: 'formatselect | bold italic strikethrough forecolor backcolor | link | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat',
        image_advtab: true,
        templates: [
        { title: 'Test template 1', content: 'Test 1' },
        { title: 'Test template 2', content: 'Test 2' }
        ],
        content_css: [
        '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
        '//www.tinymce.com/css/codepen.min.css'
        ]
        });
})(jQuery);