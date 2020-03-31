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
    case pragmaticaSemiBold = "PragmaticaMedium"
    case pragmaticaBold = "PragmaticaBold-Reg"
}

extension NSFont {
    convenience init(name: FontName, size: CGFloat) {
        self.init(name: name.rawValue, size: size)!
    }
}

extension Font {
    static func custom(_ name: FontName, size: CGFloat) -> Font {
        Font.custom(name.rawValue, size: size)
    }
    
    static func printAllFonts() {
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

    static var defaultSelectedTextAttributes: [NSAttributedString.Key : Any] {
        return [
            .foregroundColor: NSColor.selectedTextColor,
            .backgroundColor: NSColor.selectedTextBackgroundColor
        ]
    }
}
