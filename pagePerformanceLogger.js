/*!
 * Page Performance Logger v0.1.1 (http://okize.github.com/)
 * Copyright (c) 2012 | Licensed under the MIT license - http://www.opensource.org/licenses/mit-license.php
 */

;(function (window, document, undefined) {

  'use strict';

  var init = function () {

    // test if browser supports navigation timing api
    var hasNavTiming = (typeof window.performance !== 'undefined' && typeof performance.timing !== 'undefined' && typeof performance.navigation !== 'undefined') ? true : false;

    // test if browser has a console & logger
    var hasLogger = (typeof window.console !== 'undefined' && typeof console.log !== 'undefined') ? true : false;

    // test if console supports grouping
    var hasGrouping = (hasLogger && (typeof console.group !== 'undefined')) ? true : false;

    // test if browser has native json
    var hasJson = (typeof window.JSON !== 'undefined' && typeof JSON.stringify !== 'undefined') ? true : false;

    // if navigation timing and json is supported then start building browser performance object
    if (hasNavTiming) {

      // the performanceTiming interface
      var t = performance.timing;

      // the performanceNavigation interface
      var n = performance.navigation;

      // browser/window/monitor dimensions
      var dim = {
        vh: window.innerHeight,
        vw: window.innerWidth,
        wh: window.outerHeight,
        ww: window.outerWidth,
        mh: screen.height,
        mw: screen.width
      };

      // page performance object
      var pagePerformance = function() {

        return {

          'Page Information': {
            'Timestamp': new Date(),
            'URL': window.location.href,
            'Site': window.location.host,
            'Page Title': document.title,
            'DOM Nodes': document.getElementsByTagName('*').length
          },
          'User Information': {
            'User Agent': window.navigator.userAgent,
            'Language': window.navigator.language || window.navigator.userLanguage,
            'Viewport Dimensions': {
              height: dim.vh,
              width: dim.vw
            },
            'Window Dimensions': {
              height: dim.wh,
              width: dim.ww
            },
            'Monitor Dimensions': {
              height: dim.mh,
              width: dim.mw
            }
          },
          'Navigation Timing': {
            'Performance Timing': t,
            'Performance Navigation': n
          }

        };

      };

      // returns the performance object as json
      var returnPagePerformanceAsJson = function() {

        if (hasJson) {
          return JSON.stringify(pagePerformance());
        } else {
          return 'Can\'t execute returnPagePerformanceAsJson() function because there is no native JSON support';
        }

      };

      // logs performance object to browser console
      var logPagePerformanceToConsole = function () {

        // looping vars
        var type, key, val;

        // returns string represention of last non-redirect navigation in the current browsing context
        // http://www.w3.org/TR/2011/CR-navigation-timing-20110315/#sec-navigation-info-interface
        var getNavigationType = function (typeInt) {

          var navigationTypes = [
            'Clicked link or entered url in address bar',
            'Page reload',
            'Backward or forward in browser history'
          ];

          var navType = navigationTypes[typeInt] || 'Reserved (unknown) Navigation Type';

          return navType;

        };

        // create readable metrics from nav timing
        var createNavTimingMetrics = function (obj) {

          delete obj['Navigation Timing'];

          // http://www.w3.org/TR/2011/CR-navigation-timing-20110315/#sec-navigation-timing-interface
          obj['Performance Timing'] = {
            'Redirecting Time': t.redirectEnd - t.redirectStart,
            'Network Latency': t.responseEnd - t.fetchStart,
            'Domain Lookup (DNS)': t.domainLookupEnd - t.domainLookupStart,
            'Establishing Connection (TCP)': t.connectEnd - t.connectStart,
            'Request-Response': t.responseEnd - t.requestStart,
            'DOM Processing': t.domComplete - t.domLoading,
            'User-Perceived Loading Time': t.loadEventEnd - t.navigationStart
          };

          // append millisecond unit to timing data
          for (var key in obj['Performance Timing']) {
            obj['Performance Timing'][key] += 'ms';
          }

          // http://www.w3.org/TR/2011/CR-navigation-timing-20110315/#sec-navigation-info-interface
          obj['Performance Navigation'] = {
            'Navigation Type': getNavigationType(n.type),
            'Redirect Count' : n.redirectCount
          };

          return obj;

        };

        // create readable browser information
        var createBrowserMetrics = function (obj) {

          obj['User Information'] = {
            'User Agent': window.navigator.userAgent,
            'Language': window.navigator.language || window.navigator.userLanguage,
            'Viewport Dimensions': 'width: ' + dim.vw + 'px | height: ' + dim.vh + 'px',
            'Window Dimensions': 'width: ' + dim.ww + 'px | height: ' + dim.wh + 'px',
            'Monitor Dimensions': 'width: ' + dim.mw + 'px | height: ' + dim.mh + 'px'
          };

          return obj;

        };

        var ppObj = createBrowserMetrics(createNavTimingMetrics(pagePerformance()));

        if (hasLogger && hasGrouping) {

          // if the browser console supports grouping, this makes it easier to read
          console.group('==☆ Page Performance Log ☆==');
          for (type in ppObj) {

            console.group(type + ': ');
            for (key in ppObj[type]) {
              val = ppObj[type][key];
              console.log( key + ' -> ' + val);
            }
            console.groupEnd();

          }
          console.groupEnd();

        } else if (hasLogger) {

          // for when there's no grouping available (I'm looking at you IE9)
          for (type in ppObj) {
            console.log(type + ': ');
            for (key in ppObj[type]) {
              console.log( key + ' -> ' + ppObj[type][key]);
            }
          }

        } else {

          // if there's no console available
          alert('There is no console to log page performance object to');

        }

      };

      // append performance data to global object
      return window.pagePerformance = {
        obj: pagePerformance,
        json: returnPagePerformanceAsJson,
        log: logPagePerformanceToConsole
      };

    } else {

      // for browsers that don't support navigation timing
      return undefined;

    }

  };

  // wait until after the window finishes loading to do anything
  if (typeof window !== 'undefined') {

    if (window.addEventListener) {
      window.addEventListener('load', init, false);
    } else if (window.attachEvent) {
      window.attachEvent('onload', init);
    } else {
      window.onload = init;
    }

  }

})(window, window.document);