//
//  NSColorExtension.swift
//  Faustus
//
//  Created by Alexander Dittner on 27.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI
extension Color {
    public static let F = (black: Color(NSColor.F.black),
                           white: Color(NSColor.F.white),
                           dark: Color(NSColor.F.dark),
                           gray: Color(NSColor.F.gray),
                           light: Color(NSColor.F.light),
                           author: Color(NSColor.F.author),
                           book: Color(NSColor.F.book),
                           tag: Color(NSColor.F.tag),
                           quote: Color(NSColor.F.quote),
                           quoteBg: Color(NSColor.F.quoteBg),
                           invalid: Color(NSColor.F.invalid))

    init(_ genus: ConspectusGenus) {
        switch genus {
        case .asAuthor:
            self.init(NSColor.F.author)
        case .asBook:
            self.init(NSColor.F.book)
        case .asTag:
            self.init(NSColor.F.tag)
        default:
            self.init(NSColor.F.black)
        }
    }
}

extension NSColor {
    convenience init(rgb: UInt, alpha: CGFloat = 1) {
        self.init(
            red: CGFloat((rgb & 0xFF0000) >> 16) / 255.0,
            green: CGFloat((rgb & 0x00FF00) >> 8) / 255.0,
            blue: CGFloat(rgb & 0x0000FF) / 255.0,
            alpha: alpha
        )
    }

    public static let F = (black: NSColor(rgb: 0, alpha: 1),
                           white: NSColor(rgb: 0xFFFFFF, alpha: 1),
                           dark: NSColor(rgb: 0x282A2C, alpha: 1),
                           gray: NSColor(rgb: 0xC6C7CE, alpha: 1),
                           light: NSColor(rgb: 0xEBEAE3, alpha: 1),
                           author: NSColor(rgb: 0x6E3CAF, alpha: 1),
                           book: NSColor(rgb: 0xAD3D6B, alpha: 1),
                           tag: NSColor(rgb: 0xAD903D, alpha: 1),
                           quote: NSColor(rgb: 0xAFAFAF, alpha: 1),
                           quoteBg: NSColor(rgb: 0xF7F7F7, alpha: 1),
                           invalid: NSColor(rgb: 0xDE1E5A, alpha: 1))
}
