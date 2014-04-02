# ribs

[![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Code Climate][codeclimate-image]][codeclimate-url] [![Dependency Status][gemnasium-image]][gemnasium-url] [![Gittip][gittip-image]][gittip-url]

<br>

<b>R</b>esponsive <b>I</b>mages <b>B</b>aked <b>S</b>erver-side, yummy!

<p align="center">
  <img width="703" height="404" src="http://farm8.staticflickr.com/7347/9538576837_488e0d89db_o.jpg" alt="Responsive image example">
  <br>
  <sup>Photo borrowed from talented <a href="http://500px.com/Sphaax">Kevin Racape</a>.</sup>
</p>

<br>

***RIBS is still at an early development stage and is not ready for production yet!***.

## Motivations

Responsive images is the next big challenge!

Some [client-side patterns] already exist along with [build tasks] in order to **produce**, **optimize**, **manage** and
**pick** the right image for the right screen size.

But they have several pitfalls.
The biggest one is that you often **load more that you are going to show**, wasting bandwidth, load time, device memory and CPU.

In the wild, this is not used as much as it should be. AFAIK this is probably because it asks a certain amount of time
to choose and implement a solution. It often involves too much tools and management in the process.
The fact is, developers don't take enough time for this and tend to neglect this part of a modern Web application.

I believe in the *on-the-fly* way of thinking that the Web can offer. So, you just ask the image you want,
and you receive it already processed, end of story.
This also guaranties that you:

- do not **load more than your are going to show**.
- do not **scale the image in CSS**.
- do not **load important images with javascript**.
- do not **handle each image sizes manually**.
- **do simply your workflow**.

*From [RESS slides]*.

Some great commercial services already exist to tackle this problem. But none of them is open source.
This needs to be available in the wild, with a good level of customization, so that Web developers
can leverage their images responsiveness.

[client-side patterns]: http://css-tricks.com/which-responsive-images-solution-should-you-use
[build tasks]: https://github.com/gruntjs/grunt-contrib-imagemin
[RESS slides]: http://fr.slideshare.net/4nd3rsen/ress-responsive-design-server-side-components-10084972

## Goals

*RIBS* will:

- Provide **on-the-fly** processed images (no build phase required).
- Be **blazing fast**!
- Be **super easy** to use and deploy.
- **Proxy** existing servers so you can offload image processing.
- **Optimize and transcode** images.
- Support **SPDY**.
- Fit **web apps** but also **native apps** needs.
- Offer plugins to various existing platforms such as **WordPress** or **Joomla**.
- Allow **to extensively customize it** so you can achieve precisely what you want.
- Support [art direction], automatically perhaps?.

[art direction]: http://usecases.responsiveimages.org/#art-direction

## Roadmap

 - `✓` Basic *Node* module.<br>
 - `✓` Command line interface.<br>
 - `✕` Plugins for **Grunt**, **Gulp**, ...<br>
 - `✕` *Express* middleware with an effecient caching system.<br>
 - `✕` Client-side library.<br>
 - `✕` New awesome features...

## Architecture

*RIBS* will offer several independent layers, that work well together:

- A native **Node** module that processes images:
  - **Fast** using [OpenCV] as backend.
  - **Extensible** via *custom operations*, *hooks* and *events*.
  - **Smart** ensuring always valid images are produced.
- An **Express** middleware that:
  - Expose a **REST API**.
  - **Proxy** existing servers.
  - **Cache** processed images smartly.
  - Support **clustering**.
- A **client-side** library to:
  - **Detect** device capabilities.
  - **Automatically** build URLs.

[OpenCV]: http://opencv.org

## Documentation

 - [CLI](https://github.com/ngryman/ribs/wiki/CLI)
 - [API REST](https://github.com/ngryman/ribs/wiki/API-REST)
 - Middleware
 - [Node module](https://github.com/ngryman/ribs/wiki/API-Node-module)
 - [C++](https://github.com/ngryman/ribs/wiki/API-cpp)

## Contact

 - Twitter: https://twitter.com/getribs
 - Mailing list: http://groups.google.com/group/getribs
 - Issues: https://github.com/ngryman/ribs/issues

[npm-image]: http://img.shields.io/npm/v/ribs.svg
[npm-url]: https://www.npmjs.org/package/ribs
[travis-image]: http://img.shields.io/travis/ngryman/ribs.svg
[travis-url]: https://travis-ci.org/ngryman/ribs
[codeclimate-image]: http://img.shields.io/codeclimate/github/ngryman/ribs.svg
[codeclimate-url]: https://codeclimate.com/github/ngryman/ribs
[gemnasium-image]: http://img.shields.io/gemnasium/ngryman/ribs.png
[gemnasium-url]: https://gemnasium.com/ngryman/ribs
[gittip-image]: http://img.shields.io/gittip/ngryman.svg
[gittip-url]: https://www.gittip.com/ngryman
