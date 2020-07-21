# ![logo](https://i.imgur.com/4O1IXsG.png) BigPicture.js [![npm][npm-image]][npm-url] [![File Size][size-image]][cdn-url]

[npm-image]: https://badgen.net/npm/v/bigpicture
[npm-url]: https://www.npmjs.com/package/bigpicture
[size-image]: https://badgen.net/badgesize/gzip/henrygd/bigpicture/master/dist/BigPicture.min.js
[cdn-url]: https://cdn.jsdelivr.net/npm/bigpicture/dist/BigPicture.min.js

![Example page screenshot](https://i.imgur.com/7T6dnN3.gif)

Vanilla JavaScript image / video viewer. Doesn't sit on the DOM when inactive.

##### [Check out the example page here](https://henrygd.me/bigpicture)

## Installation

Install via package manager or add a script from the [dist](dist) directory to your page. [CDN links are available via jsDelivr](https://www.jsdelivr.com/package/npm/bigpicture?path=dist).

```
npm install bigpicture
```

```javascript
// import
import BigPicture from 'bigpicture'

// or require
var BigPicture = require('bigpicture')
```

Or with a script tag:

```html
<script src="BigPicture.js"></script>
```

No additional CSS file is neccesary.

## Usage

When you want to open something, pass an object to `BigPicture` containing the element from which you want the animation to start, and other optional parameters depending on what you want to do. Examples below use `e.target` to refer to the trigger element being interacted with in the context of an event handler. You can use a different element if you want (for example, different buttons could be set up to open videos from the same central showcase element).

If your trigger element is an image or an element with a background image, you can open it directly by passing only `el`.

### Options

```js
BigPicture({
	// element from which animation starts (required)
	el: e.target,
	// image url
	imgSrc: 'https://yourimage.jpg',
	// video src (String) or sources (Array)
	vidSrc: ['https://yourvideo.mp4', 'https://yourvideo.webm'],
	// iframe embed URL
	iframeSrc: 'https://youriframe.html',
	// vimeo ID
	vimeoSrc: '119287310',
	// youtube ID
	ytSrc: 'z_PeaHVcohg',
	// use youtube-nocookie
	ytNoCookie: false,
	// audio URL
	audio: 'https://youraudio.mp3',
	// see below for more gallery options
	gallery: '#image_container',
	// attribute used to find gallery elements
	galleryAttribute: 'data-bp',
	// set custom dimensions for embeds / videos
	dimensions: [1920, 1080],
	// show or hide default loading indicator
	noLoader: false,
	// open animation callback
	animationStart: () => {},
	// open animation callback
	animationEnd: () => {},
	// close callback
	onClose: () => {},
	// gallery image change callback
	onChangeImage: () => {},
})
```

Assign to variable for more control

```javascript
var bp = BigPicture({...})

// close
bp.close()

// next gallery image
bp.next()

// previous gallery image
bp.prev()
```

### Remote video file

Multiple sources supported as of 1.4.0

```javascript
BigPicture({
	el: e.target,
	vidSrc: 'https://yourvideo.mp4',
	// or with multiple sources
	// vidSrc: ['https://yourvideo.mp4', 'https://yourvideo.webm']
})
```

### Youtube

Pass in the video ID from the url. For example, the ID for `https://www.youtube.com/watch?v=z_PeaHVcohg` would be `z_PeaHVcohg` (The `v` parameter in the address).

```javascript
BigPicture({
	el: e.target,
	ytSrc: 'z_PeaHVcohg',
})
```

### Vimeo

Like Youtube, pass in the video ID from the url. The ID for `https://vimeo.com/119287310` would be `119287310`.

```javascript
BigPicture({
	el: e.target,
	vimeoSrc: '119287310',
})
```

### iframe embed

Pass in the URL from the iframe.

```javascript
BigPicture({
	el: e.target,
	iframeSrc: 'https://youriframe.html',
})
```

### Audio

```javascript
BigPicture({
	el: e.target,
	audio: 'https://youraudio.mp3',
})
```

### Remote individual image

```javascript
BigPicture({
	el: e.target,
	imgSrc: 'https://yourimage.jpg',
})
```

### Galleries

Add a `data-bp` attribute to your elements with the image you want to open, and pass a selector string or NodeList to the function. The string should specify a container which has `data-bp` elements somewhere inside, whereas the NodeList should be the elements themselves.

The attribute name can be overridden with the `galleryAttribute` option as of 2.4.0. For instance, `galleryAttribute: 'src'` would open the thumbs in the example below, and the `data-bp` attributes would be unnecessary.

```html
<div id="image_container">
	<img src="photo1_thumb.jpg" data-bp="photo1.jpg" class="example" />
	<img src="photo2_thumb.jpg" data-bp="photo2.jpg" />
	<img src="photo3_thumb.jpg" data-bp="photo3.jpg" class="example" />
</div>
```

```javascript
// opens gallery w/ all three images
BigPicture({
	el: e.target,
	gallery: '#image_container',
})
```

```javascript
// opens gallery w/ the two images matching the selector
BigPicture({
	el: e.target,
	gallery: document.querySelectorAll('#image_container .example'),
})
```

Alternatively, you can pass in an array of objects. The gallery will go through these in order. Here's example code for the unsplash gallery on the [demo site](https://henrygd.me/bigpicture):

```javascript
var unsplashImages = ['meiying', 'clemono2', 'heftiba'].map(function (user) {
	return {
		src: 'https://source.unsplash.com/user/' + user + '/daily',
		// caption: 'This image is from unsplash'
	}
})
BigPicture({
	el: e.target,
	gallery: unsplashImages,
	// optionally specify a starting index
	position: 2,
})
```

You can also loop the gallery (next on last image gives you the first image, and vice versa).

```javascript
BigPicture({
	el: e.target,
	gallery: '#image_container',
	loop: true,
})
```

## Captions

To display a caption, add a `data-caption` attribute with the desired text or HTML to the trigger element itself.

```html
<img src="yourimage.jpg" data-caption="Example of an optional caption." />
```

## Optional callbacks

`animationStart` and `animationEnd` run at the start or end of the opening animation. `animationStart` will run even if there's an error, so it's okay to use if you want to hide your own custom loader.

`onClose` runs after closing animation finishes.

`onChangeImage` runs when a gallery image is changed and provides useful data about the current image.

```javascript
// example of how scrolling can be disabled using callbacks
BigPicture({
	el: e.target,
	animationStart: function () {
		// executed immediately before open animation starts
		document.documentElement.style.overflowY = 'hidden'
		document.body.style.overflowY = 'scroll'
	},
	animationEnd: function () {
		// executed immediately after open animation finishes
		console.log('it has opened')
	},
	onClose: function () {
		// executed immediately after close animation finishes
		document.documentElement.style.overflowY = 'auto'
		document.body.style.overflowY = 'auto'
	},
	onChangeImage: function (props) {
		// executed on gallery image change
		console.log('gallery image changed', props)
	},
})
```

## Hide default loading icon

If you're loading remote images or videos and don't want the default loading icon displayed, set `noLoader` to true.

```javascript
BigPicture({
	el: e.target,
	vimeoSrc: '119287310',
	noLoader: true,
})
```

## Change dimensions of embed / youtube / vimeo

By default, embeds are displayed in 16:9 aspect at a maximum of 1920px by 1080px. To change this, supply an array with width and height in pixels. Default is `[1920, 1080]`.

```javascript
BigPicture({
	el: e.target,
	ytSrc: 'X2lkvrMa27c',
	dimensions: [1226, 900],
})
```

## Error handling

You may override the default error alert for images, audio, and direct video links by passing an `onError` function.

```javascript
BigPicture({
	el: e.target,
	onError: function () {
		console.log('there was an error')
	},
})
```

## Troubleshooting

If the media or loading icon fails to display, it's probably a z-index issue. The media container has a default z-index of 9999, and the loading icon has a z-index of 9 relative to the trigger element's parent container.

---

License: MIT

All images found on Unsplash

Towers of Pfeiffer video by [Grant Porter](https://vimeo.com/grantporter) (CC-BY)

Music by [Nordgroove](https://icons8.com/music/author/nordgroove) via [icons8](https://icons8.com/music)
