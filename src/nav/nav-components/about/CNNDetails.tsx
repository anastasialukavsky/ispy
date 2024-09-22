import React from 'react'

export default function CNNDetails() {
  return (
    <div>
      isapplication. The use of ELA methodology must always be considered very
      carefully. ELA Analysis Error Level Analysis is based on characteristics
      of image formats that are based on lossy image compression. This method
      can highlight areas of an image which has different degrees of
      compression. Especially the JPEG format (one of the most popular image
      formats on the Internet) can be applied particularly well using this
      method. The procedure is surprisingly simple. For a better understanding
      it is necessary to know how images in JPEG format are created. JPEG uses a
      lossy image compression. Each re-encoding process (new saving) performed
      on the image leads to further loss of quality. The JPEG algorithm is based
      on a 8x8 pixel grid. Each 8x8 square grid is thereby treated and
      compressed separately. If the image is untouched, then all these 8x8
      squares will show the same error level potential. If the jpeg image is
      saved again, then each square should be continuously reduced to
      approximately the same level. In the ELA process, the original image that
      is being examined will be resaved at a certain JPEG quality level (for
      example, at 75%). The resave leads to a known degree of compression, which
      extends over the entire image. The newly saved image is used to be
      compared with the original image. The human eye would hardly notice a
      change. Therefore, the ELA representation will visualize in particular
      only the difference between the two images. So, the resulting ELA image
      shows the varying degrees of compression potentials. image Click to
      enlarge this image Behind the method of detecting tampered JPG images
      stands the idea that if an image has been edited, then every 8x8 square
      that is affected by the change, comprises a higher error level potential
      than the rest of the image. Case Studies Even without manipulation an
      image, the ELA view will show different areas in original images that come
      to the fore. These natural characteristics have to be known, if you want
      to be able to prove manipulations using this approach. (However, Error
      Level Analysis also has its limitations. This will be explained in the
      following chapters.) The ELA view highlights the different compression
      potentials produced in an image. Areas with uniform color, such as a
      cloudless blue sky or a bright white wall showing dark ELA results
      compared to the strongly contrast edges areas that occur much brighter in
      appearance. image Click to enlarge this image Homogeneous image regions
      like the sky on the example photo of the Colosseum can be compressed
      efficiently. Due to this, the compression potential is low at a
      recompression cycle respectively in a new saving and results in darker
      color on the ELA view. By contrast, irregular patterns containing fine
      contours and complex color and brightness gradients will show just few
      redundancies, which can not be reduced so well. Repeated saving of a JPG
      image removes high-frequency parts of an image and reduces the differences
      between strongly contrasting edges, textures and surfaces. A JPG image
      that is stored in the lowest quality level is displayed accordingly much
      darker than at higher quality levels. image Click to enlarge this image A
      JPEG file that creates a custom Huffman table based on statistical
      analysis of the respective image content, is called Progressive JPEG.
      Images generated by digital cameras, however, are not optimized in this
      way. Original shots from digital cameras should always have a high degree
      of change after a new save and thus have relatively b
    </div>
  );
}
