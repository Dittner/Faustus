//
//  NSFontExtension.swift
//  Faustus
//
//  Created by Alexander Dittner on 11.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI

enum FontName: String {
    case gothic = "Halja OT"
    case pragmatica = "PragmaticaBook-Reg"
    case pragmaticaLight = "PragmaticaLight"
    case pragmaticaLightItalics = "PragmaticaLight-Oblique"
    case pragmaticaExtraLight = "PragmaticaExtraLight-Reg"
    case pragmaticaExtraLightItalics = "PragmaticaExtraLight-Oblique"
    case pragmaticaSemiBold = "PragmaticaMedium"
    case pragmaticaBold = "PragmaticaBold-Reg"
    case mono = "PTMono-Regular"
    case georgia = "Georgia"
    case georgiaItalics = "Georgia-Italic"
    case georgiaBold = "Georgia-Bold"
}

extension NSFont {
    convenience init(name: FontName, size: CGFloat) {
        self.init(name: name.rawValue, size: size)!
    }

    func italics() -> NSFont {
        let descriptor = fontDescriptor.withFamily(familyName ?? fontName).withSymbolicTraits(.italic)
        return NSFont(descriptor: descriptor, size: pointSize) ?? self
    }

    func bold() -> NSFont {
        let descriptor = fontDescriptor.withFamily(familyName ?? fontName).withSymbolicTraits(.bold)
        return NSFont(descriptor: descriptor, size: pointSize) ?? self
    }
}

extension Font {
    static func custom(_ name: FontName, size: CGFloat) -> Font {
        Font.custom(name.rawValue, size: size)
    }

    static func printAllSystemFonts() {
        for family: String in NSFontManager.shared.availableFontFamilies {
            print("===\(family)===")
            for fontName: String in NSFontManager.shared.availableFonts {
                print("\(fontName)")
            }
        }
    }
}

extension NSTextView {
    static var defaultInsertionPointColor: NSColor {
        return NSColor.controlTextColor
    }

    static var defaultSelectedTextAttributes: [NSAttributedString.Key: Any] {
        return [
            .foregroundColor: NSColor.selectedTextColor,
            .backgroundColor: NSColor.selectedTextBackgroundColor,
        ]
    }
}
