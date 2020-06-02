import { terser } from 'rollup-plugin-terser'
import buble from '@rollup/plugin-buble'
import size from 'rollup-plugin-size'

const production = !process.env.ROLLUP_WATCH

export default production
	? [
			{
				input: 'src/BigPicture.js',
				output: {
					strict: false,
					sourcemap: false,
					format: 'cjs',
					file: 'index.js',
				},
				plugins: [buble()],
			},
			{
				input: 'src/BigPicture.js',
				output: {
					strict: false,
					sourcemap: false,
					format: 'iife',
					name: 'BigPicture',
					file: 'dist/BigPicture.js',
				},
				plugins: [buble()],
			},
			{
				input: 'src/BigPicture.js',
				output: {
					strict: false,
					sourcemap: false,
					format: 'iife',
					name: 'BigPicture',
					file: 'dist/BigPicture.min.js',
				},
				plugins: [
					buble(),
					terser({
						compress: {
							booleans_as_integers: true,
							pure_getters: true,
						},
					}),
					size(),
				],
			},
	  ]
	: {
			input: 'src/BigPicture.js',
			output: {
				sourcemap: true,
				format: 'iife',
				name: 'BigPicture',
				file: 'example_page/js/BigPicture.js',
				strict: false,
			},
			plugins: [
				buble(),
				terser({
					compress: {
						booleans_as_integers: true,
						pure_getters: true,
					},
				}),
			],
	  }
