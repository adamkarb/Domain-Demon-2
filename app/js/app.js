
(function () {
    'use strict';

    var whois = require('node-whois');
    var fs = require('fs');
    var nunjucks = require('nunjucks');
    var $ = require('jquery');

    // Refactor to a config folder
    var env = nunjucks.configure('app/templates');

    // var emailOutput = [];
    // var urls = [];
    // var urlLength = urls.length;
    // var urlCount = 0;

    $('#results').hide();
    $('.loading').hide();

    $('#form').on('submit', submitForm);

    function submitForm(event) {

        $('#results').hide();
        $('.loading').show();

        event.preventDefault();

        var domain = $('#domain').val();

        // regex the crap out of this url
        domain = trimDomain(domain);

        search(domain, function (error, data) {

            if (error) {
                $('.loading').hide();
                return $('#results').show().html(error);
            }

            var resultData = objectify(data);

            // newHtml -> html compiled and returned from template
            var newHtml = env.render('search-results.nunjucks', { iterator: resultData });

            // Hide loading marker
            $('.loading').hide();

            // display results
            $('#results').show().html(newHtml);

            // Reset the search field
            $('#domain').val('');

        });

    }


    function search(urls, callback) {

        //urls.forEach(function(link) {

        whois.lookup(urls, function (err, data) {

            if (err) {
                return console.log('err', err);
            }

            fs.writeFile('results.txt', data, function () {
                console.log("Written");
            });

            if ((data.indexOf('ERROR') !== -1) || (data.indexOf('No match') !== -1)) {
                return callback('No results found...', null);
            }

            callback(null, data);


            //if (urlCount === urlLength) {
            //    console.log(emailOutput);
            //}

        });

        //urlCount++;

        //});
    }

    function objectify(input) {

        input.replace(/\r\n/g, '\n');

        var newArray = input.split('\n');

        var obj = {};

        newArray.forEach(function (item) {

            if (item.indexOf(': ') !== -1) {

                var mike = item.split(": ");

                mike[0] = mike[0].replace(/\s+/g, '_').toLowerCase();
                mike[1] = mike[1].trim();

                obj[mike[0]] = mike[1];

                if (mike[0] === 'NameServer') {
                    var breakOut = true;
                }
            }

        });

        return obj;

    }

    function trimDomain(domain) {

        // make sure no whitespace plz
        // remove any common website prefix
        // remove anything after trailing slash, including slash
        return domain.trim().replace(/^(?:http(?:s)?:\/\/)?(?:www(?:[0-9]+)?\.)?/gi, '').replace(/\/.*$/, '').replace(/\s+.*$/gi, '');;

    }

})();
