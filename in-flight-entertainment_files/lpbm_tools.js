/*jslint undef:true,newcap:true,nomen:true,regexp:true,plusplus:true,bitwise:true,browser:true,sloppy:true,white:true*/
/*global window:false,$:false,jQuery:false,alert:false,console:false*/
var LPBM = (function () {
    jQuery.fn.GRAPH_HEIGHTS = function(prices,options,animation) {
      var i,
          variance,difference,percent,min = null,max = null,do_anim = false,
          scaling,height,actual_height,
          defaults = {
            max_height:160,
            min_height:100,
            display:6
          };

          if (typeof animation === 'function') {do_anim = true;}

          options = $.extend(defaults, options);

          for (i=0;i<prices.length;i+=1) {
            if (typeof prices[i] !== 'undefined') {

              if (max === null && min === null) { max = min = prices[i]; }

              if (prices[i] > max) {max = prices[i];}
              else if (prices[i] < min) {
                min = prices[i];
              }

            }
          }

          variance = ~~(max-min);
          scaling = options.max_height - options.min_height;

          if (!do_anim) {
           return this.each(function(count) {
              if (typeof prices[count] !== undefined && prices[count] === max) {
                actual_height = options.max_height;
                $(this).css('height',actual_height);
              }
              else if (typeof prices[count] !== undefined && prices[count] < max && prices[count] > min) {
                difference = prices[count] - min;
                percent = difference / variance;
                height = ~~(scaling * percent);
                actual_height = options.min_height + height;
                $(this).css('height',actual_height);
              }
              else {$(this).css('height',options.min_height);}
            });
          }
          else {
           return this.each(function(count) {
              if (typeof prices[count] !== undefined && prices[count] === max) {
                actual_height = options.max_height;
              }
              else if (typeof prices[count] !== undefined && prices[count] < max && prices[count] > min) {
                difference = prices[count] - min;
                percent = difference / variance;
                height = ~~(scaling * percent);
                actual_height = options.min_height + height;
              }
              else {
                actual_height = options.min_height;
              }
              animation($(this),actual_height,count);
            });
          }
    };
}());