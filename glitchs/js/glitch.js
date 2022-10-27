// var loader = document.getElementById('loader');
// window.addEventListener("load", function(event) {
//     document.body.classList.add('glitched');
// });

$(document).ready(function(){

  $('body').addClass('glitched');

  $('h1,h2,h3,h4').addClass('contentTitle');
  $('p').addClass('contentText');

	// DIGITAL GLITCH
  // This is a digital glitch primarily done through CSS
  //
  function setupGlitchImages() {
    $('#page img').addClass("been-glitched");
    $('img.been-glitched').each(function(){
      //
      // get current img element
      var imgEl = $(this);
      //
      // get position of img element
      var positionObj = {
        top: imgEl.position().top,
        left: imgEl.position().left,
        width: imgEl.outerWidth(),
        height: imgEl.outerHeight()
      };
      // set position (relative) of img clone
      var clonePositionObj = {
        top: 0,
        left: 0,
        width: positionObj.width,
        height: positionObj.height
      };
      //
      // add glitch colletion after it
      var glitchCollEl = $('<div class="glitch">');
      imgEl.after(glitchCollEl);
      //
      // set position of glitch collection
      glitchCollEl.css(positionObj);
      //
      // create new glitch layers
      for(i=0;i<5;i++) {
        // create new img element
        //var copyEl = $('<img>');
        // clone its contents
        var imgTag = imgEl.prop("outerHTML");
        var imgCopyEl = $(imgTag).removeClass("been-glitched");
        imgCopyEl.css(clonePositionObj);
        //$(imgEl).copyCSS(copyEl)
        // set position
        //copyEl.css(positionObj);
        // insert in glitch layer collection
        var newGlitch = $('<div class="glitchit">').append(imgCopyEl);
        glitchCollEl.append(newGlitch);
      }

      // //var imgTag = imgEl[0].outerHTML;
      // var imgTag = imgEl.prop("outerHTML");
      // var imgStyle = imgEl.css();
      // var positionObj = {
      //   top: imgEl.position().top,
      //   left: imgEl.position().left,
      //   width: imgEl.width(),
      //   height: imgEl.height()
      // };
      // // console.log(imgTag);
      //
      // glitchEl = $('<div class="glitch">');
      // glitchEl.css(positionObj);
      // imgEl.after(glitchEl);
      // for(i=0;i<5;i++) {
      //   var newImg = $(imgTag).removeClass("been-glitched");
      //   //newImg.css(imgStyle);
      //   var newGlitch = $('<div class="glitchit">').append(newImg);
      //   glitchEl.append(newGlitch);
      // }
    });
  }

  function repositionGlitch() {
    $('img.been-glitched').each(function(){
      var imgEl = $(this);
      var positionObj = {
        top: imgEl.position().top,
        left: imgEl.position().left,
        width: imgEl.outerWidth(),
        height: imgEl.outerHeight()
      };
      glitchEl = imgEl.next('.glitch');
      glitchEl.css(positionObj);
    });
  }

  setupGlitchImages();

  // if window is resized we have to recalculate position of images
  $(window).resize(function(){
    repositionGlitch();
  });

  // OVERLAY glitch
  // This creates an overlay over the wholee screen,
  // then periodically flashes glitch images through JS/jquery
  //
  imgDir = 'https://blackrocktrainstation.com/wp-content/uploads/2021/04/';
  overlays = [
    'glitch-overlay-1.png',
    'glitch-overlay-2.png',
    'glitch-overlay-3.png',
    'glitch-overlay-4.png',
    'glitch-overlay-5.png',
    'glitch-overlay-6.png',
    'glitch-overlay-7.png',
    'glitch-overlay-8.png',
    'glitch-overlay-9.png',
  	'static1.jpg'
  ];

  function setupGlitchOverlay() {
    $("body").append('<div id="overlays">');
    for (var i=0;i<overlays.length;i++) {
        this.$newEl = $('<div></div>')
        $newEl.addClass(`overlay overlay${i}`);
        $newEl.css("background-image", `url(${imgDir}${overlays[i]})`);
        $newEl.hide();
        $("#overlays").append($newEl);
    }
  }

  setupGlitchOverlay();

  /**
   * Returns a random integer between min (inclusive) and max (inclusive).
   * The value is no lower than min (or the next integer greater than min
   * if min isn't an integer) and no greater than max (or the next integer
   * lower than max if max isn't an integer).
   * Using Math.round() will give you a non-uniform distribution!
   */
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var flashMin = 50;
  var flashMax = 400;

  function flashOneOverlay(flashLength) {
    var randIndex = getRandomInt(0, overlays.length - 1);
    //console.log(`showing .overlay${randIndex} (${flashLength}ms)`);
    $(`.overlay.overlay${randIndex}`).show();
    setTimeout(function(randIndex){
        //console.log(`hiding .overlay${randIndex}`);
        $(`.overlay.overlay${randIndex}`).hide();
    }.bind(null, randIndex), flashLength);
  }

  function flashOverlays() {
    // select how many
    var min = 1;
    var max = 3;
    var howMany = getRandomInt(min, max);
    var timing = 0;
    // pick overlays
    for (var i=0; i<=howMany; i++) {
      var flashLength = getRandomInt(flashMin, flashMax);
      //console.log("flashLength", flashLength);
      timing += flashLength;
      setTimeout(function(flashLength){
        flashOneOverlay(flashLength);
      }.bind(null, flashLength), timing);
    }
    // setTimeout(function(){
    //         $('.overlay').css('z-index', zBack);
    // }, delay*(howMany+1));
  }

  (function loop() {
    var min = 10000;
    var max = 60000;
    var rand = Math.round(Math.random() * (max - min)) + min;
    setTimeout(function() {
      flashOverlays();
      loop();
    }, rand);
  }());

});
