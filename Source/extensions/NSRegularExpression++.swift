//
//  NSRegularExpressionExtension.swift
//  Faustus
//
//  Created by Alexander Dittner on 12.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation
extension NSRegularExpression {
    func matches(_ string: String) -> Bool {
        let range = NSRange(location: 0, length: string.utf16.count)
        return firstMatch(in: string, options: [], range: range) != nil
    }
    
    func fullMatches(_ string: String) -> Bool {
        let range = NSRange(location: 0, length: string.utf16.count)
        return firstMatch(in: string, options: .reportCompletion, range: range) != nil
    }
}
