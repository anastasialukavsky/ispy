

export default function ELADetails() {
  return (
    <article className='text-primary-light-fill pt-7 min-h-screen w-full'>
      <h3 className='text-primary-light-fill text-2xl pb-1 text-center'>
        Introduction
      </h3>
      <p>
        One of the problem aspects in digital image forensics is the explanation
        of technical issues that are difficult to understand for laypeople. Even
        if the evidence of tampering is completely clear, pure technical papers
        are not comprehensible for the general public. There is the likelihood
        that sprawling complex description texts will not create acceptance. In
        the worst case, it causes an offensive negative attitude.
        <br />
        <br />
        The most accepted and widely understandable method that also provides
        many starting points for laypeople, is the detection of simple image
        compositions that can be found by the reverse image search function
        using major search engine providers. To see exactly where and in what
        manner a manipulation has been performed, is universally accepted as
        most persuasive evidence.
        <br />
        <br />
        For reconnaissance work that involves the public, visualization is one
        of the most effective means but it does not have to be the best. A
        visual method which has found its way in digital image forensics is
        called Error Level Analysis. However, there is a risk of misapplication.
        The use of ELA methodology must always be considered very carefully.
      </p>
      <h3 className='text-primary-light-fill text-2xl pt-4 pb-1 text-center'>
        ELA Analysis
      </h3>
      <p>
        Error Level Analysis is based on characteristics of image formats that
        are based on lossy image compression. This method can highlight areas of
        an image which has different degrees of compression. Especially the JPEG
        format (one of the most popular image formats on the Internet) can be
        applied particularly well using this method. The procedure is
        surprisingly simple.
      </p>
      <br />
      <br />
      <p>
        For a better understanding it is necessary to know how images in JPEG
        format are created. JPEG uses a lossy image compression. Each
        re-encoding process (new saving) performed on the image leads to further
        loss of quality. The JPEG algorithm is based on a 8x8 pixel grid. Each
        8x8 square grid is thereby treated and compressed separately. If the
        image is untouched, then all these 8x8 squares will show the same error
        level potential.
      </p>
      <br />
      <br />
      <p>
        If the jpeg image is saved again, then each square should be
        continuously reduced to approximately the same level. In the ELA
        process, the original image that is being examined will be resaved at a
        certain JPEG quality level (for example, at 75%). The resave leads to a
        known degree of compression, which extends over the entire image. The
        newly saved image is used to be compared with the original image. The
        human eye would hardly notice a change. Therefore, the ELA
        representation will visualize in particular only the difference between
        the two images. So, the resulting ELA image shows the varying degrees of
        compression potentials.
      </p>
      <div className='w-full flex justify-center py-5'>
        <img
          src='/assets/ela_method_en.jpg'
          alt=''
          className='object-cover h-[40vh]'
        />
      </div>
      <p>
        Behind the method of detecting tampered JPG images stands the idea that
        if an image has been edited, then every 8x8 square that is affected by
        the change, comprises a higher error level potential than the rest of
        the image.
      </p>
      <h3 className='text-primary-light-fill text-2xl pt-4 pb-1 text-center'>
        Case Studies
      </h3>
      <p>
        Even without manipulation an image, the ELA view will show different
        areas in original images that come to the fore. These natural
        characteristics have to be known, if you want to be able to prove
        manipulations using this approach. (However, Error Level Analysis also
        has its limitations. This will be explained in the following chapters.)
        The ELA view highlights the different compression potentials produced in
        an image. Areas with uniform color, such as a cloudless blue sky or a
        bright white wall showing dark ELA results compared to the strongly
        contrast edges areas that occur much brighter in appearance.
      </p>
      <div className='w-full flex justify-center py-5'>
        <img
          src='/assets/colo_1_en.jpg'
          alt=''
          className='object-cover w-[30vw]'
        />
      </div>
      <p>
        Homogeneous image regions like the sky on the example photo of the
        Colosseum can be compressed efficiently. Due to this, the compression
        potential is low at a recompression cycle respectively in a new saving
        and results in darker color on the ELA view. By contrast, irregular
        patterns containing fine contours and complex color and brightness
        gradients will show just few redundancies, which can not be reduced so
        well. Repeated saving of a JPG image removes high-frequency parts of an
        image and reduces the differences between strongly contrasting edges,
        textures and surfaces. A JPG image that is stored in the lowest quality
        level is displayed accordingly much darker than at higher quality
        levels.
      </p>
      <div className='w-full flex justify-center py-5'>
        <img
          src='/assets/colo_2_en.jpg'
          alt=''
          className='object-cover w-[30vw]'
        />
      </div>
      <p>
        A JPEG file that creates a custom Huffman table based on statistical
        analysis of the respective image content, is called Progressive JPEG.
        Images generated by digital cameras, however, are not optimized in this
        way. Original shots from digital cameras should always have a high
        degree of change after a new save and thus have relatively bright areas
        in the ELA result. The very dark ELA result in the image example
        (showing the Colosseum) that has been stored in lower quality level, is
        a clearly recognizable indication that this image is in no way an
        original JPEG file that was downloaded directly from the camera.
      </p>
      <h3 className='text-primary-light-fill text-2xl pt-4 pb-1 text-center'>
        Pitfals
      </h3>
      <p>
        It is crucial to know the source from where an image comes from. A
        critical error in dealing with ELA methodology which is also evident in
        the Bellingcat report, is the use of an obviously prepared image
        template and not an original satellite image.
      </p>
      <h3 className='text-primary-light-fill text-2xl pt-4 pb-1 text-center'>
        Enforced answers
      </h3>
      <p>
        The Bellingcat working group would have been better off if they had
        avoided any details associated with the use of ELA methodology. ELA
        results have finally no probative value. Instead, subjective evaluations
        entice to classic mistakes that sets an expected conclusion as the only
        solution in such investigations. Likewise, it may happen that there are
        no evidences for or against a willfully executed manipulation. Yes or no
        are not the only answer options.
      </p>
      <h3 className='text-primary-light-fill text-2xl pt-4 pb-1 text-center'>
        Real or authentic?
      </h3>
      <p>
        If there is no information about the origin of the examined images,
        Error Level Analysis can not serve a binding statement as to whether an
        image is real or authentic. The logical distinction between these two
        cases is too often left unconsidered in connection with interpretations
        of ELA results. Indications of changes must be considered in the overall
        context. Selectively conducted graphical edits in the photo material
        could also simply have served to make them visually more recognizable,
        without distorting the general state of affairs. ELA methodology alone
        can not resolve this distinction.
      </p>
      <h3 className='text-primary-light-fill text-2xl pt-4 pb-1 text-center'>
        Limitations
      </h3>
      <p>
        Compromising traces of manipulative image editing can be very easily
        removed in order to be immune to the ELA methodology. Unambiguous
        conviction through Error Level Analysis are also proof of amateurish
        workmanship of the counterfeiter comparable with the leave of
        fingerprints of the culprit at the scene.
      </p>
      <h3 className='text-primary-light-fill text-2xl pt-4 pb-1 text-center'>
        Imagery from social platforms
      </h3>
      <p>
        Image material, mostly from various social platforms (like Facebook,
        Twitter, and others), are in particular unusable for ELA tests. When you
        upload the photos to online services, the photos are not applied by them
        in the original form. The online services in general create a complete
        new copy in a low quality version. This newly conducted encoding further
        reduces existing compression potentials.
      </p>
        <div className='w-full flex justify-center py-5'>

      <img
        src='/assets/fake_ufo_ela_results_en.jpg'
        alt=''
        className='object-cover w-[30vw]'
        />
        </div>
      <p className='pb-20'>
        However, more things happen. Most of the meta information that existed
        in the original uploaded images have been removed. As a result, this
        will eliminate several different forensic examination criteria. At
        least, examination of the data structure and checking the ELA result can
        clearly determine that such images are not original camera image files.
      </p>
    </article>
  );
}
