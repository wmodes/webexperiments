// execute only when jQuery is ready
// $(function() {

pages = ["#fullpage1", "#fullpage2"];
active = 0;

// start by hiding all but first page
showNothingBut(pages[active]);

// add event handler to button
$("#trans-button").click(function(){
    var newScreen = (active + 1) % pages.length;
    console.log("Old:", pages[active], "New:", pages[newScreen])
    flareAndTransition(pages[active], pages[newScreen]);
    active = newScreen;
})

//
// Helper Functions
//

function flareAndTransition(page1, page2) {
    $(page1).css("opacity", "0");
    $(page2).css("opacity", "0");
    setTimeout(function() {
        showNothingBut(page2);
        $(page2).css("opacity", "1");
    }, 1000);
}

function showNothingBut(selector) {
    $(".fullpage").addClass("invisible");
    $(selector).removeClass("invisible");
}

// })