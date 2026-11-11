import Vision
import CoreImage
import AppKit
// usage: cutout outdir file...  -> transparent PNG cropped to the subject, all foreground instances
let a=CommandLine.arguments; let out=a[1]; let ctx=CIContext(options:[.workingColorSpace:CGColorSpace(name:CGColorSpace.sRGB)!])
for f in a[2...] {
  let url=URL(fileURLWithPath:f); guard let ci=CIImage(contentsOf:url) else{continue}
  let h=VNImageRequestHandler(ciImage:ci); let r=VNGenerateForegroundInstanceMaskRequest()
  do{ try h.perform([r]); guard let o=r.results?.first else{print("nomask",f);continue}
    let px=try o.generateMaskedImage(ofInstances:o.allInstances,from:h,croppedToInstancesExtent:true)
    let img=CIImage(cvPixelBuffer:px)
    let n=url.deletingPathExtension().lastPathComponent
    try ctx.writePNGRepresentation(of:img,to:URL(fileURLWithPath:"\(out)/\(n).png"),format:.RGBA8,colorSpace:CGColorSpace(name:CGColorSpace.sRGB)!)
    print(n,Int(img.extent.width),Int(img.extent.height))
  }catch{print("err",f,error)}
}
