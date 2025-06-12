declare namespace BigPicture {
	interface Instance {
		/**
		 * close
		 *
		 * @param e event
		 */
		close(e?: Event): void
		/**
		 * next gallery image
		 */
		next(): void
		/**
		 * previous gallery image
		 */
		prev(): void
		/**
		 * update dimensions
		 */
		updateDimensions(): void
		/**
		 * access to active display element (img, video, iframe wrapper div)
		 */
		display: Element
		/**
		 * options of active instance
		 */
		opts: Options
	}

	interface Options {
		/**
		 * element from which animation starts (required)
		 */
		el: Element,
		/**
		 * image url
		 */
		imgSrc?: string | undefined,
		/**
		 * video src (String) or sources (Array)
		 */
		vidSrc?: string | string[] | undefined,
		/**
		 * iframe embed URL
		 */
		iframeSrc?: string | undefined,
		/**
		 * vimeo ID
		 */
		vimeoSrc?: string | undefined,
		/**
		 * youtube ID
		 */
		ytSrc?: string | undefined,
		/**
		 * use youtube-nocookie
		 */
		ytNoCookie?: boolean | undefined,
		/**
		 * audio URL
		 */
		audio?: string | undefined,
		/**
		 * see below for more gallery options
		 */
		gallery?: string | undefined,
		/**
		 * attribute used to find gallery elements
		 */
		galleryAttribute?: string | undefined,
		/**
		 * set custom dimensions for embeds / videos
		 */
		dimensions?: [number, number] | undefined,
		/**
		 * show or hide default loading indicator
		 */
		noLoader?: boolean | undefined,
		/**
		 * customize the overlay color (any valid css color value)
		 */
		overlayColor?: string | undefined,
		/**
		 * open animation callback
		 */
		animationStart?: Function,
		/**
		 * open animation callback
		 */
		animationEnd?: Function,
		/**
		 * close callback
		 */
		onClose?: Function,
		/**
		 * gallery image change callback
		 */
		onChangeImage?: Function,
	}
}

declare function BigPicture(options: BigPicture.Options): BigPicture.Instance

export default BigPicture
export as namespace BigPicture