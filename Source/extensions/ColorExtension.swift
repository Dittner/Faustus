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
                           black05: Color(NSColor.F.black05),
                           white: Color(NSColor.F.white),
                           dark: Color(NSColor.F.dark),
                           gray: Color(NSColor.F.gray),
                           light: Color(NSColor.F.light),
                           author: Color(NSColor.F.author),
                           book: Color(NSColor.F.book),
                           tag: Color(NSColor.F.tag),
                           quote: Color(NSColor.F.quote),
                           quoteBG: Color(NSColor.F.quoteBG),
                           inputBG: Color(NSColor.F.inputBG),
                           red: Color(NSColor.F.red),
                           debugLines: Color(NSColor.F.debugLines),
                           modalViewBG: Color(NSColor.F.modalViewBG),
                           clear: Color(NSColor.F.clear),
                           green: Color(NSColor.F.green))

    init(_ genus: ConspectusGenus) {
        switch genus {
        case .user:
            self.init(NSColor.F.author)
        case .author:
            self.init(NSColor.F.author)
        case .book:
            self.init(NSColor.F.book)
        case .tag:
            self.init(NSColor.F.tag)
        }
    }

    init(rgb: UInt) {
        self.init(
            red: Double((rgb & 0xFF0000) >> 16) / 255.0,
            green: Double((rgb & 0x00FF00) >> 8) / 255.0,
            blue: Double(rgb & 0x0000FF) / 255.0
        )
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
                           black05: NSColor(rgb: 0, alpha: 0.5),
                           black025: NSColor(rgb: 0, alpha: 0.25),
                           white: NSColor(rgb: 0xFFFFFF, alpha: 1),
                           dark: NSColor(rgb: 0x282A2C, alpha: 1),
                           gray: NSColor(rgb: 0xC6C7CE, alpha: 1),
                           light: NSColor(rgb: 0xEBEAE3, alpha: 1),
                           author: NSColor(rgb: 0x6E3CAF, alpha: 1),
                           book: NSColor(rgb: 0xAD3D6B, alpha: 1),
                           tag: NSColor(rgb: 0xAD903D, alpha: 1),
                           quote: NSColor(rgb: 0xAFAFAF, alpha: 1),
                           quoteBG: NSColor(rgb: 0xF7F7F7, alpha: 1),
                           inputBG: NSColor(rgb: 0xF7F7F7, alpha: 1),
                           red: NSColor(rgb: 0xba003a, alpha: 1),
                           debugLines: NSColor(rgb: 0x00c3ff, alpha: 1),
                           modalViewBG: NSColor(rgb: 0x202223, alpha: 1),
                           clear: NSColor(rgb: 0x000000, alpha: 0.000001),
                           green: NSColor(rgb: 0x00774f, alpha: 1))
}
