Version 0.0.7 - 2014/07/02

  to do

Version 0.0.6 - 2014/07/01
================

  * You can now listen for resorting. An `sv-on-sort` attribute can be now placed on an element with `sv-root`. The expression passed as a value of that attribute will be evaluated when elements order has changed after sorting.

Version 0.0.5 - 2014/06/26
================

  * source element for sorting is now detached from DOM instead of giving him `display: none`

Version 0.0.4 - 2014/06/25
================

  * Fixed the issue with helper styles
  * Dropped the need for the browser to support pointer-events CSS property
  * Added the project to the bower registy, it is available to download via `bower install angular-sortable-view`

Version 0.0.3 - 2014/06/11
================

  * Added support for custom placeholders
  * Better containment handling
  * Bug fixes
  * BREAKING CHANGE: the module name is now `angular-sortable-view`

Version 0.0.2 - 2014/06/11
================

  * Added support for empty lists
  * Added support for custom helpers

Version 0.0.1
================

  * Support for setting a containment
  * Support for multiple sortable lists connected with each other
  * Support for specifying a handle element
