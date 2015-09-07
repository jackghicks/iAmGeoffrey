/**
 * Retrieves the named parameter from the location.search string
 * @param name
 * @returns {string}
 */
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//fetch the name and the chatacter selection
var playerName = getParameterByName('name');
var playerCharacter = getParameterByName('char');

//if either is not set, go to the intro screen
if(!playerName || !playerCharacter)
{
    window.location = "/intro.html";
}