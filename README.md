# Routebook

A small browser route notebook: import one GeoJSON LineString, inspect distance
and elevation, reverse the route, adjust a walking pace, and download a point-by-
point CSV. A module Web Worker calculates distances from transferred Float64Array
buffers. Its result buffer is transferred back. Route selection and pace survive
reload in localStorage; a fresh browser starts with the sample route.

Serve this directory over HTTP. There is no build step, backend, external font,
map service, or package dependency. `python3 -m http.server 8080` is sufficient.

Coordinates are longitude, latitude and optional elevation in metres. Accepted
input: a GeoJSON Feature with a LineString, 2–2,000 points, at most 256 KiB.
Distance uses a spherical Earth radius of 6,371,000 metres and excludes elevation;
ascent and descent sum successive elevation changes. Estimated minutes are
distance / selected speed plus ascent / 600 metres per hour. This is a simple
planning estimate. CSV distances are rounded to three decimal places.

The sample is synthetic. Uploaded routes remain in the browser. The app reports
a failed worker load and offers a retry, and ignores superseded worker replies.
Version 2 changes the release and explanatory copy, retaining the storage schema.
