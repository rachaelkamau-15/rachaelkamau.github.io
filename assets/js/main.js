
(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$nav = $('#nav'),
		$main = $('#main'), // Keep this for targeting project sections
		$navPanelToggle, $navPanel, $navPanelInner;

	// Breakpoints.
		breakpoints({
			default:   ['1681px',   null       ],
			xlarge:    ['1281px',   '1680px'   ],
			large:     ['981px',    '1280px'   ],
			medium:    ['737px',    '980px'    ],
			small:     ['481px',    '736px'    ],
			xsmall:    ['361px',    '480px'    ],
			xxsmall:   [null,       '360px'    ]
		});

	/**
	 * Applies parallax scrolling to an element's background image.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._parallax = function(intensity) {

		var	$window = $(window),
			$this = $(this);

		if (this.length == 0 || intensity === 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._parallax(intensity);

			return $this;

		}

		if (!intensity)
			intensity = 0.25;

		$this.each(function() {

			var $t = $(this),
				$bg = $('<div class="bg"></div>').appendTo($t),
				on, off;

			on = function() {

				$bg
					.removeClass('fixed')
					.css('transform', 'matrix(1,0,0,1,0,0)');

				$window
					.on('scroll._parallax', function() {

						var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);

						$bg.css('transform', 'matrix(1,0,0,1,0,' + (pos * intensity) + ')');

					});

			};

			off = function() {

				$bg
					.addClass('fixed')
					.css('transform', 'none');

				$window
					.off('scroll._parallax');

			};

			// Disable parallax on ..
				if (browser.name == 'ie'			// IE
				||	browser.name == 'edge'			// Edge
				||	window.devicePixelRatio > 1		// Retina/HiDPI (= poor performance)
				||	browser.mobile)					// Mobile devices
					off();

			// Enable everywhere else.
				else {

					breakpoints.on('>large', on);
					breakpoints.on('<=large', off);

				}

		});

		$window
			.off('load._parallax resize._parallax')
			.on('load._parallax resize._parallax', function() {
				$window.trigger('scroll');
			});

		return $(this);

	};

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Scrolly.
		$('.scrolly').scrolly();

	// Background.
		$wrapper._parallax(0.925);

	// Nav Panel.

		// Toggle.
			$navPanelToggle = $(
				'<a href="#navPanel" id="navPanelToggle">Menu</a>'
			)
				.appendTo($wrapper);

			// Change toggle styling once we've scrolled past the header.
				$header.scrollex({
					bottom: '5vh',
					enter: function() {
						$navPanelToggle.removeClass('alt');
					},
					leave: function() {
						$navPanelToggle.addClass('alt');
					}
				});

		// Panel.
			$navPanel = $(
				'<div id="navPanel">' +
					'<nav>' +
					'</nav>' +
					'<a href="#navPanel" class="close"></a>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'right',
					target: $body,
					visibleClass: 'is-navPanel-visible'
				});

			// Get inner.
				$navPanelInner = $navPanel.children('nav');

			// Move nav content on breakpoint change.
				var $navContent = $nav.children();

				breakpoints.on('>medium', function() {

					// NavPanel -> Nav.
						$navContent.appendTo($nav);

					// Flip icon classes.
						$nav.find('.icons, .icon')
							.removeClass('alt');

				});

				breakpoints.on('<=medium', function() {

					// Nav -> NavPanel.
						$navContent.appendTo($navPanelInner);

					// Flip icon classes.
						$navPanelInner.find('.icons, .icon')
							.addClass('alt');

				});

			// Hack: Disable transitions on WP.
				if (browser.os == 'wp'
				&&	browser.osVersion < 10)
					$navPanel
						.css('transition', 'none');

	// Intro.
		var $intro = $('#intro');

		if ($intro.length > 0) {

			// Hack: Fix flex min-height on IE.
				if (browser.name == 'ie') {
					$window.on('resize.ie-intro-fix', function() {

						var h = $intro.height();

						if (h > $window.height())
							$intro.css('height', 'auto');
						else
							$intro.css('height', h);

					}).trigger('resize.ie-intro-fix');
				}

			// Hide intro on scroll (> small).
				breakpoints.on('>small', function() {

					$main.unscrollex();

					$main.scrollex({
						mode: 'bottom',
						top: '25vh',
						bottom: '-50vh',
						enter: function() {
							$intro.addClass('hidden');
						},
						leave: function() {
							$intro.removeClass('hidden');
						}
					});

				});

			// Hide intro on scroll (<= small).
				breakpoints.on('<=small', function() {

					$main.unscrollex();

					$main.scrollex({
						mode: 'middle',
						top: '15vh',
						bottom: '-15vh',
						enter: function() {
							$intro.addClass('hidden');
						},
						leave: function() {
							$intro.removeClass('hidden');
						}
					});

			});

		}

	// PROJECT CATEGORY FILTERING LOGIC
	function showCategory(categoryId) {
		// Hide all project sections
		$main.find('.posts').hide();

		if (categoryId === '#all-projects') {
			// Show all project sections
			$main.find('.posts').show();
		} else {
			// Show only the selected section
			$(categoryId).show();
		}


		// Update active class for desktop nav
		$('#nav .links a').removeClass('active');
		// Find the link whose href matches the categoryId and add active class
		$('#nav .links a[href="' + categoryId + '"]').addClass('active');

		// For mobile panel, update active class
		$navPanelInner.find('a').removeClass('active');
		$navPanelInner.find('a[href="' + categoryId + '"]').addClass('active');
	}

	// Event listener for category navigation links (desktop)
	$('#nav .links a').on('click', function(e) {
		var href = $(this).attr('href');

		// Only apply this logic to internal category links
		if (href.startsWith('#') && href !== '#header') { // Exclude the "Continue" arrow link
			e.preventDefault(); // Prevent default anchor jump

			showCategory(href);

			// Update URL hash without causing a page reload
			history.pushState(null, null, href);

			// Ensure the main content is visible if intro is hidden
			if ($intro.hasClass('hidden') || href === '#all-projects') { // Scroll to projects even if intro is visible for "All Projects"
				$('html, body').animate({
					scrollTop: $main.offset().top - ($header.outerHeight() || 0) // Scroll to main, considering header height
				}, 500);
			}
		}
	});

	// Event listener for category navigation links (mobile - within navPanel)
	// This targets the dynamically moved links within the #navPanel
	// We need to use event delegation because the links are moved by breakpoints.js
	$body.on('click', '#navPanel nav a', function(e) {
		var href = $(this).attr('href');

		if (href.startsWith('#') && href !== '#navPanel') { // Exclude the close button link
			e.preventDefault(); // Prevent default anchor jump

			showCategory(href);

			// Close the mobile nav panel
			$body.removeClass('is-navPanel-visible');

			// Update URL hash without causing a page reload
			history.pushState(null, null, href);

			// Scroll to the top of the main section
			$('html, body').animate({
				scrollTop: $main.offset().top - ($header.outerHeight() || 0) // Scroll to main, considering header height
			}, 500);
		}
	});


	// Initial Project Display Logic on page load
	$window.on('load', function() {
		// First, handle the intro section's visibility if it exists
		if ($intro.length > 0) {
			// If there's an intro, only show projects after scrolling past it
			// For now, let's keep it simple and show the default category immediately,
			// but we'll manage scrolling later.
		}

		// Check if a specific category or "all-projects" is in the URL hash
		var initialHash = window.location.hash;
		if (initialHash === '#all-projects') {
			showCategory('#all-projects');
		} else if (initialHash && $(initialHash).length && $(initialHash).hasClass('posts')) {
			showCategory(initialHash); // Show the section specified in the URL hash
		} else {
			// If no hash, or hash doesn't match a section, default to All Projects
			showCategory('#all-projects');
		}

		// Ensure that if intro is visible, we don't immediately scroll to projects.
		// The `scrolly` script handles the "Continue" arrow.
	});

})(jQuery);
