// BigPicture.js | license MIT | henrygd.me/bigpicture
(function() {
	var // assign window object to variable
		global = window,
		// trigger element used to open popup
		el,
		// set to true after first interaction
		initialized,
		// container element holding html needed for script
		container,
		// currently active display element (image, video, youtube / vimeo iframe container)
		displayElement,
		// popup image element
		displayImage,
		// popup video element
		displayVideo,
		// popup audio element
		displayAudio,
		// container element to hold youtube / vimeo iframe
		iframeContainer,
		// iframe to hold youtube / vimeo player
		iframeSiteVid,
		// store requested image source
		imgSrc,
		// button that closes the container
		closeButton,
		// youtube / vimeo video id
		siteVidID,
		// keeps track of loading icon display state
		isLoading,
		// timeout to check video status while loading
		checkMediaTimeout,
		// loading icon element
		loadingIcon,
		// caption element
		caption,
		// caption content element
		captionText,
		// store caption content
		captionContent,
		// hide caption button element
		captionHideButton,
		// open state for container element
		isOpen,
		// gallery open state
		galleryOpen,
		// used during close animation to avoid triggering timeout twice
		isClosing,
		// array of prev viewed image urls to check if cached before showing loading icon
		imgCache = [],
		// store whether image requested is remote or local
		remoteImage,
		// store animation opening callbacks
		animationStart,
		animationEnd,
		// gallery left / right icons
		rightArrowBtn,
		leftArrowBtn,
		// position of gallery
		galleryPosition,
		// hold active gallery els / image src
		galleryEls,
		// counter element
		galleryCounter,
		// store images in gallery that are being loaded
		preloadedImages = {},
		// whether device supports touch events
		supportsTouch,
		// options object
		opts,
		// Save bytes in the minified version
		doc = document,
		appendEl = 'appendChild',
		createEl = 'createElement',
		removeEl = 'removeChild',
		htmlInner = 'innerHTML',
		pointerEventsAuto = 'pointer-events:auto',
		cHeight = 'clientHeight',
		cWidth = 'clientWidth',
		listenFor = 'addEventListener',
		timeout = global.setTimeout,
		clearTimeout = global.clearTimeout

	global.BigPicture = function(options) {
		// initialize called on initial open to create elements / style / event handlers
		initialized || initialize()

		// clear currently loading stuff
		if (isLoading) {
			clearTimeout(checkMediaTimeout)
			removeContainer()
		}

		opts = options

		// store video id if youtube / vimeo video is requested
		siteVidID = options.ytSrc || options.vimeoSrc

		// store optional callbacks
		animationStart = options.animationStart
		animationEnd = options.animationEnd
		
		// set trigger element
		el = options.el

		// wipe existing remoteImage state
		remoteImage = false

		// set caption if provided
		captionContent = el.getAttribute('data-caption')

		if (options.gallery) {
			makeGallery(options.gallery)
		} else if (siteVidID) {
			// if vimeo or youtube video
			toggleLoadingIcon(true)
			displayElement = iframeContainer
			createIframe(!!options.ytSrc)
		} else if (options.imgSrc) {
			// if remote image
			remoteImage = true
			imgSrc = options.imgSrc
			!~imgCache.indexOf(imgSrc) && toggleLoadingIcon(true)
			displayElement = displayImage
			displayElement.src = imgSrc
		} else if (options.audio) {
			// if direct video link
			toggleLoadingIcon(true)
			displayElement = displayAudio
			displayElement.src = options.audio
			checkMedia('audio file')
		} else if (options.vidSrc) {
			// if direct video link
			toggleLoadingIcon(true)
			makeVidSrc(options.vidSrc)
			checkMedia('video')
		} else {
			// local image / background image already loaded on page
			displayElement = displayImage
			// get img source or element background image
			displayElement.src =
				el.tagName === 'IMG'
					? el.src
					: global
						.getComputedStyle(el)
						.backgroundImage.replace(/^url|[(|)|'|"]/g, '')
		}

		// add container to page
		container[appendEl](displayElement)
		doc.body[appendEl](container)
	}

	// create all needed methods / store dom elements on first use
	function initialize() {
		var startX
		// return close button elements
		function createCloseButton() {
			var el = doc[createEl]('button')
			el.className = 'bp-x'
			el[htmlInner] = '&#215;'
			return el
		}

		function createArrowSymbol(direction, style) {
			var el = doc[createEl]('button')
			el.className = 'bp-lr'
			el[htmlInner] =
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 129 129" height="75" fill="#fff"><path d="M88.6 121.3c.8.8 1.8 1.2 2.9 1.2s2.1-.4 2.9-1.2a4.1 4.1 0 0 0 0-5.8l-51-51 51-51a4.1 4.1 0 0 0-5.8-5.8l-54 53.9a4.1 4.1 0 0 0 0 5.8l54 53.9z"/></svg>'
			changeCSS(el, style)
			el.onclick = function(e) {
				e.stopPropagation()
				updateGallery(direction)
			}
			return el
		}

		// add style - if you want to tweak, run through beautifier
		var style = doc[createEl]('STYLE')
		style[htmlInner] =
			'.bp-lr,.bp-x:active{outline:0}#bp_caption,#bp_container{bottom:0;left:0;right:0;position:fixed;opacity:0}#bp_container>*,#bp_loader,.bp-x{position:absolute;right:0;z-index:10}#bp_container{top:0;z-index:9999;background:rgba(0,0,0,.7);opacity:0;pointer-events:none;transition:opacity .35s}#bp_loader{top:0;left:0;bottom:0;display:flex;margin:0;cursor:wait;z-index:9;background:transparent}#bp_count,.bp-lr,.bp-x{cursor:pointer;color:#fff}#bp_loader svg{width:50%;max-width:300px;max-height:50%;margin:auto;animation:bpturn 1s infinite linear}#bp_container img,#bp_sv,#bp_aud,#bp_vid{user-select:none;max-height:96%;max-width:96%;top:0;bottom:0;left:0;margin:auto;box-shadow:0 0 3em rgba(0,0,0,.4);z-index:-1}#bp_sv{height:0;padding-bottom:54%;background-color:#000;width:96%}@media (min-aspect-ratio:9/5){#bp_sv{height:98%;width:170.6vh;padding:0}}#bp_caption{pointer-events:none;font-size:.9em;padding:1.3em;background:rgba(15,15,15,.94);color:#fff;text-align:center;transition:opacity .3s}#bp_count,.bp-x{top:0;opacity:.8;font-size:3em;padding:0 .3em;background:0 0;border:0;text-shadow:0 0 2px rgba(0,0,0,.6)}#bp_caption .bp-x{left:2%;top:auto;right:auto;bottom:100%;padding:0 .6em;background:#d74040;border-radius:2px 2px 0 0;font-size:2.3em;text-shadow:none}.bp-x:focus,.bp-x:hover{opacity:1}#bp_aud{width:650px;top:calc(50% - 20px);bottom:auto;box-shadow:none}.bp-lr{top:50%;top:calc(50% - 138px);padding:99px 0;width:6%;background:0 0;border:0;opacity:.4;transition:opacity .1s}.bp-lr:focus,.bp-lr:hover{opacity:.8}@media (max-width:600px){.bp-lr{font-size:15vw}}#bp_count{left:0;display:table;padding:14px;color:#fff;font-size:22px;opacity:.7;cursor:default;right:auto}@keyframes bpf{50%{transform:translatex(15px)}100%{transform:none}}@keyframes bpl{50%{transform:translatex(-15px)}100%{transform:none}}@keyframes bpfl{0%{opacity:0;transform:translatex(70px)}100%{opacity:1;transform:none}}@keyframes bpfr{0%{opacity:0;transform:translatex(-70px)}100%{opacity:1;transform:none}}@keyframes bpfol{0%{opacity:1;transform:none}100%{opacity:0;transform:translatex(-70px)}}@keyframes bpfor{0%{opacity:1;transform:none}100%{opacity:0;transform:translatex(70px)}}@keyframes bpturn{0%{transform:none}100%{transform:rotate(360deg)}}'
		doc.head[appendEl](style)

		// create container element
		container = doc[createEl]('DIV')
		container.id = 'bp_container'
		container.onclick = close
		closeButton = createCloseButton()
		container[appendEl](closeButton)
		// gallery swipe listeners
		if ('ontouchstart' in global) {
			supportsTouch = true
			container.ontouchstart = function(e) {
				startX = e.changedTouches[0].pageX
			}
			container.ontouchmove = function(e) {
				e.preventDefault()
			}
			container.ontouchend = function(e) {
				if (!galleryOpen) {
					return
				}
				var touchobj = e.changedTouches[0]
				var distX = touchobj.pageX - startX
				// swipe right
				distX < -30 && updateGallery(1)
				// swipe left
				distX > 30 && updateGallery(-1)
			}
		}

		// create display image element
		displayImage = doc[createEl]('IMG')

		// create display video element
		displayVideo = doc[createEl]('VIDEO')
		displayVideo.id = 'bp_vid'
		displayVideo.setAttribute('playsinline', true)
		displayVideo.controls = true
		displayVideo.loop = true

		// create audio element
		displayAudio = doc[createEl]("audio")
		displayAudio.id = "bp_aud"
		displayAudio.controls = true
		displayAudio.loop = true

		// create gallery counter
		galleryCounter = doc[createEl]('span')
		galleryCounter.id = 'bp_count'

		// create caption elements
		caption = doc[createEl]('DIV')
		caption.id = 'bp_caption'
		captionHideButton = createCloseButton()
		captionHideButton.onclick = toggleCaption.bind(null, false)
		caption[appendEl](captionHideButton)
		captionText = doc[createEl]('SPAN')
		caption[appendEl](captionText)
		container[appendEl](caption)

		// left / right arrow icons
		rightArrowBtn = createArrowSymbol(1, 'transform:scalex(-1)')
		leftArrowBtn = createArrowSymbol(-1, 'left:0;right:auto')

		// create loading icon element
		loadingIcon = doc[createEl]('DIV')
		loadingIcon.id = 'bp_loader'
		loadingIcon[htmlInner] =
			'<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 32 32" fill="#fff" opacity=".8"><path d="M16 0a16 16 0 0 0 0 32 16 16 0 0 0 0-32m0 4a12 12 0 0 1 0 24 12 12 0 0 1 0-24" fill="#000" opacity=".5"/><path d="M16 0a16 16 0 0 1 16 16h-4A12 12 0 0 0 16 4z"/></svg>'
		// create youtube / vimeo container
		iframeContainer = doc[createEl]('DIV')
		iframeContainer.id = 'bp_sv'

		// create iframe to hold youtube / vimeo player
		iframeSiteVid = doc[createEl]('IFRAME')
		iframeSiteVid.allowFullscreen = true
		iframeSiteVid.onload = open
		changeCSS(iframeSiteVid, 'border:0;position:absolute;height:100%;width:100%;left:0;top:0')
		iframeContainer[appendEl](iframeSiteVid)

		// display image bindings for image load and error
		displayImage.onload = open
		displayImage.onerror = open.bind(null, 'image')

		// adjust loader position on window resize
		global[listenFor]('resize', function() {
			galleryOpen || (isLoading && toggleLoadingIcon(true))
		})

		// close container on escape key press and arrow buttons for gallery
		doc[listenFor]('keyup', function(e) {
			var key = e.keyCode
			key === 27 && isOpen && close(container)
			if (galleryOpen) {
				key === 39 && updateGallery(1)
				key === 37 && updateGallery(-1)
				key === 38 && updateGallery(10)
				key === 40 && updateGallery(-10)
			}
		})
		// prevent scrolling with arrow keys if gallery open
		doc[listenFor]('keydown', function(e) {
			var usedKeys = [37, 38, 39, 40]
			if (galleryOpen && ~usedKeys.indexOf(e.keyCode)) {
				e.preventDefault()
			}
		})

		// trap focus within conainer while open
		doc[listenFor](
			'focus',
			function(e) {
				if (isOpen && !container.contains(e.target)) {
					e.stopPropagation()
					closeButton.focus()
				}
			},
			true
		)

		// all done
		initialized = true
	}

	// return transform style to make full size display el match trigger el size
	function getRect() {
		var rect = el.getBoundingClientRect()
		var leftOffset = rect.left - (container[cWidth] - rect.width) / 2
		var centerTop = rect.top - (container[cHeight] - rect.height) / 2
		var scaleWidth = el[cWidth] / displayElement[cWidth]
		var scaleHeight = el[cHeight] / displayElement[cHeight]
		return 'transform:translate3D(' +
			leftOffset +
			'px, ' +
			centerTop +
			'px, 0) scale3D(' +
			scaleWidth +
			', ' +
			scaleHeight +
			', 0)'
	}

	function makeVidSrc(source) {
		if (Array.isArray(source)) {
			displayElement = displayVideo.cloneNode()
			source.forEach(function(src) {
				var source = doc[createEl]('SOURCE')
				source.src = src
				source.type = 'video/' + src.match(/.(\w+)$/)[1]
				displayElement[appendEl](source)
			})
		} else {
			displayElement = displayVideo
			displayElement.src = source
		}
	}

	function makeGallery(gallery) {
		if (Array.isArray(gallery)) {
			// is array of images
			galleryPosition = 0
			galleryEls = gallery
			captionContent = gallery[0].caption
		} else {
			// is element selector or nodelist
			galleryEls = [].slice.call(typeof gallery === 'string' ? doc.querySelectorAll(gallery + ' [data-bp]') : gallery)
			// find initial gallery position
			var elIndex = galleryEls.indexOf(el)
			galleryPosition = elIndex !== -1 ? elIndex : 0
			// make gallery object w/ els / src / caption
			galleryEls = galleryEls.map(function(el) {
				return {
					el: el,
					src: el.getAttribute('data-bp'),
					caption: el.getAttribute('data-caption')
				}
			})
		}
		// show loading icon if needed
		remoteImage = true
		// set initial src to imgSrc so it will be cached in open func
		imgSrc = galleryEls[galleryPosition].src
		!~imgCache.indexOf(imgSrc) && toggleLoadingIcon(true)
		if (galleryEls.length > 1) {
			// if length is greater than one, add gallery stuff
			container[appendEl](galleryCounter)
			galleryCounter[htmlInner] = galleryPosition + 1 + '/' + galleryEls.length
			if (!supportsTouch) {
				// add arrows if device doesn't support touch
				container[appendEl](rightArrowBtn)
				container[appendEl](leftArrowBtn)
			}
		} else {
			// gallery is one, just show without clutter
			galleryEls = false
		}
		displayElement = displayImage
		// set initial image src
		displayElement.src = imgSrc
	}

	function updateGallery(movement) {
		var galleryLength = galleryEls.length - 1
		var isEnd

		// only allow one change at a time
		if (isLoading) {
			return
		}

		// return if requesting out of range image
		if (movement > 0) {
			if (galleryPosition === galleryLength) {
				isEnd = true
			}
		} else if (galleryPosition === 0) {
			isEnd = true
		}
		if (isEnd) {
			// if beginning or end of gallery, run end animation
			changeCSS(displayImage, '')
			timeout(changeCSS, 9, displayImage, 'animation:' + (movement > 0 ? 'bpl' : 'bpf') + ' .3s;transition:transform .35s')
			return
		}

		// normalize position
		galleryPosition = Math.max(
			0,
			Math.min(galleryPosition + movement, galleryLength)
		)

		// load images before and after for quicker scrolling through pictures
		;[galleryPosition - 1, galleryPosition, galleryPosition + 1].forEach(
			function(position) {
				// normalize position
				position = Math.max(0, Math.min(position, galleryLength))
				// cancel if image has already been preloaded
				if (preloadedImages[position]) return
				var src = galleryEls[position].src
				// create image for preloadedImages
				var img = doc[createEl]('IMG')
				img[listenFor]('load', addToImgCache.bind(null, src))
				img.src = src
				preloadedImages[position] = img
			}
		)
		// if image is loaded, show it
		if (preloadedImages[galleryPosition].complete) {
			return changeGalleryImage(movement)
		}
		// if not, show loading icon and change when loaded
		isLoading = true
		changeCSS(loadingIcon, 'opacity:.4;')
		container[appendEl](loadingIcon)
		preloadedImages[galleryPosition].onload = function() {
			galleryOpen && changeGalleryImage(movement)
		}
		// if error, store error object in el array
		preloadedImages[galleryPosition].onerror = function() {
			galleryEls[galleryPosition] = {
				error: 'Error loading image'
			}
			galleryOpen && changeGalleryImage(movement)
		}
	}

	function changeGalleryImage(movement) {
		if (isLoading) {
			container[removeEl](loadingIcon)
			isLoading = false
		}
		var activeEl = galleryEls[galleryPosition]
		if (activeEl.error) {
			// show alert if error
			alert(activeEl.error)
		} else {
			// add new image, animate images in and out w/ css animation
			var oldimg = container.querySelector('img:last-of-type')
			displayImage = displayElement = preloadedImages[galleryPosition]
			changeCSS(displayImage, 'animation:' + (movement > 0 ? 'bpfl' : 'bpfr') + ' .35s;transition:transform .35s')
			changeCSS(oldimg, 'animation:' + (movement > 0 ? 'bpfol' : 'bpfor') + ' .35s both')
			container[appendEl](displayImage)
			// update el for closing animation
			if (activeEl.el) {
				el = activeEl.el
			}
		}
		// update counter
		galleryCounter[htmlInner] = galleryPosition + 1 + '/' + galleryEls.length
		// show / hide caption
		toggleCaption(galleryEls[galleryPosition].caption)
	}

	// create youtube / vimeo video iframe
	function createIframe(isYoutube) {
		// create appropriate url for youtube or vimeo
		var url = isYoutube
			? 'www.youtube.com/embed/' +
				siteVidID +
				'?html5=1&rel=0&playsinline=1&'
			: 'player.vimeo.com/video/' + siteVidID + '?'

		// set iframe src to url
		iframeSiteVid.src = 'https://' + url + 'autoplay=1'
	}

	// timeout to check video status while loading
	function checkMedia(errMsg) {
		if (~[1, 4].indexOf(displayElement.readyState)) {
			open()
			// short timeout to to make sure controls show in safari 11
			timeout(function(){
				displayElement.play()
			}, 99)
		}
		else if (displayElement.error) open(errMsg)
		else checkMediaTimeout = timeout(checkMedia, 35, errMsg)
	}

	// hide / show loading icon
	function toggleLoadingIcon(bool) {
		// don't show loading icon if noLoader is specified
		if (opts.noLoader) return
		// bool is true if we want to show icon, false if we want to remove
		// change style to match trigger element dimensions if we want to show
		bool &&
			changeCSS(
				loadingIcon,
				'top:' +
					el.offsetTop +
					'px;left:' +
					el.offsetLeft +
					'px;height:' +
					el[cHeight] +
					'px;width:' +
					el[cWidth] +
					'px'
			)
		// add or remove loader from DOM
		el.parentElement[bool ? appendEl : removeEl](loadingIcon)
		isLoading = bool
	}

	// hide & show caption
	function toggleCaption(captionContent) {
		if (captionContent) {
			captionText[htmlInner] = captionContent
		}
		changeCSS(
			caption,
			'opacity:' + (captionContent ? '1;' + pointerEventsAuto : '0')
		)
	}

	function addToImgCache(url) {
		!~imgCache.indexOf(url) && imgCache.push(url)
	}

	// animate open of image / video; display caption if needed
	function open(err) {
		// hide loading spinner
		isLoading && toggleLoadingIcon()

		// execute animationStart callback
		animationStart && animationStart()

		// check if we have an error string instead of normal event
		if (typeof err === 'string') {
			removeContainer()
			return opts.onError ? opts.onError() : alert('Error: The requested ' + err + ' could not be loaded.')
		}

		// if remote image is loaded, add url to imgCache array
		remoteImage && addToImgCache(imgSrc)

		// transform displayEl to match trigger el
		changeCSS(displayElement, getRect())

		// fade in container
		changeCSS(container, 'opacity:1;' + pointerEventsAuto)

		// set animationEnd callback to run after animation ends (cleared if container closed)
		animationEnd = timeout(animationEnd, 410)

		isOpen = true

		galleryOpen = !!galleryEls

		// enlarge displayEl, fade in caption if hasCaption
		timeout(function() {
			changeCSS(displayElement, 'transition:transform .35s;transform:none')
			captionContent && timeout(toggleCaption, 250, captionContent)
		}, 60)
	}

	// close active display element
	function close(e) {
		var target = e.target
		var clickEls = [
			caption,
			captionHideButton,
			displayVideo,
			displayAudio,
			captionText,
			leftArrowBtn,
			rightArrowBtn,
			loadingIcon
		]

		// blur to hide close button focus style
		target && target.blur()

		// don't close if one of the clickEls was clicked or container is already closing
		if (isClosing || ~clickEls.indexOf(target)) {
			return
		}

		// animate closing
		displayElement.style.cssText += getRect()
		changeCSS(container, pointerEventsAuto)

		// timeout to remove els from dom; use variable to avoid calling more than once
		timeout(removeContainer, 350)

		// clear animationEnd timeout
		clearTimeout(animationEnd)

		isOpen = false
		isClosing = true
	}

	// remove container / display element from the DOM
	function removeContainer() {
		// remove container from DOM & clear inline style
		doc.body[removeEl](container)
		container[removeEl](displayElement)
		changeCSS(container, '')

		// clear src of displayElement (or iframe if display el is iframe container)
		;(displayElement === iframeContainer
			? iframeSiteVid
			: displayElement
		).removeAttribute('src')

		// remove caption
		toggleCaption(false)

		if (galleryOpen) {
			// remove all gallery stuff
			var images = container.querySelectorAll('img')
			for (var i = 0; i < images.length; i++) {
				container[removeEl](images[i])
			}
			isLoading && container[removeEl](loadingIcon)
			container[removeEl](galleryCounter)
			galleryOpen = galleryEls = false
			preloadedImages = {}
			supportsTouch || container[removeEl](rightArrowBtn)
			supportsTouch || container[removeEl](leftArrowBtn)
			// in case displayimage changed, we need to update event listeners
			displayImage.onload = open
			displayImage.onerror = open.bind(null, 'image')
		}

		// run close callback
		opts.onClose && opts.onClose()

		isClosing = isLoading = false
	}

	// style helper functions
	function changeCSS(element, newStyle) {
		element.style.cssText = newStyle
	}
})()
