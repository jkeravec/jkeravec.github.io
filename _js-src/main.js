
$(function() {

  // Animate page scroll (require easing.js)
  $('a.page-scroll').bind('click', function(event) {
      var $anchor = $(this);
      $('html, body').stop().animate({
          scrollTop: $($anchor.attr('href')).offset().top
      }, 1500, 'easeInOutExpo');
      event.preventDefault();
  });

  // Highlight the top nav as scrolling occurs (require scrollspy.js)
  $('body').scrollspy({
      target: '.navbar-fixed-top'
  });

  // Contact form
  var $contactForm = $('#contactForm');
  $contactForm.submit(function(event) {
    event.preventDefault();
    // console.log('post');
    // console.log($(this).serialize());
    $.ajax({
      url: "//formspree.io/jkeravec@gmail.com",
      method: "POST",
      data: $(this).serialize(),
      dataType: "json",
      success: function(data) {
        alert("success");
        $('#success').html("<div class='alert alert-success'>");
        $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
            .append("</button>");
        $('#success > .alert-success')
            .append("<strong>Votre message a bien été envoyé!</strong>");
        $('#success > .alert-success')
            .append('</div>');
        $contactForm.trigger("reset");
      },
      error: function(err) {
        alert("error");
        $('#success').html("<div class='alert alert-danger'>");
        $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
            .append("</button>");
        $('#success > .alert-danger').append("<strong>Un problème est survenu, merci d'essayer ultérieurement");
        $('#success > .alert-danger').append('</div>');
        $contactForm.trigger("reset");
      }
    });
  })

  // Closes the Responsive Menu on Menu Item Click
  $('.navbar-collapse ul li a').click(function() {
      $('.navbar-toggle:visible').click();
  });

  // Waypoints (require waypoint.js)
  // var waypoints = $('.row-portfolio .portfolio-item').waypoint(function(direction) {
  //   $(this.element).addClass('animated fadeInUp').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
  //     $(this).removeClass('animated fadeInUp')
  //   });
  // }, {
  //   offset: '100%'
  // });

  // Main nav animation
  $(window).scroll(function() {
    if ($(document).scrollTop() > 50) {
      $('.navbar-fixed-top').addClass('navbar-shrink');
    } else {
      $('.navbar-fixed-top').removeClass('navbar-shrink');
    }
  });

  // Modals (require modal.js)
  $("#portfolioModal").on("show.bs.modal", function(e) {
    var link = $(e.relatedTarget);
    //$(this).find(".modal-content").load(link.attr("href") + "  .modal-content");
    $(this).load(link.attr("href") + "  .modal-content");
    if(history.pushState) {
        history.pushState(null, null, link.attr("href"));
    }
    else {
        location.hash = link.attr("href");
    }
  });

  // Modal called directly
  if ($('.portfolioDirect').length > 0) {
    $('.portfolio-modal').modal({show:true});
//console.log('direct modal');

    $('.close-modal').click(function() {
    //$('#portfolioModal').on('hidden.bs.modal', function (e) {
//console.log('close direct modal');
      window.location = "/";
    })
  }

  // Close modal & update url
  $('#portfolioModal').on('hidden.bs.modal', function (e) {
console.log('close normal modal');
    $(this).find(".modal-content").empty();
    if(history.pushState) {
        //console.log('pushState');
        history.pushState(null, null, "/");
    }
    else {
        location.hash = "/";
    }
  });

  // Close outdated browser
  $('#outdated .close').click(function() {
      $('#outdated').addClass('outdated__hide');
  });

  // Open external links in new window
  $('a[href]:not([href^="http://"+window.location.host)]):not([href^="#"]):not([href^="/"])').attr( 'target', '_blank' );
  $('a[rel="external"]').attr('target', '_blank');

});
