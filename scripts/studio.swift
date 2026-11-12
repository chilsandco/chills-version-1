import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import AppKit
// usage: studio outdir file...  Re-sets each photo on one seamless studio backdrop.
// - Keeps only the main subject (the largest foreground instance), so props such as a laptop or mug
//   never float on the backdrop.
// - When the subject is cut off at the bottom by a desk or table, the photo is re-framed chest-up
//   (cropped just below the subject) and placed on a full 2:3 backdrop, so it reads as a portrait.
// Prints: name, subject share of the frame, and "full" or "reframed".
let a = CommandLine.arguments; let out = a[1]
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CIContext(options: [.workingColorSpace: cs, .outputColorSpace: cs])

func backdrop(_ e: CGRect) -> CIImage {
  let g = CIFilter.radialGradient(); g.center = CGPoint(x: e.midX, y: e.height * 0.72)
  g.radius0 = Float(e.height * 0.10); g.radius1 = Float(e.height * 0.95)
  g.color0 = CIColor(red: 0.975, green: 0.970, blue: 0.958); g.color1 = CIColor(red: 0.915, green: 0.908, blue: 0.888)
  return g.outputImage!.cropped(to: e)
}

/// Bounding box (in image coordinates, origin bottom-left) of mask pixels above 50%, plus the mask's mean.
func maskBox(_ mask: CIImage, _ e: CGRect) -> (CGRect, Double) {
  let w = 120, h = Int(Double(w) * e.height / e.width)
  let scaled = mask.transformed(by: CGAffineTransform(scaleX: CGFloat(w) / e.width, y: CGFloat(h) / e.height))
  var px = [UInt8](repeating: 0, count: w * h * 4)
  ctx.render(scaled, toBitmap: &px, rowBytes: w * 4, bounds: CGRect(x: 0, y: 0, width: w, height: h), format: .RGBA8, colorSpace: nil)
  var minX = w, minY = h, maxX = -1, maxY = -1, sum = 0
  for y in 0..<h { for x in 0..<w { let v = Int(px[(y * w + x) * 4]); sum += v
    if v > 127 { minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y) } } }
  if maxX < 0 { return (.zero, 0) }
  // bitmap rows run top-down; convert to bottom-left image coordinates
  let sx = e.width / CGFloat(w), sy = e.height / CGFloat(h)
  let box = CGRect(x: CGFloat(minX) * sx, y: CGFloat(h - 1 - maxY) * sy, width: CGFloat(maxX - minX + 1) * sx, height: CGFloat(maxY - minY + 1) * sy)
  return (box, Double(sum) / Double(w * h * 255))
}

for f in a[2...] {
  let url = URL(fileURLWithPath: f); guard let ci = CIImage(contentsOf: url) else { print("unreadable", f); continue }
  let handler = VNImageRequestHandler(ciImage: ci); let req = VNGenerateForegroundInstanceMaskRequest()
  do {
    try handler.perform([req])
    guard let obs = req.results?.first, !obs.allInstances.isEmpty else { print("nomask", f); continue }
    let e = ci.extent
    // the main subject: the instance covering the most of the frame
    var best: (Int, CIImage, Double, CGRect)? = nil
    for i in obs.allInstances {
      let px = try obs.generateScaledMaskForImage(forInstances: IndexSet(integer: i), from: handler)
      let m = CIImage(cvPixelBuffer: px); let (box, share) = maskBox(m, e)
      if best == nil || share > best!.2 { best = (i, m, share, box) }
    }
    let (_, mask, share, box) = best!
    let blended = CIFilter.blendWithMask(); blended.inputImage = ci; blended.backgroundImage = backdrop(e); blended.maskImage = mask
    var result = blended.outputImage!.cropped(to: e); var mode = "full"
    // subject cut off above the bottom edge (hidden by a desk): re-frame chest-up on a full backdrop
    if box.minY > e.height * 0.04 {
      mode = "reframed"
      let crop = CGRect(x: 0, y: max(0, box.minY - e.height * 0.01), width: e.width, height: e.height - max(0, box.minY - e.height * 0.01))
      let part = result.cropped(to: crop).transformed(by: CGAffineTransform(translationX: 0, y: -crop.minY))
      // scale the kept part to fill the frame width-wise at most 1.25x, anchored to the bottom, centred
      let scale = min(1.25, e.height / crop.height * 0.92)
      let sc = part.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
      let dx = (e.width - e.width * scale) / 2
      let placed = sc.transformed(by: CGAffineTransform(translationX: dx, y: 0))
      result = placed.composited(over: backdrop(e)).cropped(to: e)
    }
    let n = url.deletingPathExtension().lastPathComponent
    try ctx.writePNGRepresentation(of: result, to: URL(fileURLWithPath: "\(out)/\(n).png"), format: .RGBA8, colorSpace: cs)
    print(n, String(format: "%.2f", share), mode)
  } catch { print("err", f, error) }
}
