# ![logo](https://i.imgur.com/4O1IXsG.png) BigPicture.js

![Example page screenshot](https://i.imgur.com/7T6dnN3.gif)

Lightweight (3 KB gzip) and framework independent JavaScript image / video viewer.

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

The script is all that's needed -- no additional CSS file.

When you want to open something, pass an object to `BigPicture` containing the element from which you want the animation to start and an optional second parameter depending on what you want to do. Examples below use `this` to refer to the trigger element being interacted with in the context of an event handler. You can use a different element if you want (for example, different buttons could be set up to open videos from the same central showcase element).

##### Remote video file

```javascript
BigPicture({
	el: this,
	vidSrc: 'http://yourvideo.mp4'
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

Pass in an element like normal with a selector string of the parent container. The gallery will use all elements within the container that have the attribute `data-bp` and set the value of that attribute as the displayed image.

```html
<!-- example html for script below -->
<div id="image_container">
	<a href="photo1.jpg">
		<img data-bp="photo1.jpg" src="photo1_thumb.jpg">
	</a>
	<a href="photo2.jpg">
		<img data-bp="photo2.jpg" src="photo2_thumb.jpg">
	</a>
</div>
```

```javascript
// example script for html above
var imageLinks = document.querySelectorAll('#image_container a')
for (var i = 0; i < imageLinks.length; i++) {
	imageLinks[i].addEventListener('click', function(e) {
		e.preventDefault()
		BigPicture({
			el: e.target,
			gallery: '#image_container'
		})
	})
}
```

Alternatively, you can pass in an array of objects. The gallery will go through these in order. You can include an `el` value if you want an image to close into a specific element, but this should only be done if you're providing an `el` value for every image. Here's example code for the unsplash gallery on the [demo site](https://henrygd.me/bigpicture), which opens and closes into a single button:

```javascript
var unsplashImages = ['meiying', 'clemono2', 'heftiba'].map(function(user) {
	return {
		src: 'https://source.unsplash.com/user/' + user + '/daily'
		// caption: 'This image is from unsplash'
		// el: el
	}
})
document.getElementById('unsplash_gallery').onclick = function() {
	BigPicture({
		el: this,
		gallery: unsplashImages
	})
}
```

## Captions

To display a caption, add a caption attribute with the desired text or HTML to the trigger element itself.

```html
<img src="yourimage.jpg" caption="Example of an optional caption."/>
```

## Optional callbacks

To execute specified functions at the start or end of the opening animation, pass them in as `animationStart` or `animationEnd`. `animationStart` will run even if there's an error, so it's okay to use if you want to hide your own custom loader.

```javascript
BigPicture({
	el: this,
	// executed immediately before open animation starts
	animationStart: function() {
		console.log('it is opening')
	},
	// executed immediately after open animation finishes
	animationEnd: function() {
		console.log('it has opened')
	}
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

### Troubleshooting

If the media or loading icon fails to display, it's probably a z-index issue. The media container has a default z-index of 9999, and the loading icon has a z-index of 9 relative to the trigger element's parent container.

---

License: MIT
