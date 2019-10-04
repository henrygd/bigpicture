# ![logo](https://i.imgur.com/4O1IXsG.png) BigPicture.js

![Example page screenshot](https://i.imgur.com/7T6dnN3.gif)

Lightweight (3.5 KB gzip) and framework independent JavaScript image / video viewer.

Supports Youtube, Vimeo, and direct video links.

Doesn't sit on the DOM when inactive.

##### [Check out the example page here](https://henrygd.me/bigpicture)

## Instructions

Install via npm or add a script from the [dist](dist) directory to your page. [CDN links are available via jsDelivr here](https://www.jsdelivr.com/package/npm/bigpicture?path=dist).

```
npm install bigpicture
```

```javascript
var BigPicture = require('bigpicture')
```

Or with a script tag:

```html
<script src="BigPicture.js"></script>
```

No additional CSS file is neccesary.

When you want to open something, pass an object to `BigPicture` containing the element from which you want the animation to start and an optional second parameter depending on what you want to do. Examples below use `this` to refer to the trigger element being interacted with in the context of an event handler. You can use a different element if you want (for example, different buttons could be set up to open videos from the same central showcase element).

##### Remote video file

Multiple sources supported as of 1.4.0

```javascript
BigPicture({
  el: this,
  vidSrc: 'http://yourvideo.mp4'
  // or with multiple sources
  // vidSrc: ['http://yourvideo.mp4', 'http://yourvideo.webm']
})
```

##### Youtube

Pass in the video ID from the url. For example, the ID for `https://www.youtube.com/watch?v=z_PeaHVcohg` would be `z_PeaHVcohg` (The `v` parameter in the address).

```javascript
BigPicture({
  el: this,
  ytSrc: 'z_PeaHVcohg'
})
```

##### Vimeo

Like Youtube, pass in the video ID from the url. The ID for `https://vimeo.com/119287310` would be `119287310`.

```javascript
BigPicture({
  el: this,
  vimeoSrc: '119287310'
})
```

##### iframe

Pass in the URL from the iframe.

```javascript
BigPicture({
  el: this,
  iframeSrc: 'http://youriframe.html'
})
```

##### Audio

```javascript
BigPicture({
  el: this,
  audio: 'http://youraudio.mp3'
})
```

##### Remote individual image

```javascript
BigPicture({
  el: this,
  imgSrc: 'http://yourimage.jpg'
})
```

##### Local images & background images

If your trigger element is an image or an element with a background image, you can open it directly by passing it alone.

```javascript
BigPicture({
  el: this
})
```

##### Galleries

Add a `data-bp` attribute to your elements with the image you want to open, and pass a selector string or NodeList to the function. The string should specify a container which has `data-bp` elements somewhere inside, whereas the NodeList should be the elements themselves.

```html
<div id="image_container">
  <img src="photo1_thumb.jpg" data-bp="photo1.jpg" class="example">
  <img src="photo2_thumb.jpg" data-bp="photo2.jpg">
  <img src="photo3_thumb.jpg" data-bp="photo3.jpg" class="example">
</div>
```

```javascript
// opens gallery w/ all three images
BigPicture({
  el: this,
  gallery: '#image_container'
})
```
```javascript
// opens gallery w/ the two images matching the selector
BigPicture({
  el: this,
  gallery: document.querySelectorAll('#image_container .example')
})
```

Alternatively, you can pass in an array of objects. The gallery will go through these in order. Here's example code for the unsplash gallery on the [demo site](https://henrygd.me/bigpicture):

```javascript
var unsplashImages = ['meiying', 'clemono2', 'heftiba'].map(function(user) {
  return {
    src: 'https://source.unsplash.com/user/' + user + '/daily'
    // caption: 'This image is from unsplash'
  }
})
BigPicture({
  el: this,
  gallery: unsplashImages,
  // optionally specify a starting index
  position: 2
})
```

You can also loop the gallery (next on last image gives you the first image, and vice versa).
```javascript
BigPicture({
  el: this,
  gallery: '#image_container',
  loop: true
})
```

## Captions

To display a caption, add a `data-caption` attribute with the desired text or HTML to the trigger element itself.

```html
<img src="yourimage.jpg" data-caption="Example of an optional caption."/>
```

## Optional callbacks

`animationStart` and `animationEnd` run at the start or end of the opening animation. `animationStart` will run even if there's an error, so it's okay to use if you want to hide your own custom loader. 

`onClose` runs after closing animation finishes.

`onChangeImage` runs when a gallery image is changed and provides useful data about the current image.

```javascript
// example of how scrolling can be disabled using callbacks
BigPicture({
  el: this,
  animationStart: function() {
    // executed immediately before open animation starts
    document.documentElement.style.overflowY = 'hidden'
    document.body.style.overflowY = 'scroll'
  },
  animationEnd: function() {
    // executed immediately after open animation finishes
    console.log('it has opened')
  },
  onClose: function() {
    // executed immediately after close animation finishes
    document.documentElement.style.overflowY = 'auto'
    document.body.style.overflowY = 'auto'
  },
  onChangeImage: function(props) {
    // executed on gallery image change
    console.log('gallery image changed', props)
  },
})
```

## Hide default loading icon

If you're loading remote images or videos and don't want the default loading icon displayed, set `noLoader` to true.

```javascript
BigPicture({
  el: this,
  vimeoSrc: '119287310',
  noLoader: true
})
```

## Error handling

You may override the default error alert for images, audio, and direct video links by passing an `onError` function.

```javascript
BigPicture({
  el: this,
  onError: function() {
    console.log('there was an error')
  }
})
```

### Troubleshooting

If the media or loading icon fails to display, it's probably a z-index issue. The media container has a default z-index of 9999, and the loading icon has a z-index of 9 relative to the trigger element's parent container.

---

License: MIT

All images found on Unsplash

Towers of Pfeiffer video by [Grant Porter](https://vimeo.com/grantporter) (CC-BY)

Music by [Nordgroove](https://icons8.com/music/author/nordgroove) via [icons8](https://icons8.com/music)