import AppKit
import CoreGraphics
import Foundation
import ImageIO

let output = URL(fileURLWithPath: CommandLine.arguments[1])
let size = Int(CommandLine.arguments[2])!
let scale = CGFloat(size) / 512
let colorSpace = CGColorSpace(name: CGColorSpace.sRGB)!
let bitmap = CGContext(
  data: nil,
  width: size,
  height: size,
  bitsPerComponent: 8,
  bytesPerRow: size * 4,
  space: colorSpace,
  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
)!

func roundedRect(_ rect: CGRect, radius: CGFloat, color: CGColor) {
  bitmap.setFillColor(color)
  bitmap.addPath(CGPath(roundedRect: rect, cornerWidth: radius, cornerHeight: radius, transform: nil))
  bitmap.fillPath()
}

func color(_ hex: UInt32) -> CGColor {
  CGColor(
    red: CGFloat((hex >> 16) & 0xff) / 255,
    green: CGFloat((hex >> 8) & 0xff) / 255,
    blue: CGFloat(hex & 0xff) / 255,
    alpha: 1
  )
}

roundedRect(CGRect(x: 0, y: 0, width: size, height: size), radius: 125 * scale, color: color(0x142550))
roundedRect(CGRect(x: 190 * scale, y: 300 * scale, width: 200 * scale, height: 42 * scale), radius: 21 * scale, color: color(0x7c8cff))
roundedRect(CGRect(x: 145 * scale, y: 235 * scale, width: 245 * scale, height: 42 * scale), radius: 21 * scale, color: color(0x2dd4bf))
roundedRect(CGRect(x: 185 * scale, y: 170 * scale, width: 180 * scale, height: 42 * scale), radius: 21 * scale, color: color(0xffd166))

let destination = CGImageDestinationCreateWithURL(output as CFURL, "public.png" as CFString, 1, nil)!
CGImageDestinationAddImage(destination, bitmap.makeImage()!, nil)
precondition(CGImageDestinationFinalize(destination))
