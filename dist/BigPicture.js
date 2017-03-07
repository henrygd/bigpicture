// BigPicture.js | license MIT | henrygd.me/bigpicture
(function() {
  var
    // assign window object to variable
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
    checkVidTimeout,
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
    // used during close animation to avoid triggering timeout twice
    isClosing,
    // array of prev viewed image urls to check if cached before showing loading icon
    imgCache,
    // store whether remote image is already cached on request
    cached,
    // store whether image requested is remote or local
    remoteImage,
    // store animation opening callbacks
    animationStart,
    animationEnd,
    // set to true if user wants to hide loading icon
    noLoader,
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
    clearTimeout = global.clearTimeout;


  global.BigPicture = function(options) {
    // initialize called on initial open to create elements / style / event handlers
    initialized || initialize();

    // clear currently loading stuff
    if (isLoading) {
      clearTimeout(checkVidTimeout);
      removeContainer();
    }

    // store video id if youtube / vimeo video is requested
    siteVidID = options.ytSrc || options.vimeoSrc;

    // store optional callbacks
    animationStart = options.animationStart;
    animationEnd = options.animationEnd;

    // store whether user requests to hide loading icon
    noLoader = options.noLoader;

    // set trigger element
    el = options.el;

    // wipe existing remoteImage state
    remoteImage = false;

    // set caption if provided
    captionContent = el.getAttribute('caption');
    if (captionContent) {
      captionText[htmlInner] = captionContent;
      container[appendEl](caption);
    }

    // if vimeo or youtube video
    if (siteVidID) {
      toggleLoadingIcon(true);
      displayElement = iframeContainer;
      createIframe(!!options.ytSrc);
    }
    // if remote image
    else if (options.imgSrc) {
      remoteImage = true;
      imgSrc = options.imgSrc;
      cached = ~imgCache.indexOf(imgSrc);
      !cached && toggleLoadingIcon(true);
      displayElement = displayImage;
      displayElement.src = imgSrc;
    }
    // if direct video link
    else if (options.vidSrc) {
      toggleLoadingIcon(true);
      displayElement = displayVideo;
      displayElement.src = options.vidSrc;
      checkVid();
    }
    // local image / background image already loaded on page
    else {
      displayElement = displayImage;
      // get img source or element background image
      displayElement.src = el.tagName === 'IMG' ? el.src :
        global.getComputedStyle(el).backgroundImage.replace(/^url|[\(|\)|'|"]/g, '');
    }

    // add container to page
    container[appendEl](displayElement);
    doc.body[appendEl](container);
  };


  // create all needed methods / store dom elements on first use
  function initialize() {

    // return close button elements
    function createCloseButton() {
      var el = doc[createEl]('button');
      el.className = 'bp-x';
      el[htmlInner] = '&#215;'
      return el;
    }

    // imgCache holds displayed image urls to prevent loader on cached images
    imgCache = [];

    // add style
    // if you want to tweak, grab from doc head & run through beautifier
    var style = doc[createEl]('STYLE');
    style[htmlInner] = '#bp_caption,#bp_container{bottom:0;left:0;right:0;position:fixed;opacity:0}#bp_container>*,.bp-x,#bp_loader{position:absolute;right:0}#bp_container{top:0;z-index:9999;background:rgba(0,0,0,.7);opacity:0;pointer-events:none;transition:opacity .35s}#bp_loader{top:0;left:0;bottom:0;display:-webkit-flex;display:flex;margin:0;cursor:wait;z-index:9}#bp_loader svg{width:40%;max-height:40%;margin:auto;' + webkitify('animation:', 'ldr .7s infinite linear;') + '}' + webkitifyKeyframes('keyframes ldr{to{' + webkitify('transform:', 'rotate(1turn);') + '}}') + '#bp_container img,#bp_sv,#bp_vid{max-height:96%;max-width:96%;top:0;bottom:0;left:0;margin:auto;box-shadow:0 0 3em rgba(0,0,0,.4);z-index:-1}#bp_sv{width:171vh}#bp_caption{font-size:.9em;padding:1.3em;background:rgba(15,15,15,.94);color:#fff;text-align:center;transition:opacity .3s}.bp-x{font-family:Arial;top:0;cursor:pointer;opacity:.8;font-size:3em;padding:0 .3em;color:#fff;background:transparent;border:0;text-shadow:0 0 2px #000}#bp_caption .bp-x{left:2%;top:auto;right:auto;bottom:100%;padding:0 .6em;background:#d74040;border-radius:2px 2px 0 0;font-size:2.3em;text-shadow:none}.bp-x:hover,.bp-x:focus{opacity:1}.bp-x:active{outline:0}@media (max-aspect-ratio:9/5){#bp_sv{height:53vw}}';
    doc.head[appendEl](style);

    // create container element
    container =  doc[createEl]('DIV');
    container.id = 'bp_container';
    container.onclick = close;
    closeButton = createCloseButton();
    container[appendEl](closeButton);

    // create display image element
    displayImage = doc[createEl]('IMG');

    // create display video element
    displayVideo = doc[createEl]('VIDEO');
    displayVideo.id = 'bp_vid';
    displayVideo.autoplay = true;
    displayVideo.controls = true;
    displayVideo.loop = true;

    // create caption elements
    caption = doc[createEl]('DIV');
    caption.id = 'bp_caption';
    captionHideButton = createCloseButton();
    captionHideButton.onclick = function() {
      changeCSS(caption, 'opacity:0');
      timeout(function() {
        captionContent = false;
        container[removeEl](caption);
      }, 300);
    }
    caption[appendEl](captionHideButton);
    captionText = doc[createEl]('SPAN');
    caption[appendEl](captionText);

    // create loading icon element
    loadingIcon = doc[createEl]('DIV');
    loadingIcon.id = 'bp_loader';
    loadingIcon[htmlInner] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 399 399"><path d="M341 58.5C303 20.8 253 0 199.6 0 146.4 0 96.2 20.8 58.5 58.5 20.8 96.2 0 146.5 0 199.7 0 253 20.8 303.2 58.5 341c37.7 37.6 88 58.4 141.2 58.4 53.3 0 103.5-20.8 141.2-58.5 37.6-37.8 58.4-88 58.4-141.3 0-53.3-20.8-103.5-58.5-141.2zm-13 12.8c34.3 34.3 53.2 80 53.2 128.4h-41c0-77.4-63-140.4-140.5-140.4-4.6 0-9 .2-13.6.7V18.7c4.6-.4 9-.5 13.7-.5 48.5 0 94 18.8 128.4 53zM199.8 322c-67.4 0-122.2-55-122.2-122.3S132.3 77.5 199.7 77.5 322 132.3 322 199.7 267 322 199.6 322z"/></svg>';

    // create youtube / vimeo container
    iframeContainer = doc[createEl]('DIV');
    iframeContainer.id = 'bp_sv';

    // create iframe to hold youtube / vimeo player
    iframeSiteVid = doc[createEl]('IFRAME');
    iframeSiteVid.allowFullscreen = true;
    iframeSiteVid.onload = open;
    changeCSS(iframeSiteVid, 'border:0px;height:100%;width:100%');
    iframeContainer[appendEl](iframeSiteVid);

    // display image bindings for image load and error
    displayImage.onload = open;
    displayImage.onerror = open.bind(null, 'image');

    // adjust loader position on window resize
    global[listenFor]('resize', function() {
      isLoading && toggleLoadingIcon(true);
    });

    // close container on escape key press
    doc[listenFor]('keyup', function(e) {
      e.keyCode === 27 && isOpen && close(container);
    });

    // trap focus within conainer while open
    doc[listenFor]('focus', function(e) {
      if (isOpen && !container.contains(e.target)) {
        e.stopPropagation();
        closeButton.focus();
      }
    }, true);

    // all done
    initialized = true;
  }


  // return transform style to make full size display el match trigger el size
  function getRect() {
    var rect = el.getBoundingClientRect();
    var leftOffset = rect.left - (container[cWidth] - rect.width) / 2;
    var centerTop = rect.top - (container[cHeight] - rect.height) / 2;
    var scaleWidth = el[cWidth] / displayElement[cWidth];
    var scaleHeight = el[cHeight] / displayElement[cHeight];
    return webkitify('transform:', 'translate3D(' + leftOffset + 'px, ' +
      centerTop + 'px, 0) scale3D(' + scaleWidth + ', ' + scaleHeight + ', 0);');
  }


  // create youtube / vimeo video iframe
  function createIframe(isYoutube) {
    // create appropriate url for youtube or vimeo
    var url = isYoutube ?
      'www.youtube.com/embed/' + siteVidID + '?enablejsapi=1&html5=1&rel=0&showinfo=0&' :
      'player.vimeo.com/video/' + siteVidID + '?';

    // set iframe src to url
    iframeSiteVid.src = 'https://' + url + 'autoplay=1';
  }

  // timeout to check video status while loading
  // onloadeddata event doesn't seem to fire in less up-to-date browsers like midori & epiphany
  function checkVid() {
    if (displayElement.readyState === 4)
      open();
    else if (displayVideo.error)
      open('video');
    else
      checkVidTimeout = timeout(checkVid, 35);
  }


// hide / show loading icon
  function toggleLoadingIcon(bool) {
    // don't show loading icon if noLoader is specified
    if (noLoader) return;
    // bool is true if we want to show icon, false if we want to remove
    // change style to match trigger element dimensions if we want to show
    bool && changeCSS(loadingIcon, 'top:' + el.offsetTop +
       'px;left:' + el.offsetLeft + 'px;height:' +
        el[cHeight] + 'px;width:' + el[cWidth] + 'px');
    // add or remove loader from DOM
    el.parentElement[bool ? appendEl : removeEl](loadingIcon);
    isLoading = bool;
  }


  // animate open of image / video; display caption if needed
  function open(err) {
    // hide loading spinner
    isLoading && toggleLoadingIcon();

    // execute animationStart callback
    animationStart && animationStart();

    // check if we have an error string instead of normal event
    if (typeof(err) === 'string') {
      removeContainer();
      return alert('Error: The requested ' + err + ' could not be displayed.');
    }

    // if remote image is loaded, add url to imgCache array
    (remoteImage && !cached) && imgCache.push(imgSrc);

    // transform displayEl to match trigger el
    changeCSS(displayElement, getRect());

    // fade in container
    changeCSS(container, 'opacity:1;' + pointerEventsAuto);

    // set animationEnd callback to run after animation ends (cleared if container closed)
    animationEnd = timeout(animationEnd, 410);

    isOpen = true;

    // enlarge displayEl, fade in caption if hasCaption
    timeout(function() {
      changeCSS(displayElement, webkitify('transition:', 'transform .35s;') + webkitify('transform:', 'none;'));
      captionContent && timeout(changeCSS.bind(null, caption, 'opacity:1'), 250);
    }, 60);
  }


  // close active display element
  function close(e) {
    var target = e.target;
    var clickEls = [caption, captionHideButton, displayVideo, captionText];

    // blur to hide close button focus style
    target && target.blur();

    // don't close if one of the clickEls was clicked or container is already closing
    if (isClosing || ~clickEls.indexOf(target)) {
      return;
    }

    // animate closing
    displayElement.style.cssText += getRect();
    changeCSS(container, pointerEventsAuto);

    // timeout to remove els from dom; use variable to avoid calling more than once
    timeout(removeContainer, 350);

    // clear animationEnd timeout
    clearTimeout(animationEnd);

    isOpen = false;
    isClosing = true;
  }


  // remove container / display element from the DOM
  function removeContainer() {
    // remove container from DOM & clear inline style
    doc.body[removeEl](container);
    container[removeEl](displayElement);
    changeCSS(container, '');

    // clear src of displayElement (or iframe if display el is iframe container)
    (displayElement === iframeContainer ? iframeSiteVid : displayElement)
      .removeAttribute('src');

    if (captionContent) {
      changeCSS(caption, '');
      container[removeEl](caption);
    }
    isClosing = false;
  }


  // style helper functions
  function changeCSS(element, newStyle) {
    element.style.cssText = newStyle;
  }
  function webkitify(prop, val) {
    var webkit = '-webkit-';
    var propVal = prop + val;
    return webkit + propVal + prop + webkit + val + propVal;
  }
  function webkitifyKeyframes(css) {
    return '@-webkit-' + css + '@' + css;
  }

})();
