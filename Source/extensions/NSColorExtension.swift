//
//  NSColorExtension.swift
//  Faustus
//
//  Created by Alexander Dittner on 27.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import SwiftUI
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
                           dark: NSColor(rgb: 0x323035, alpha: 1),
                           light: NSColor(rgb: 0xEBEAE3, alpha: 1),
                           invalid: NSColor(rgb: 0xDE1E5A, alpha: 1))
}
