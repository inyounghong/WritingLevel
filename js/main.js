// Globals

var MAX_WORD_LENGTH = 16;
var LARGE_WORD_MIN = 10;
var MEDIUM_WORD_MIN = 7;
var WORD_COUNT_LIMIT = 10000;

var totalWords = 0;
var wordLengths = new Array(MAX_WORD_LENGTH).fill(0);
var sentences;
var sentenceCount = 0;
var missingWords = [];
var frequency = {};
var urlIndex = 0;

var urls = [
    "https://www.fanfiction.net/s/11574569/1/Dodging-Prison-and-Stealing-Witches-Revenge-is-Best-Served-Raw",
    "https://www.fanfiction.net/s/11364705/1/Barefoot",
    "https://www.fanfiction.net/s/3484954/1/The-Marriage-Stone",
    "https://www.fanfiction.net/s/2565609/1/Odd-Ideas",
    "https://www.fanfiction.net/s/3964606/1/Alexandra-Quick-and-the-Thorn-Circle",
    "https://www.fanfiction.net/s/8149841/1/Again-and-Again"
]

$(document).ready(function() {
    $("#submit").click(function() {
        url = $("#url").val();
        submitURL(url);



        for (var i = 0; i < urls.length; i++) {
            // submitURL(urls[i]);
        }
    });
})

function submitURL(url) {

    var request = $.ajax({
      url: "../php/getStory.php?url=" + url,
      method: "GET"
    });

    request.done(function(msg) {
        console.log("retrieved " + url);
        // Has not reached word limit, continue
        if (!processText(msg, url)) {
            var index = url.lastIndexOf("/");
            var page = parseInt(url.substring(index - 1, index)) + 1;
            var nextURL = url.substring(0, index - 2) + "/" + page + url.substring(index);
            submitURL(nextURL);
        } else { // Reached word limit, display and clear
            displayResults(url);
            clearGlobals();

            urlIndex++;
            if (urlIndex != urls.length) {
                submitURL(urls[urlIndex]);
            }
        }


    });
    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
}

function handleWordLengths(word) {
    var wordLength = word.length;
    if (wordLength <= MAX_WORD_LENGTH) {
        wordLengths[wordLength]++;
    } else {
        wordLengths.push(word);
    }
}

// Maps words that are 5+ characters
function handleWordFrequency(word) {
    if (word.length < 5) {
        return;
    }

    if (word in frequency && frequency[word] != 1) {
        frequency[word] = 1;
    } else {
        frequency[word] = 0;
    }
}

// Returns true if done processing (word count reached)
function processText(text, url) {
    sentences = text.match(/\b[^.!?]+[.!?]/ig);
    sentenceCount = sentences.length;

    // Loop through sentences
    for (var i = 0; i < sentenceCount; i++) {
        var words = sentences[i].match(/Mr\.|Mrs\.|Ms\.|[.!?]|\b[^.!? ]+\b/ig);
        var wordCount = words.length - 1;

        totalWords += wordCount;
        if (totalWords >= WORD_COUNT_LIMIT) {
            break;
        }

        // Loop through words in each sentence
        for (var j = 0; j < wordCount; j++) {
            var word = words[j];
            handleWordLengths(word);
            handleWordFrequency(word);
            // console.log(words[j]);
        }
    }

    // for (var i = 4000; i < 4100; i++) {
    //     console.log(words[i]);
    // }
    // for (var i = 0; i < wordLengths.length; i++) {
    //     console.log(i + " " + wordLengths[i]);
    // }

    console.log(missingWords);
    return totalWords >= WORD_COUNT_LIMIT;

}

function clearGlobals() {
    console.log("clearing globals");
    url = "";
    totalWords = 0;
    wordLengths = new Array(MAX_WORD_LENGTH).fill(0);
    sentences;
    sentenceCount = 0;
    missingWords = [];
    frequency = {};
}

function displayResults(url) {
    // $("#text").val(text);
    // $("#wordCount").text(totalWords);
    // $("#sentenceCount").text(sentenceCount);
    // $("#wordsPerSentence").text(round(totalWords/sentenceCount));
    // $("#percentLargeWords").text(percentLargeWords());
    // $("#percentMediumWords").text(percentMediumWords());
    var numUnique = uniqueWords();
    var str = '<ul>';
    str += '<li><b>Story: ' + url + '</b></li>';
    // str += '<li>Word Count: ' + totalWords + '</li>';
    // str += '<li>Sentence Count: ' + sentenceCount + '</li>';
    // str += '<li>Words Per Sentence: ' + round(totalWords/sentenceCount) + '</li>';
    str += '<li>Large Words: ' + percentLargeWords() + '</li>';
    str += '<li>Medium Words: ' + percentMediumWords() + '</li>';
    str += '<li>Unique Words: ' + numUnique + ' / Percent: ' + percentUniqueWords(numUnique) + '</li>';
    str += '</ul>';
    $("#results").append(str);
}

function uniqueWordScore(numUnique) {
    return round((numUnique * totalWords) / 10000, 2);
}

function uniqueWords() {
    var uniqueWords = 0;
    for (var word in frequency){
        if (frequency[word] == 0){
            uniqueWords++;
        }
    }
    return uniqueWords;
}

function percentUniqueWords(uniqueWords) {
    return round((uniqueWords / totalWords) * 100, 1);
}

function round(val, power) {
    return Math.round(val * Math.pow(10, power)) / Math.pow(10, power);
}


function percentLargeWords() {
    var largeWordCount = 0;
    for (var i = LARGE_WORD_MIN; i < MAX_WORD_LENGTH; i++) {
        largeWordCount += wordLengths[i];
    }
    return round((largeWordCount / totalWords) * 1000, 1);
}

function percentMediumWords() {
    var mediumWordCount = 0;
    for (var i = MEDIUM_WORD_MIN; i < LARGE_WORD_MIN; i++) {
        mediumWordCount += wordLengths[i];
    }
    return round((mediumWordCount / totalWords) * 1000, 1);
}
