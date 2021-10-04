function doAuthentication(){
    var password = $("#pwd").val();

    //change login pwd here
    const pwd = "TA38_genered";
    if(password === pwd){
        $(".center").fadeOut();
        setTimeout(function() {
            window.location = "index.html";
        }, 400);
    }else {
        $("p").remove();
        $(".center").append("<p id='alert'>incorrect password</p>");
        $("#pwd").addClass("error");
        setTimeout(function() {
            $("#pwd").removeClass("error");
            $("#alert").fadeOut().queue(function() {
                this.remove();
            });
        }, 1000);
    }
}