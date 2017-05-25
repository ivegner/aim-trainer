$(document).ready(function() {

    const settings = ["difficulty", "size", "speed"];
    var init = true;
    // Preset switching
    $('input[name=preset]').change(
        function(){
            if (this.checked) {
                Cookies.set("preset", this.id);
                switch (this.id) {
                    case 'easyPreset':
                        Cookies.set("preset", "easyPreset");
                        $("#track-trainer").data("mode", "Easy");
                        setSettingsSliders(2, 40, 2);
                        break;

                    case 'mediumPreset':
                        Cookies.set("preset", "mediumPreset");
                        $("#track-trainer").data("mode", "Medium");
                        setSettingsSliders(5, 30, 3);
                        break;

                    case 'hardPreset':
                        Cookies.set("preset", "hardPreset");
                        $("#track-trainer").data("mode", "Hard");
                        setSettingsSliders(7, 20, 5);
                        break;

                    case 'customPreset':
                        Cookies.set("preset", "customPreset");
                        $("#track-trainer").data("mode", "Custom");
                        var c = Cookies.getJSON();
                        var settingsCookieExists = true;
                        for (var i = 0, len = settings.length; i < len; i++) {
                            if (!c[settings[i]]){
                                settingsCookieExists = false;
                                break;
                            }
                        }
                        if(settingsCookieExists){
                            setSettingsSliders(c["difficulty"], c["size"], c["speed"]);
                        }
                        break;

                    default:
                        break;
                }
                if (!init){$("#track-trainer").trigger("reload");}
            }
        }
    );
    $("#mustClick").change(function () {
        if (!init){$("#track-trainer").trigger("reload")};
        Cookies.set("mustClick", $("#mustClick").is(":checked"));
    });
    $("#mustClick").attr("checked", Cookies.getJSON("mustClick") || false);

    // Restore last chosen preset
    var savedPreset = Cookies.get("preset");
    if (savedPreset){
        $("#" + savedPreset).click();
    }
    else {
        $("#easyPreset").click();
    }

    var savedHighScore = Cookies.getJSON("highScore");
    if (savedHighScore){
        $("#highScoreNum").text(savedHighScore["score"]);
        $("#highScoreMode").text(savedHighScore["mode"]);
    }
    else {
        $("#highScoreNum").text(0);
        $("#highScoreMode").text($("#track-trainer").data("mode"));
    }
    $("#resetHighScore").click(function () {
        $("#highScoreNum").text(0);
        $("#highScoreMode").text($("#track-trainer").data("mode"));
        Cookies.set("highScore", {score: 0, mode: $("#track-trainer").data("mode")});
    })

    init = false;

    // Slider binding
    for (var i = 0, len = settings.length; i < len; i++) {
        const setting = settings[i];
        const settId = "#" + setting;
        // initial setting
        $(settId + "Val").text(getSettingVal(setting));
        // Event binding
        $(settId).on("slide", function(slideEvt) {
            Cookies.set("preset", "customPreset");
            $(settId + "Val").text(slideEvt.value);
        });

        $(settId).on("slideStop", function(_) {
            for (var j = 0, len = settings.length; j < len; j++) {
                s = settings[j];
                Cookies.set(s, getSettingVal(s));
            }
            $("#customPreset").click();
            $("#track-trainer").trigger("reload");
        });

    }

});

// function applySettings () {
//     var html = '<script type="text/javascript" src="js/track-trainer.js"></script>';
//     $("#track-trainer").html("").html(html);
// }

function setSettingsSliders (difficulty, size, speed) {
    $("#difficulty").slider("setValue", difficulty);
    $("#difficultyVal").text($("#difficulty").slider("getValue"));
    $("#size").slider("setValue", size);
    $("#sizeVal").text($("#size").slider("getValue"));
    $("#speed").slider("setValue", speed);
    $("#speedVal").text($("#speed").slider("getValue"));
    $("#track-trainer").trigger("reload");
}

function getSettingVal (setting) {
    return $("#" + setting).slider("getValue");
}

