angular-sortable-view v0.0.1
=================

Simple (multi)sortable view for AngularJS. No jQuery nor jQueryUI required

Demo: http://kamilkp.github.io/angular-sortable-view/

You can find the source code for this demo on branch "gh-pages".

###DESCRIPTION:

This is a simple library written as a module for [AngularJS](https://github.com/angular/angular.js) for sorting elements in the UI. It supports both single elements list, and multiple connected lists, where an element can be moved from one to another.

This library requires ***no dependencies whatsoever*** (except angular.js of course), so ***you no longer need to include jQuery and jQueryUI and angularUI*** which altogether gives the size of around ***340kB minified***. Whereas the [angular-sortable-view](https://github.com/kamilkp/angular-sortable-view) is only ***5kB minified!***
 is only ***5kB minified!***

The API is declarative. So if you need to specity a handle for sortables just place a `sv-handle` attribue on the given element. See the examples below:

###Example of single sortable list

```html
<div sv-root sv-part="modelArray">
	<div ng-repeat="item in modelArray" sv-element>
		<div>{{item}}</div>
	</div>
</div>
```

###Example of multiple sortable lists

```html
<div sv-root>
	<div sv-part="modelArray1">
		<div ng-repeat="item in modelArray1" sv-element>
			<div>{{item}}</div>
		</div>
	</div>
	<div sv-part="modelArray2">
		<div ng-repeat="item in modelArray2" sv-element>
			<div>{{item}}</div>
		</div>
	</div>
</div>
```

###Using handles

```html
<div sv-root sv-part="modelArray">
	<div ng-repeat="item in modelArray" sv-element>
		<div>{{item}}</div>
		<span sv-handle></span>
	</div>
</div>
```
