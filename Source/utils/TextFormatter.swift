//
//  TextFormatter.swift
//  Faustus
//
//  Created by Alexander Dittner on 11.06.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation

class TextFormatter {
    static func format(_ text: String, range: Range<String.Index>?) -> String {
        var res = text
        res = res.replacingOccurrences(of: "-\n", with: "  ", options: .caseInsensitive, range: range)
        res = res.replacingOccurrences(of: "\n", with: " ", options: .caseInsensitive, range: range)
        res = res.replacingOccurrences(of: " {2,}", with: " ", options: .regularExpression, range: nil)
        return res
    }
}
