;(function(window, angular){
	'use strict';
	/* jshint eqnull:true */
	/* jshint -W041 */

	var module = angular.module('sortableView', []);
	module.directive('svRoot', [function(){
		function shouldBeAfter(elem, pointer, isGrid){
			if(isGrid)
				return elem.x - pointer.x < 0;
			else
				return elem.y - pointer.y < 0;
		}

		var ROOTS_MAP = Object.create(null);
		// window.ROOTS_MAP = ROOTS_MAP;

		return {
			restrict: 'A',
			controller: ['$scope', '$attrs', '$interpolate', function($scope, $attrs, $interpolate){
				function getSortableElements(key){
					return ROOTS_MAP[key];
				}
				function removeSortableElements(key){
					delete ROOTS_MAP[key];
				}

				var mapKey = $interpolate($attrs.svRoot)($scope) || $scope.$id;
				if(!ROOTS_MAP[mapKey]) ROOTS_MAP[mapKey] = [];

				var that = this;
				var candidates; // set of possible destinations
				var $placeholder; // placeholder element
				var options; // sortable options
				var $helper; // helper element - the one thats being dragged around with the mouse pointer
				var $original; // original element
				var $target; // last best candidate
				var isGrid = false;

				// check if at least one of the lists have a grid like layout
				$scope.$watchCollection(function(){
					return getSortableElements(mapKey);
				}, function(collection){
					isGrid = false;
					var array = collection.map(function(item){
						return {
							part: item.getPart().id,
							y: item.element[0].getBoundingClientRect().top
						};
					});
					var dict = Object.create(null);
					array.forEach(function(item){
						if(dict[item.part])
							dict[item.part].push(item.y);
						else
							dict[item.part] = [item.y];
					});
					Object.keys(dict).forEach(function(key){
						dict[key].sort();
						dict[key].forEach(function(item, index){
							if(index < dict[key].length - 1){
								if(item > 0 && item === dict[key][index + 1]){
									isGrid = true;
								}
							}
						});
					});
				});
				this.$moveUpdate = function(opts, mouse, svElement, svOriginal){
					candidates = [];
					if(!$placeholder){
						var svRect = svElement[0].getBoundingClientRect();
						$placeholder = svOriginal.clone();
						$placeholder.addClass('sv-placeholder');
						$placeholder.css({
							'height': svRect.height + 'px',
							'width': svRect.width + 'px'
						});
						svOriginal.after($placeholder);
						svOriginal.addClass('ng-hide');

						// cache options, helper and original element reference
						$original = svOriginal;
						options = opts;
						$helper = svElement;
					}
					getSortableElements(mapKey).forEach(function(se, index){
						var rect = se.element[0].getBoundingClientRect();
						var center = {
							x: ~~(rect.left + rect.width/2),
							y: ~~(rect.top + rect.height/2)
						};
						if(!se.container && // not the container element
							(se.element[0].scrollHeight || se.element[0].scrollWidth)){ // element is visible
							candidates.push({
								element: se.element,
								q: (center.x - mouse.x)*(center.x - mouse.x) + (center.y - mouse.y)*(center.y - mouse.y),
								view: se.getPart(),
								targetIndex: se.getIndex(),
								after: shouldBeAfter(center, mouse, isGrid)
							});
						}
						if(se.container && !se.element[0].querySelector('[sv-element]')){ // empty container
							candidates.push({
								element: se.element,
								q: (center.x - mouse.x)*(center.x - mouse.x) + (center.y - mouse.y)*(center.y - mouse.y),
								view: se.getPart(),
								targetIndex: 0,
								container: true
							});
						}
					});
					var pRect = $placeholder[0].getBoundingClientRect();
					var pCenter = {
						x: ~~(pRect.left + pRect.width/2),
						y: ~~(pRect.top + pRect.height/2)	
					};
					candidates.push({
						q: (pCenter.x - mouse.x)*(pCenter.x - mouse.x) + (pCenter.y - mouse.y)*(pCenter.y - mouse.y),
						element: $placeholder,
						placeholder: true
					});
					candidates.sort(function(a, b){
						return a.q - b.q;
					});

					candidates.forEach(function(cand, index){
						if(index === 0 && !cand.placeholder && !cand.container){
							$target = cand;
							if(cand.after){
								cand.element.after($placeholder);
							}
							else{
								var prevSibl = getPreviousSibling(cand.element);
								if(prevSibl.length > 0){
									prevSibl.after($placeholder);
								}
								else{
									cand.element.parent().prepend($placeholder);
								}
							}
							cand.element.addClass('sv-candidate');
						}
						else if(index === 0 && cand.container){
							$target = cand;
							cand.element.append($placeholder);
						}
						else
							cand.element.removeClass('sv-candidate');
					});
				};

				this.$drop = function(originatingPart, index, options){
					if(options.revert){
						var placeholderRect = $placeholder[0].getBoundingClientRect();
						['-webkit-', '-moz-', '-ms-', '-o-', ''].forEach(function(prefix){
							if(typeof $helper[0].style[prefix + 'transition'] !== "undefined")
								$helper[0].style[prefix + 'transition'] = 'all ' + options.revert + 'ms ease';
						});
						setTimeout(afterRevert, +options.revert);
						$helper.css({
							'top': placeholderRect.top + document.body.scrollTop + 'px',
							'left': placeholderRect.left + document.body.scrollLeft + 'px'
						});
					}
					else
						afterRevert();

					function afterRevert(){
						$placeholder.remove();
						$helper.remove();
						$original.removeClass('ng-hide');

						candidates = void 0;
						$placeholder = void 0;
						options = void 0;
						$helper = void 0;
						$original = void 0;
						
						if($target){
							$target.element.removeClass('sv-candidate');
							var spliced = originatingPart.model(originatingPart.scope).splice(index, 1);
							var targetIndex = ($target.view === originatingPart && $target.targetIndex > index) ?
								$target.targetIndex - 1 : $target.targetIndex;
							if($target.after) targetIndex++;
							$target.view.model($target.view.scope).splice(targetIndex, 0, spliced[0]);
							if(!$scope.$root.$$phase) $scope.$apply();
						}
						
						$target = void 0;
					}
				};

				this.addToSortableElements = function(se){
					getSortableElements(mapKey).push(se);
				};
				this.removeFromSortableElements = function(se){
					var elems = getSortableElements(mapKey);
					var index = elems.indexOf(se);
					if(index > -1){
						elems.splice(index, 1);
						if(elems.length === 0)
							removeSortableElements(mapKey);
					}
				};

				var windowElement = angular.element(window);
				windowElement.on('scroll', scrollHandler);
				$scope.$on('$destroy', function(){
					windowElement.off('off', scrollHandler);
				});
				
				var _prevScroll = {
					top: document.body.scrollTop,
					left: document.body.scrollLeft
				};
				function scrollHandler(e){
					var _scroll = {
						top: document.body.scrollTop,
						left: document.body.scrollLeft
					};
					var diff = {
						x: _scroll.left - _prevScroll.left,
						y: _scroll.top - _prevScroll.top
					};
					if($helper){
						$helper[0].reposition(diff);
					}

					_prevScroll = _scroll;
				}
			}]
		};
	}]);

	module.directive('svPart', ['$parse', function($parse){
		return {
			restrict: 'A',
			require: '^svRoot',
			controller: ['$scope', function($scope){
				this.getPart = function(){
					return $scope.part;
				};
				this.$drop = function(index, options){
					$scope.$sortableRoot.$drop($scope.part, index, options);
				};
			}],
			scope: true,
			compile: function($element, $attrs){
				return {
					pre: function($scope, $element, $attrs, $sortable){
						if(!$attrs.svPart) throw new Error('no model provided');
						var model = $parse($attrs.svPart);
						if(!model.assign) throw new Error('model not assignable');

						$scope.part = {
							id: $scope.$id,
							element: $element,
							model: model,
							scope: $scope
						};
						$scope.$sortableRoot = $sortable;

						var sortablePart = {
							element: $element,
							getPart: function(){
								return $scope.part;
							},
							container: true
						};
						$sortable.addToSortableElements(sortablePart);
						$scope.$on('$destroy', function(){
							$sortable.removeFromSortableElements(sortablePart);
						});
					},
					post: function($scope, $element, $attrs, $sortable){
					}
				};
			}
		};
	}]);

	module.directive('svElement', ['$parse', function($parse){
		return {
			restrict: 'A',
			require: ['^svPart', '^svRoot'],
			controller: ['$scope', function($scope){
				$scope.$ctrl = this;
			}],
			link: function($scope, $element, $attrs, $controllers){
				var sortableElement = {
					element: $element,
					getPart: function(){
						return $controllers[0].getPart();
					},
					getIndex: function(){
						return $scope.$index;
					}
				};
				$controllers[1].addToSortableElements(sortableElement);
				$scope.$on('$destroy', function(){
					$controllers[1].removeFromSortableElements(sortableElement);
				});

				var handle = $element;
				handle.on('mousedown', onMousedown);
				$scope.$watch('$ctrl.handle', function(customHandle){
					if(customHandle){
						handle.off('mousedown', onMousedown);
						handle = customHandle;
						handle.on('mousedown', onMousedown);
					}
				});

				var body = angular.element(document.body);
				var html = angular.element(document.documentElement);
				
				function onMousedown(e){
					if(e.button != 0) return;

					var opts = $parse($attrs.svElement)($scope);
					opts = angular.extend({}, {
						tolerance: 'pointer',
						revert: 200,
						containment: 'html'
					}, opts);
					if(opts.containment){
						opts.containment = document.querySelector(opts.containment);
						var containmentRect = opts.containment.getBoundingClientRect();
					}

					var target = $element;
					var clientRect = $element[0].getBoundingClientRect();
					var clone = target.clone();
					clone.addClass('sv-helper').css({
						'left': clientRect.left + document.body.scrollLeft + 'px',
						'top': clientRect.top + document.body.scrollTop + 'px',
						'width': clientRect.width + 'px'
					});
					body.append(clone);
					clone[0].reposition = function(coords, absolute){
						var leftPx = absolute ? 0 : +this.style.left.slice(0, -2);
						var topPx = absolute ? 0 : +this.style.top.slice(0, -2);
						var targetLeft = leftPx + coords.x;
						var targetTop = topPx + coords.y;

						if(containmentRect){
							if(targetTop < containmentRect.top + document.body.scrollTop) // top boundary
								targetTop = containmentRect.top + document.body.scrollTop;
							if(targetTop + clientRect.height > containmentRect.top + document.body.scrollTop + containmentRect.height) // bottom boundary
								targetTop = containmentRect.top + document.body.scrollTop + containmentRect.height - clientRect.height;
							if(targetLeft < containmentRect.left + document.body.scrollLeft) // left boundary
								targetLeft = containmentRect.left + document.body.scrollLeft;
							if(targetLeft + clientRect.width > containmentRect.left + document.body.scrollLeft + containmentRect.width) // right boundary
								targetLeft = containmentRect.left + document.body.scrollLeft + containmentRect.width - clientRect.width;	
						}
						this.style.left = targetLeft + 'px';
						this.style.top = targetTop + 'px';
					};

					var pointerOffset = {
						x: e.clientX - clientRect.left,
						y: e.clientY - clientRect.top
					};
					html.addClass('sv-sorting-in-progress');
					html.on('mousemove', onMousemove).on('mouseup', function mouseup(e){
						html.off('mousemove', onMousemove);
						html.off('mouseup', mouseup);
						html.removeClass('sv-sorting-in-progress');
						$controllers[0].$drop($scope.$index, opts);
					});

					function onMousemove(e){
						// ----- move the element
						var pos = {
							x: e.clientX + document.body.scrollLeft - pointerOffset.x,
							y: e.clientY + document.body.scrollTop - pointerOffset.y
						};
						clone[0].reposition(pos, true /* absolute position provided */);

						// ----- reorganize placeholders
						$controllers[1].$moveUpdate(opts, {x: e.clientX, y: e.clientY}, clone, $element);
					}
				}
			}
		};
	}]);

	module.directive('svHandle', function(){
		return {
			require: '^svElement',
			link: function($scope, $element, $attrs, $ctrl){
				$ctrl.handle = $element;
			}
		};
	});

	angular.element(document.head).append([
		'<style>' +
		'.sv-helper{' +
			'position: absolute;' +
			'z-index: 99999;' +
			'margin: 0 !important;' +
			'pointer-events: none;' +
		'}' +
		'.sv-candidate{' +
		'}' +
		'.sv-placeholder{' +
			'opacity: 0;' +
		'}' +
		'.sv-sorting-in-progress{' +
			'-webkit-user-select: none;' +
			'-moz-user-select: none;' +
			'-ms-user-select: none;' +
			'user-select: none;' +
		'}' +
		'</style>'
	].join(''));

	function getPreviousSibling(element){
		element = element[0];
		if(element.previousElementSibling)
			return angular.element(element.previousElementSibling);
		else{
			var sib = element.previousSibling;
			while(sib != null && sib.nodeType != 1)
				sib = sib.previousSibling;
			return angular.element(sib);
		}
	}
})(window, window.angular);