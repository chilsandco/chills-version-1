import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import AppKit
// usage: studio outdir file...  Keeps the photo's framing; replaces only the backdrop.
let a=CommandLine.arguments; let out=a[1]
let cs=CGColorSpace(name:CGColorSpace.sRGB)!; let ctx=CIContext(options:[.workingColorSpace:cs,.outputColorSpace:cs])
for f in a[2...] {
  let url=URL(fileURLWithPath:f); guard let ci=CIImage(contentsOf:url) else{continue}
  let h=VNImageRequestHandler(ciImage:ci); let r=VNGenerateForegroundInstanceMaskRequest()
  do{ try h.perform([r]); guard let o=r.results?.first else{print("nomask",f);continue}
    let px=try o.generateScaledMaskForImage(forInstances:o.allInstances,from:h)
    let mask=CIImage(cvPixelBuffer:px)
    let e=ci.extent
    // one seamless backdrop for every photo
    let g=CIFilter.radialGradient(); g.center=CGPoint(x:e.midX,y:e.height*0.72); g.radius0=Float(e.height*0.10); g.radius1=Float(e.height*0.95)
    g.color0=CIColor(red:0.975,green:0.970,blue:0.958); g.color1=CIColor(red:0.915,green:0.908,blue:0.888)
    let bg=g.outputImage!.cropped(to:e)
    let b=CIFilter.blendWithMask(); b.inputImage=ci; b.backgroundImage=bg; b.maskImage=mask
    let n=url.deletingPathExtension().lastPathComponent
    try ctx.writePNGRepresentation(of:b.outputImage!.cropped(to:e),to:URL(fileURLWithPath:"\(out)/\(n).png"),format:.RGBA8,colorSpace:cs)
    var total=0.0; let av=CIFilter.areaAverage(); av.inputImage=mask; av.extent=mask.extent
    var p=[UInt8](repeating:0,count:4); ctx.render(av.outputImage!,toBitmap:&p,rowBytes:4,bounds:CGRect(x:0,y:0,width:1,height:1),format:.RGBA8,colorSpace:nil); total=Double(p[0])/255
    print(n,String(format:"%.2f",total))
  }catch{print("err",f,error)}
}
