// BigPicture.js | license MIT | henrygd.me/bigpicture
module.exports = (function() {
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
    displaySiteVid,
    // iframe to hold youtube / vimeo player
    iframeSiteVid,
    // store requested image source
    imgSrc,
    // youtube / vimeo video id
    siteVidID,
    // keeps track of loading icon display state
    isLoading,
    // loading icon element
    loadingIcon,
    // caption element
    caption,
    // store caption display state
    captionDisplayed,
    // caption text content
    captionText,
    // timeout to check video status while loading
    checkVidTimeout,
    // used during close animation to avoid triggering timeout twice
    isClosing,
    // array of prev viewed image urls to check if cached before showing loading icon
    imgCache,
    // store whether remote image is already cached on request
    cached,
    // store whether image requested is remote or local
    remoteImage,
    // stores function for vimeo onReady playback
    vimeoOnReady,
    // youtube player object
    ytPlayer,
    // holds caption shown state
    hasCaption,
    // Save bytes in the minified version
    doc = document,
    appendEl = 'appendChild',
    createEl = 'createElement',
    removeEl = 'removeChild',
    htmlInner = 'innerHTML',
    listenFor ='addEventListener',
    youtubeReady = 'onYouTubeIframeAPIReady',
    getBoundingRect = 'getBoundingClientRect',
    pointerEventsAuto = 'pointer-events:auto',
    cHeight = 'clientHeight',
    cWidth = 'clientWidth',
    wipeTimeout = global.clearTimeout,
    timeout = global.setTimeout;


  var BigPicture = function(opts) {
    // store video id if youtube / vimeo video is requested
    var siteVid = opts.ytSrc || opts.vimeoSrc;

    // called on initial open to create elements / style / add event handlers
    if (!initialized) initialize();

    // clear currently loading stuff
    if (isLoading) {
      wipeTimeout(checkVidTimeout);
      removeContainer();
    }

    // set trigger element
    el = opts.el;

    // wipe existing remoteImage state
    remoteImage = false;

    // set caption if provided
    hasCaption = el.hasAttribute('caption');
    if (hasCaption) {
      captionText[htmlInner] = el.attributes.caption.value;
      container[appendEl](caption);
      captionDisplayed = true;
    }

    // if vimeo or youtube video
    if (siteVid) {
      siteVidID = siteVid;
      displayElement = displaySiteVid;
      appendContainer();
      getSiteVid(!!opts.ytSrc);
    }

    // if remote image
    else if (opts.imgSrc) {
      remoteImage = true;
      imgSrc = opts.imgSrc;
      cached = ~imgCache.indexOf(imgSrc);
      if (!cached) {
        showLoadingIcon();
      }
      displayElement = displayImage;
      displayElement.src = imgSrc;
      appendContainer();
    }

    // if direct video link
    else if (opts.vidSrc) {
      showLoadingIcon();
      displayElement = displayVideo;
      displayElement.src = opts.vidSrc;
      appendContainer();
      checkVid();
    }

    // local image / background image already loaded on page
    else {
      displayElement = displayImage;
      // get img source or element background image
      displayElement.src = el.tagName === 'IMG' ? el.src :
        el.style.backgroundImage.replace(/^url|[\(|\)|'|"]/g, '');
      appendContainer();
    }
  };


  // create all needed methods / store dom elements on first use
  function initialize() {
    // imgCache holds displayed image urls to prevent loader on cached images
    imgCache = [];

    // add style
    var style = doc[createEl]('STYLE');
    style[htmlInner] = '#bp_caption,#bp_vid,#bp_container iframe{will-change:opacity, transform}#bp_caption,#bp_container{bottom:0;left:0;right:0;position:fixed;opacity:0}#bp_img,#bp_loader,#bp_sv,#bp_vid,.bp-x{position:absolute;right:0}#bp_container{top:0;z-index:9999;background:rgba(0, 0, 0, .7);opacity:0;pointer-events:none;transition:opacity .35s}#bp_loader{top:0;left:0;bottom:0;display:-webkit-flex;display:flex;margin:0;cursor:wait;z-index:9}#bp_loader svg{width:40%;max-height:40%;margin:auto;' + webkitify('animation:', 'ldr .7s infinite linear;') + '}' + webkitifyKeyframes('keyframes ldr{to{' + webkitify('transform:rotate(360deg);') + '}}') + '#bp_img,#bp_sv,#bp_vid{max-height:96%;max-width:96%;top:0;bottom:0;left:0;margin:auto;box-shadow:0 0 3em rgba(0, 0, 0, .4);z-index:-1}#bp_sv{width:171vh}#bp_caption{padding:1.2em 4%;font-size:.9em;background-color:rgba(9, 9, 9, .97);color:#eee;text-align:center;transition:opacity .3s}#bp_caption .bp-x{left:2%;top:auto;bottom:100%;height:2.2em;background-color:#d74040;opacity:.8;border-radius:2px 2px 0 0}.bp-x{top:0;cursor:pointer;height:3.5em;width:3.5em;opacity:.85;background:url(data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20357%20357%22%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M357%2035.7L321.3%200%20178.5%20142.8%2035.7%200%200%2035.7l142.8%20142.8L0%20321.3%2035.7%20357l142.8-142.8L321.3%20357l35.7-35.7-142.8-142.8%22%2F%3E%3C%2Fsvg%3E) center center no-repeat;background-size:1.2em}.bp-x:hover{opacity:1 !important}@media (max-aspect-ratio: 9/5){#bp_sv{height:53vw}}';
    doc.head[appendEl](style);

    // create container element
    container =  doc[createEl]('DIV');
    container.id = 'bp_container';
    container[htmlInner] = '<div class="bp-x"></div>';

    // create display image element
    displayImage = doc[createEl]('IMG');
    displayImage.id = 'bp_img';

    // create display video element
    displayVideo = doc[createEl]('VIDEO');
    displayVideo.id = 'bp_vid';
    displayVideo.autoplay = true;
    displayVideo.controls = true;
    displayVideo.loop = true;

    // create caption elements
    caption = doc[createEl]('DIV');
    caption.id = 'bp_caption';
    caption[htmlInner] = '<div class="bp-x" id="bp_cap_x"></div>';
    captionText = doc[createEl]('SPAN');
    caption[appendEl](captionText);

    // create loading icon element
    loadingIcon = doc[createEl]('DIV');
    loadingIcon.id = 'bp_loader';
    loadingIcon[htmlInner] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 399 399"><path d="M341 58.5C303 20.8 253 0 199.6 0 146.4 0 96.2 20.8 58.5 58.5 20.8 96.2 0 146.5 0 199.7 0 253 20.8 303.2 58.5 341c37.7 37.6 88 58.4 141.2 58.4 53.3 0 103.5-20.8 141.2-58.5 37.6-37.8 58.4-88 58.4-141.3 0-53.3-20.8-103.5-58.5-141.2zm-13 12.8c34.3 34.3 53.2 80 53.2 128.4h-41c0-77.4-63-140.4-140.5-140.4-4.6 0-9 .2-13.6.7V18.7c4.6-.4 9-.5 13.7-.5 48.5 0 94 18.8 128.4 53zM199.8 322c-67.4 0-122.2-55-122.2-122.3S132.3 77.5 199.7 77.5 322 132.3 322 199.7 267 322 199.6 322z"/></svg>';

    // create youtube / vimeo container
    displaySiteVid = doc[createEl]('DIV');
    displaySiteVid.id = 'bp_sv';

    // create iframe to hold youtube / vimeo player
    iframeSiteVid = doc[createEl]('IFRAME');
    changeCSS(iframeSiteVid, 'border:0px;height:100%;width:100%');
    displaySiteVid[appendEl](iframeSiteVid);

    // click bindings for open / closing of image
    container.onclick = close;

    // display image bindings for image load and error
    displayImage.onload = open;
    displayImage.onerror = function(){
      open('image');
    };

    // resize binding to adjust loader position
    global[listenFor]('resize', function(){
      if (isLoading) showLoadingIcon();
    });

    // all done
    initialized = true;
  }


  // add the container / display element to the DOM before each open
  function appendContainer() {
    container[appendEl](displayElement);
    doc.body[appendEl](container);
  }

  // calculate size and position of initial element relative to full size media
  function getRect() {
    var rect = el[getBoundingRect]();
    var leftOffset = rect.left - (container[cWidth] / 2 - rect.width / 2);
    var centerTop = rect.top - (container[cHeight] / 2 - rect.height / 2);
    var scaleWidth = el[cWidth] / displayElement[cWidth];
    var scaleHeight = el[cHeight] / displayElement[cHeight];
    return 'translate3D(' + leftOffset + 'px, ' + centerTop +
      'px, 0) scale3D(' + scaleWidth + ', ' + scaleHeight + ', 0);';
  }


  // route to appropriate methods to load & play youtube / vimeo videos
  function getSiteVid(isYoutube) {
    // isYoutube === true if youtube, false if vimeo
    showLoadingIcon();
    if (isYoutube && !global[youtubeReady])
      youtubeInit();
    else if (!isYoutube && !vimeoOnReady)
      vimeoInit();
    else
      createIframe(isYoutube);
  }


  // load youtube's iframe player script on first youtube request
  function youtubeInit() {
    global[youtubeReady] = function() {
      createIframe(true);
    };
    var tag = doc[createEl]('script');
    tag.src = "https://www.youtube.com/iframe_api";
    doc.body[appendEl](tag);
  }


  // set ready function for vimeo on first vimeo request
  function vimeoInit() {
    vimeoOnReady = function(e) {
      if (/vimeo/.test(e.origin) && JSON.parse(e.data).event === 'ready'){
        open();
      }
    };
    global[listenFor]('message', vimeoOnReady);
    createIframe();
  }


  // create youtube / vimeo video iframe
  function createIframe(isYoutube) {
    // create appropriate url for youtube or vimeo
    var url = isYoutube ? 'www.youtube.com/embed/' + siteVidID + '?enablejsapi=1&html5=1&rel=0&showinfo=0&' :
      'player.vimeo.com/video/' + siteVidID + '?';

    // set iframe src to url
    iframeSiteVid.src = 'https://' + url + 'autoplay=1';

    // create youtube player if needed and doesn't yet exist
    if (isYoutube && !ytPlayer) {
      ytPlayer = new global.YT.Player(iframeSiteVid, {
        events: {
          onReady: open
        }
      });
    }
  }


  // timeout to continuously check video status while loading
  function checkVid() {
    if (displayElement.readyState === 4)
      open();
    else if (displayVideo.error)
      open('video');
    else
      checkVidTimeout = timeout(checkVid, 35);
  }


  // show loading icon on top of trigger element
  function showLoadingIcon() {
    // var rect = el[getBoundingRect]();
    isLoading = 1;
    changeCSS(loadingIcon, 'top:' + el.offsetTop +
     'px;left:' + el.offsetLeft + 'px;height:' +
      el[cHeight] + 'px;width:' + el[cWidth] + 'px');
    el.parentElement[appendEl](loadingIcon);
  }


  // animate open of image / video; display caption if needed
  function open(err) {
    // hide loading spinner
    if (isLoading) {
      isLoading = false;
      el.parentElement.removeChild(loadingIcon);
    };

    // check if we have an error string instead of normal event
    if (typeof(err) === 'string') {
      removeContainer();
      return alert('Error: The requested ' + err + ' could not be displayed.');
    }

    // if remote image is loaded, add url to imgCache array
    if (remoteImage && !cached) {
      imgCache.push(imgSrc);
    }

    // transform displayEl to match trigger el
    changeCSS(displayElement, webkitify('transform:', getRect()));

    // fade in container
    changeCSS(container, 'opacity:1;' + pointerEventsAuto);

    // enlarge displayEl, fade in caption if hasCaption
    timeout(function() {
      changeCSS(displayElement, webkitify('transition:', 'transform .35s;') + webkitify('transform:', 'none;'));
      if (hasCaption) {
        timeout(function() {
          changeCSS(caption, 'opacity:1');
        }, 250);
      }
    }, 60);
  }


  // hide caption
  function hideCaption() {
    changeCSS(caption, pointerEventsAuto);
    timeout(function(){
      container[removeEl](caption);
      captionDisplayed = false;
    }, 250);
  }


  // close active display element
  function close(e) {
    // do nothing if interaction is w/ caption
    var target = e.target;
    if (target.id === 'bp_cap_x')
      return hideCaption();
    if (target === caption || /SPAN|VIDEO/.test(target.tagName) || isClosing)
      return;

    // animate closing
    displayElement.style.cssText += webkitify('transform:', getRect());
    changeCSS(container, pointerEventsAuto);

    // timeout to remove els from dom; use variable to avoid calling more than once
    timeout(removeContainer, 350);
    isClosing = true;
  }


  // remove the container / display element to the DOM before each open
  function removeContainer() {
    // remove container from DOM & clear inline style
    doc.body[removeEl](container);
    container[removeEl](displayElement);
    changeCSS(container, '');
    changeCSS(displayElement, '');

    // clear src of video / iframe elements
    if (displayElement === displayVideo)
      displayVideo.src = '';
    else if (displayElement === displaySiteVid)
      iframeSiteVid.src = '';

    // remove caption
    if (captionDisplayed) {
      container[removeEl](caption);
      changeCSS(caption, '');
      captionDisplayed = false;
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

  return BigPicture;

})();
