# ribs [![Version](http://img.shields.io/badge/version-0.0.0-brightgreen.svg)](https://github.com/ngryman/ribs/blob/master/CHANGELOG.md)

[![NPM](http://img.shields.io/npm/v/ribs.svg)](https://www.npmjs.org/package/ribs)
[![Dependency Status](http://img.shields.io/gemnasium/ngryman/ribs.png)](https://gemnasium.com/ngryman/ribs)
[![Gittip](http://img.shields.io/gittip/ngryman.svg)](https://www.gittip.com/ngryman/)

**R**esponsive **I**mages **B**aked **S**erver-side, yummy!

<p align="center">
  <img width="703" height="404" src="http://farm8.staticflickr.com/7347/9538576837_488e0d89db_o.jpg" alt="Responsive image example">
  <br>
  <sup>Photo borrowed from talented <a href="http://500px.com/Sphaax">Kevin Racape</a>.</sup>
</p>

<h2 align="center">
<a name="----give-a-feedback-on-the-api-proposal--" class="anchor" href="#----give-a-feedback-on-the-api-proposal--"><span class="octicon octicon-link"></span></a>
  &gt;&gt;
  <a href="https://github.com/ngryman/ribs/wiki/API">Give a feedback on the API proposal</a>
  &lt;&lt;
</h2>

## Motivations

Responsive images is the next big challenge.

Some [client-side patterns] already exist along with [build tasks] in order to **produce**, **optimize**, **manage** and
**pick** the right image for the right screen size.

In the wild, this is not as much used as it should be. AFAIK this is probably because it asks a certain amount of time
to choose and apply a technique and it involves too much tools in the process. The fact is, developpers don't take enough time for this and tend to neglect this part of an application.

I believe in the *on-the-fly* way of thinking that the Web offers. So, for this problem, just ask the image you want,
and you will receive it already processed, end of story.
This also have to garanty that you:
- do not **load more than your are going to show**.
- do not **scale the image in CSS**.
- do not **load important images with javascript**.
- do not **handle each image sizes manually**.
- **do simply your workflow**.

From [RESS slides].

This is pretty much what [Sencha.io Src] offers. It needs to be available in the wild, with a good level of
customization.

[client-side patterns]: http://css-tricks.com/which-responsive-images-solution-should-you-use
[build tasks]: https://github.com/gruntjs/grunt-contrib-imagemin
[Sencha.io Src]: http://www.sencha.com/learn/how-to-use-src-sencha-io
[RESS slides]: http://fr.slideshare.net/4nd3rsen/ress-responsive-design-server-side-components-10084972

## It must and it will

- Provide **on-the-fly** resized / croped and optimized images (no build phase required).
- Fit **web app** and also **native apps** needs.
- **Proxy** existing servers.
- Be **super easy** to deploy and use.
- Propose **different points of customization** to be as interop as it can be.
- Support [art direction], automatically perhaps?.

[art direction]: http://usecases.responsiveimages.org/#art-direction

## Concretely

**RIBS** will have 3 layers:
- a **node** library that manipulates images to:
  - resize them.
  - convert them on the fly.
  - crop them.
  - ... doing image suff.
- a **connect** / **express** middleware that:
  - parses URL following an **API** and call the library accordingly.
  - is able to proxy an image request.
- a client library to:
  - automatically set some URL parameters.
  - load images src.
  - apply `data-` attributes to customize URL fragments.

## Roadmap

### First

- Develop basic **node** library with modularity in mind.
- Develop basic middleware.

### Then

- Delop clien library.
- Support sharding.
- Adjust API and existing stuff.
  - Support `Stream2` API.

### Next

- Implement a good solution to art direction.
- Propose other middlewares for other servers: **Apache**, **Nginx**, **IIS**, ...

## API

The **API** would be very similar to **Sencha.io Src**:

```
http://[s[shard]].yourdomain.tld
	[/flush]
	[/data]
	[/format[quality]]
	[/orientation]
	[/width[/height]]
	[/art]
	/url
```
Where:

- `shard` *(optional)*. A number between 1 and 4, to distribute loading across subdomains (`s1`, `s2`, `s3`, `s4`).
- `flush` *(optional)*. If `flush` then original image is refetched and its cached copy updated.
- `data` *(optional)*. If `data` then returns a data URL. Also takes a callback suffix and arguments for JSON-P use.
- `format` *(optional)*. This is either jpg or png. Defaults to the original image format.
- `quality` *(optional)*. When the format is jpg, a compression value from 1 to 100. Defaults to 85.
- `orientation` *(optional)*. If 'landscape' or 'portrait', this will swap X/Y constraints if required. Defaults to no effect. 'detect' is experimental to use window.orientation if present.
- `width` *(optional)*. A width in pixels (which overrides the adaptive- or family-sizing). Can also contain formulaic adjustment.
- `height` *(optional)*. A height in pixels, if width is also present. Can also contain formulaic adjustment.
- `art` *(optional)*. A focus point or area in pixels. *To specify*.
- `url` *(required)*. The absolute path of the original image. It must start with http://

**Formulaic adjustments use the following operators:**

- `-`	deduct value
- `x`	multiply by percentage
- `a`	add value
- `r`	round down to the nearest...
- `m`	maximum for mobile browser
- `n`	maximum for non-mobile browser

When using the client library, the following client-side measurements (or their abbreviations) are available at the
start of the width of height parameters:

**Measurement Abbreviation:**

- screen.width:			`sw`
- screen.height:		`sh`
- screen.availWidth:		`saw`
- screen.availHeight:		`sah`
- window.outerWidth:		`wow`
- window.outerHeight:		`woh`
- window.innerWidth:		`wiw`
- window.innerHeight:		`wih`
- document.body.clientWidth:	`bcw`
- document.body.clientHeight:	`bch`
- document.body.offsetHeight:	`boh`
- document.body.offsetWidth:	`bow`

*To specify...*

## Contact

- Twitter: https://twitter.com/getribs
- Mailing list: http://groups.google.com/group/getribs
- Issues: https://github.com/ngryman/ribs/issues
