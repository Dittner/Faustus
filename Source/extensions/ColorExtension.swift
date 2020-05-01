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
                           black01: Color(NSColor.F.black01),
                           black025: Color(NSColor.F.black025),
                           white: Color(NSColor.F.white),
                           dark: Color(NSColor.F.dark),
                           gray: Color(NSColor.F.gray),
                           light: Color(NSColor.F.light),
                           author: Color(NSColor.F.author),
                           book: Color(NSColor.F.book),
                           tag: Color(NSColor.F.tag),
                           quote: Color(NSColor.F.quote),
                           whiteBG: Color(NSColor.F.whiteBG),
                           redBG: Color(NSColor.F.redBG),
                           grayBG: Color(NSColor.F.grayBG),
                           red: Color(NSColor.F.red),
                           debugLines: Color(NSColor.F.debugLines),
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
        case .quote:
            self.init(NSColor.F.quote)
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
                           black01: NSColor(rgb: 0, alpha: 0.1),
                           black025: NSColor(rgb: 0, alpha: 0.25),
                           white: NSColor(rgb: 0xFFFFFF, alpha: 1),
                           dark: NSColor(rgb: 0x202223, alpha: 1),
                           gray: NSColor(rgb: 0xC6C7CE, alpha: 1),
                           light: NSColor(rgb: 0xEBEAE3, alpha: 1),
                           author: NSColor(rgb: 0x6E3CAF, alpha: 1),
                           book: NSColor(rgb: 0xAD3D6B, alpha: 1),
                           tag: NSColor(rgb: 0xC19C49, alpha: 1),
                           quote: NSColor(rgb: 0x000000, alpha: 1),
                           whiteBG: NSColor(rgb: 0xF8F8F8, alpha: 1),
                           redBG: NSColor(rgb: 0xF4EFF1, alpha: 1),
                           grayBG: NSColor(rgb: 0xF0F0F0, alpha: 1),
                           red: NSColor(rgb: 0xBA003A, alpha: 1),
                           debugLines: NSColor(rgb: 0x00C3FF, alpha: 1),
                           clear: NSColor(rgb: 0x000000, alpha: 0.000001),
                           green: NSColor(rgb: 0x00774F, alpha: 1))
}
