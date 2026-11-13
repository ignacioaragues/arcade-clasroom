# City art pass

city-panorama.png: original generated game background, created for this project with OpenAI image generation. It is kept locally; gameplay does not depend on an image-generation service or third-party CDN. The original output remains in the workspace generated_images folder.

roof.svg, chimney.svg and balcony.svg: original local vector game props created for this project. Their top edge at y=0 corresponds to the collision surface; facades below it are decorative.

This is the first illustrated area, not a claim that all nine areas have finished artwork. The panorama is mirrored on alternate tiles to keep the repeat edge continuous, scrolls at 16% of camera speed, and crossfades with the next area's landscape. Gameplay awaits image decoding, with procedural fallback if an asset cannot be loaded.
