'use strict';

angular.module('angular-svg-round-progress')
    .directive('roundProgress', ['$window', 'roundProgressService', 'roundProgressConfig', function($window, service, roundProgressConfig){

            var base = {
                restrict: "EA",
                replace: true,
                transclude: true,
                scope:{
                    current:        "=",
                    max:            "=",
                    semi:           "=",
                    rounded:        "=",
                    clockwise:      "=",
                    responsive:     "=",
                    radius:         "@",
                    color:          "@",
                    bgcolor:        "@",
                    stroke:         "@",
                    duration:       "@",
                    animation:      "@"
                }
            };

            if(!service.isSupported){
                return angular.extend(base, {
                    // placeholder element to keep the structure
                    template: '<div class="round-progress" ng-transclude></div>'
                });
            }

            return angular.extend(base, {
                link: function(scope, element){
                    var svg         = element.find('svg').eq(0);
                    var ring        = svg.find('path').eq(0);
                    var background  = svg.find('circle').eq(0);
                    var options     = angular.copy(roundProgressConfig);
                    var lastAnimationId;

                    var renderCircle = function(){
                        var isSemicircle     = options.semi;
                        var responsive       = options.responsive;
                        var radius           = parseInt(options.radius) || 0;
                        var stroke           = parseInt(options.stroke);
                        var diameter         = radius*2;
                        var backgroundSize   = radius - (stroke/2);

                        svg.css({
                            "top":          0,
                            "left":         0,
                            "position":     responsive ? "absolute" : "static",
                            "width":        responsive ? "100%" : (diameter + "px"),
                            "height":       responsive ? "100%" : (isSemicircle ? radius : diameter) + "px",
                            "overflow":     "hidden" // on some browsers the background overflows, if in semicircle mode
                        });

                        // note that we can't use .attr, because if jQuery is loaded, it lowercases all attributes
                        // and viewBox is case-sensitive
                        svg[0].setAttribute('viewBox', '0 0 ' + diameter + ' ' + (isSemicircle ? radius : diameter));

                        element.css({
                            "width":            responsive ? "100%" : "auto",
                            "position":         "relative",
                            "padding-bottom":   responsive ? (isSemicircle ? "50%" : "100%") : 0
                        });

                        ring.css({
                            "stroke":           options.color,
                            "stroke-width":     stroke,
                            "stroke-linecap":   options.rounded ? "round": "butt"
                        });

                        if(isSemicircle){
                            ring.attr("transform", options.clockwise ? "translate("+ 0 +","+ diameter +") rotate(-90)" : "translate("+ diameter +", "+ diameter +") rotate(90) scale(-1, 1)");
                        }else{
                            ring.attr("transform", options.clockwise ? "" : "scale(-1, 1) translate("+ (-diameter) +" 0)");
                        }

                        background.attr({
                            "cx":           radius,
                            "cy":           radius,
                            "r":            backgroundSize >= 0 ? backgroundSize : 0
                        }).css({
                            "stroke":       options.bgcolor,
                            "stroke-width": stroke
                        });
                    };

                    var renderState = function(newValue, oldValue){
                        var max                 = service.toNumber(options.max || 0);
                        var end                 = newValue > max ? max : (newValue < 0 || !newValue ? 0 : newValue);
                        var start               = (oldValue === end || oldValue < 0) ? 0 : (oldValue || 0); // fixes the initial animation
                        var changeInValue       = end - start;

                        var easingAnimation     = service.animations[options.animation];
                        var startTime           = new Date();
                        var duration            = parseInt(options.duration) || 0;
                        var preventAnimation    = (newValue > max && oldValue > max) || (newValue < 0 && oldValue < 0) || duration < 25;

                        var radius              = options.radius;
                        var circleSize          = radius - (options.stroke/2);
                        var elementSize         = radius*2;
                        var isSemicircle        = options.semi;

                        // stops some expensive animating if the value is above the max or under 0
                        if(preventAnimation){
                            service.updateState(end, max, circleSize, ring, elementSize, isSemicircle);
                        }else{
                            $window.cancelAnimationFrame(lastAnimationId);

                            (function animation(){
                                var currentTime = $window.Math.min(new Date() - startTime, duration);

                                service.updateState(
                                    easingAnimation(currentTime, start, changeInValue, duration),
                                    max,
                                    circleSize,
                                    ring,
                                    elementSize,
                                    isSemicircle);

                                if(currentTime < duration){
                                    lastAnimationId = $window.requestAnimationFrame(animation);
                                }
                            })();
                        }
                    };

                    var keys = Object.keys(base.scope).filter(function(key){
                        return key !== 'current';
                    });

                    // properties that are used only for presentation
                    scope.$watchGroup(keys, function(newValue){
                        for(var i = 0; i < newValue.length ; i++){
                            if(typeof newValue[i] !== 'undefined'){
                                options[keys[i]] = newValue[i];
                            }
                        }

                        renderCircle();
                    });

                    // properties that are used during animation. some of these overlap with
                    // the ones that are used for presentation
                    scope.$watchGroup(['current', 'max', 'animation', 'duration', 'radius', 'stroke', 'semi'], function(newValue, oldValue){
                        renderState(service.toNumber(newValue[0]), service.toNumber(oldValue[0]));
                    });
                },
                template:[
                    '<div class="round-progress-wrapper">',
                        '<svg class="round-progress" xmlns="http://www.w3.org/2000/svg">',
                            '<circle fill="none"/>',
                            '<path fill="none"/>',
                            '<g ng-transclude></g>',
                        '</svg>',
                    '</div>'
                ].join('\n')
            });

        }]);
