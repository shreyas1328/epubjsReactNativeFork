export default `
<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EPUB.js</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
    <!--<script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script> -->
    <script>${process.env.EPUBJS}</script>

    <style type="text/css">
      body {
        margin: 0;
      }

      #viewer {
        height: 100vh;
        width: 100vw;
        overflow: hidden !important;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    </style>
  </head>

  <body oncopy='return false' oncut='return false'>
    <div id="viewer"></div>

    <script>
      var book;
      var rendition;

      const type = window.type;
      const file = window.book;
      const theme = window.theme;
      const initialLocations = window.locations;
      const enableSelection = window.enable_selection;

      function _ready() {

      if (!file) {
        alert('Failed load book');
      }

      try{
      if (type === 'epub' || type === 'opf' || type === 'binary') {
        window.book  = book = ePub(file);
      } else if (type === 'base64') {
        window.book = book = ePub(file, { encoding: "base64" });
      } else {
        alert('Missing file type');
      }
    }catch(ex){
      alert(ex.message)
    }

     window.rendition = rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
      });

      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "onStarted" }));

      book.ready
        .then(function () {
          if (initialLocations) {
            book.locations.load(initialLocations);
          } else book.locations.generate(1600);

          var displayed = rendition.display();

          displayed.then(function () {
            var viewer = document.getElementById("viewer");
            var currentLocation = rendition.currentLocation();

            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "onReady",
              totalLocations: book.locations.total,
              currentLocation: currentLocation,
              progress: book.locations.percentageFromCfi(currentLocation.start.cfi),
            }));
          });

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "onLocationsReady",
            epubKey: book.key(),
            locations: book.locations.save(),
          }));

          book.loaded.navigation.then(function (toc) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'onNavigationLoaded',
              toc: toc,
            }));
          });
        })
        .catch(function (err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "onDisplayError",
          reason: reason
        }));
      });

      rendition.on('started', () => {
        rendition.themes.register({ theme: theme });
        rendition.themes.select('theme');
      });

      rendition.on("relocated", function (location) {
        var percent = book.locations.percentageFromCfi(location.start.cfi);
        var percentage = Math.floor(percent * 100);

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "onLocationChange",
          totalLocations: book.locations.total,
          currentLocation: location,
          progress: percentage,
        }));

        if (location.atStart) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "onBeginning",
          }));
        }

        if (location.atEnd) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "onFinish",
          }));
        }
      });

      rendition.on("orientationchange", function (orientation) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onOrientationChange',
          orientation: orientation
        }));
      });

      rendition.on("rendered", function (section) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onRendered',
          section: section,
          currentSection: book.navigation.get(section.href),
        }));
      });

      rendition.on("layout", function (layout) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onLayout',
          layout: layout,
        }));
      });

      window.rendition.on("selected", function (cfi, contents) {
        rendition.annotations.add("highlight", cfi, {}, (e) => {
          console.log("highlight clicked", e.target);
        });

        contents.window.getSelection().removeAllRanges();
          book.getRange(cfi).then(function (range) {
            if (range) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'onSelected',
                cfiRange: cfi,
                text: range.toString(),
              }));
            }
          });
        });

        rendition.on("markClicked", function (cfiRange, contents) {
          rendition.annotations.remove(cfiRange, "highlight");
          book.getRange(cfiRange).then(function (range) {
            if (range) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'onMarkPressed',
                cfiRange: cfiRange,
                text: range.toString(),
              }));
            }
          });
        });

        rendition.on("resized", function (layout) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'onResized',
            layout: layout,
          }));
        });
      }


        window.addEventListener("load", _ready, false);

    </script>
  </body>
</html>
`;
